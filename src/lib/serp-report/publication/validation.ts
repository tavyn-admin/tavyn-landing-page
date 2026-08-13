import { createHash, timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";

import {
  LOCAL_PUBLICATION_ORIGIN,
  MAX_ARTIFACT_BYTES,
  publicationIngestRequestSchema,
  type PublicationIngestRequest,
} from "./contract";
import {
  RenderableArtifactValidationError,
  validateRenderableSerpReportArtifact,
} from "./renderability";

const DOMAIN_LABEL_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const IDEMPOTENCY_NAMESPACE = "tavyn-serp-publication-v1";
const MINIMUM_TOKEN_BYTES = 32;
const MAXIMUM_TOKEN_BYTES = 4_096;
const MAXIMUM_AUTHORIZATION_BYTES = MAXIMUM_TOKEN_BYTES + Buffer.byteLength("Bearer ", "utf8");
const BEARER_SAFE_TOKEN_PATTERN = /^[\x21-\x7e]+$/u;

export class PublicationValidationError extends Error {
  constructor(
    readonly code:
      | "invalid_request"
      | "artifact_hash_mismatch"
      | "idempotency_key_mismatch",
    message: string,
    readonly fields?: string[]
  ) {
    super(message);
    this.name = "PublicationValidationError";
  }
}

function canonicalizeJsonValue(value: unknown): string {
  if (value === null) {
    return "null";
  }

  if (typeof value === "string" || typeof value === "boolean") {
    return JSON.stringify(value);
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new PublicationValidationError("invalid_request", "Artifact numbers must be finite JSON values.", [
        "artifact",
      ]);
    }

    return Object.is(value, -0) ? "0" : JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(canonicalizeJsonValue).join(",")}]`;
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalizeJsonValue(record[key])}`)
      .join(",")}}`;
  }

  throw new PublicationValidationError("invalid_request", "Artifact must contain only JSON values.", ["artifact"]);
}

export function canonicalizeArtifact(artifact: unknown): string {
  return canonicalizeJsonValue(artifact);
}

export function computeArtifactSha256(artifact: unknown): string {
  return createHash("sha256").update(canonicalizeArtifact(artifact), "utf8").digest("hex");
}

export function computePublicationIdempotencyKey(input: {
  sourceJobId: string;
  reportId: string;
  slug: string;
  artifactSha256: string;
}): string {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u.test(input.sourceJobId)) {
    throw new PublicationValidationError(
      "invalid_request",
      "Source job ID must use canonical lowercase UUID text.",
      ["sourceJobId"]
    );
  }
  const material = [
    IDEMPOTENCY_NAMESPACE,
    input.sourceJobId,
    input.reportId,
    input.slug,
    input.artifactSha256,
  ].join("\n");

  return createHash("sha256").update(material, "utf8").digest("hex");
}

export function normalizeCanonicalDomain(value: string): string | null {
  const normalized = value.trim().toLowerCase().replace(/\.$/, "");

  if (normalized.length === 0 || normalized.length > 253 || isIP(normalized) !== 0) {
    return null;
  }

  const labels = normalized.split(".");
  if (labels.length < 2 || labels.some((label) => !DOMAIN_LABEL_PATTERN.test(label))) {
    return null;
  }

  return normalized;
}

function isCanonicalWebsiteUrl(value: string, canonicalDomain: string): boolean {
  return value === `https://${canonicalDomain}`;
}

export function validatePublicationRequest(input: unknown): PublicationIngestRequest {
  const parsed = publicationIngestRequestSchema.safeParse(input);

  if (!parsed.success) {
    const fields = Array.from(new Set(parsed.error.issues.map((issue) => issue.path.join(".") || "request"))).sort();
    throw new PublicationValidationError("invalid_request", "Publication request failed schema validation.", fields);
  }

  const request = parsed.data;
  try {
    validateRenderableSerpReportArtifact(request.artifact);
  } catch (error) {
    if (error instanceof RenderableArtifactValidationError) {
      throw new PublicationValidationError("invalid_request", error.message, error.fields);
    }
    throw error;
  }
  const canonicalArtifact = canonicalizeArtifact(request.artifact);
  if (Buffer.byteLength(canonicalArtifact, "utf8") > MAX_ARTIFACT_BYTES) {
    throw new PublicationValidationError(
      "invalid_request",
      `Canonical artifact exceeds ${MAX_ARTIFACT_BYTES} bytes.`,
      ["artifact"]
    );
  }
  const canonicalDomain = normalizeCanonicalDomain(request.canonicalDomain);
  const requestWebsiteIsCanonical = canonicalDomain
    ? isCanonicalWebsiteUrl(request.websiteUrl, canonicalDomain)
    : false;
  const artifactWebsiteIsCanonical = canonicalDomain
    ? isCanonicalWebsiteUrl(request.artifact.website_url, canonicalDomain)
    : false;
  const artifactCompanyDomain = normalizeCanonicalDomain(request.artifact.company.domain);
  const invalidFields: string[] = [];

  if (!canonicalDomain || canonicalDomain !== request.canonicalDomain) invalidFields.push("canonicalDomain");
  if (!requestWebsiteIsCanonical) invalidFields.push("websiteUrl");
  if (!artifactWebsiteIsCanonical || request.artifact.website_url !== request.websiteUrl) {
    invalidFields.push("artifact.website_url");
  }
  if (artifactCompanyDomain !== canonicalDomain || request.artifact.company.domain !== canonicalDomain) {
    invalidFields.push("artifact.company.domain");
  }
  if (request.artifact.report_id !== request.reportId) invalidFields.push("artifact.report_id");
  if (request.artifact.report_slug !== request.slug) invalidFields.push("artifact.report_slug");
  if (request.artifact.company.name !== request.companyName) invalidFields.push("artifact.company.name");
  if (request.artifact.status !== "complete") invalidFields.push("artifact.status");
  if (request.artifact.schema_version.trim().length === 0) invalidFields.push("artifact.schema_version");
  if (request.artifact.run_id.trim().length === 0) invalidFields.push("artifact.run_id");
  if (!Number.isFinite(Date.parse(request.artifact.generated_at))) invalidFields.push("artifact.generated_at");

  if (invalidFields.length > 0) {
    throw new PublicationValidationError(
      "invalid_request",
      "Artifact identity or completion metadata does not match the publication request.",
      invalidFields.sort()
    );
  }

  const computedArtifactSha256 = createHash("sha256").update(canonicalArtifact, "utf8").digest("hex");
  if (computedArtifactSha256 !== request.artifactSha256) {
    throw new PublicationValidationError(
      "artifact_hash_mismatch",
      "Artifact SHA-256 does not match the canonical supplied artifact.",
      ["artifactSha256"]
    );
  }

  const expectedIdempotencyKey = computePublicationIdempotencyKey(request);
  if (expectedIdempotencyKey !== request.idempotencyKey) {
    throw new PublicationValidationError(
      "idempotency_key_mismatch",
      "Idempotency key does not match the publication identity.",
      ["idempotencyKey"]
    );
  }

  return request;
}

export function isConfiguredIngestToken(value: string | undefined): value is string {
  if (typeof value !== "string" || !BEARER_SAFE_TOKEN_PATTERN.test(value)) {
    return false;
  }

  const byteLength = Buffer.byteLength(value, "utf8");
  return byteLength >= MINIMUM_TOKEN_BYTES && byteLength <= MAXIMUM_TOKEN_BYTES;
}

export function bearerTokenMatches(authorization: string | null, configuredToken: string): boolean {
  const boundedAuthorization =
    authorization && Buffer.byteLength(authorization, "utf8") <= MAXIMUM_AUTHORIZATION_BYTES ? authorization : "";
  const match = /^Bearer ([^\s]+)$/.exec(boundedAuthorization);
  const suppliedToken = match?.[1] ?? "";
  const suppliedDigest = createHash("sha256").update(suppliedToken, "utf8").digest();
  const configuredDigest = createHash("sha256").update(configuredToken, "utf8").digest();

  return timingSafeEqual(suppliedDigest, configuredDigest) && suppliedToken.length > 0;
}

export function isCanonicalLocalRequest(request: Request): boolean {
  try {
    const requestUrl = new URL(request.url);
    const origin = request.headers.get("origin");
    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto");

    return (
      requestUrl.origin === LOCAL_PUBLICATION_ORIGIN &&
      (!origin || origin === LOCAL_PUBLICATION_ORIGIN) &&
      (!forwardedHost || forwardedHost === "127.0.0.1:3000") &&
      (!forwardedProto || forwardedProto === "http")
    );
  } catch {
    return false;
  }
}
