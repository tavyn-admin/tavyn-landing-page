import {
  LOCAL_PUBLICATION_ORIGIN,
  MAX_INGEST_BODY_BYTES,
  publicationIngestErrorSchema,
  publicationIngestSuccessSchema,
  publicationRpcResultSchema,
  type PublicationIngestError,
  type PublicationIngestRequest,
  type PublicationIngestSuccess,
  type PublicationRpcResult,
} from "./contract";
import {
  bearerTokenMatches,
  isCanonicalLocalRequest,
  isConfiguredIngestToken,
  PublicationValidationError,
  validatePublicationRequest,
} from "./validation";

export type PublicationStore = {
  ingest(request: PublicationIngestRequest): Promise<PublicationRpcResult>;
};

export class PublicationConflictError extends Error {
  constructor() {
    super("Publication identity conflicts with an existing idempotency record.");
    this.name = "PublicationConflictError";
  }
}

type IngestHandlerDependencies = {
  configuredToken: string | undefined;
  store: PublicationStore;
};

class PayloadTooLargeError extends Error {}
class InvalidJsonError extends Error {}

const MAX_ERROR_FIELDS = 32;
const MAX_ERROR_FIELD_LENGTH = 240;

export function normalizePublicationErrorFields(fields: string[] | undefined): string[] | undefined {
  if (!fields) return undefined;

  const normalized = Array.from(
    new Set(
      fields
        .map((field) => field.trim().slice(0, MAX_ERROR_FIELD_LENGTH))
        .filter((field) => field.length > 0)
    )
  )
    .sort()
    .slice(0, MAX_ERROR_FIELDS);

  return normalized.length > 0 ? normalized : undefined;
}

function jsonResponse(
  body: PublicationIngestSuccess | PublicationIngestError,
  status: number
): Response {
  const parsedBody = body.ok
    ? publicationIngestSuccessSchema.parse(body)
    : publicationIngestErrorSchema.parse(body);

  return Response.json(parsedBody, {
    status,
    headers: {
      "cache-control": "no-store",
      pragma: "no-cache",
      "x-content-type-options": "nosniff",
    },
  });
}

function errorResponse(
  status: number,
  code: PublicationIngestError["error"]["code"],
  message: string,
  fields?: string[]
): Response {
  const normalizedFields = normalizePublicationErrorFields(fields);

  return jsonResponse(
    {
      ok: false,
      error: {
        code,
        message,
        ...(normalizedFields ? { fields: normalizedFields } : {}),
      },
    },
    status
  );
}

async function readBoundedJson(request: Request): Promise<unknown> {
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    if (!/^\d+$/.test(contentLength)) {
      throw new PayloadTooLargeError();
    }
    const parsedLength = Number(contentLength);
    if (
      !Number.isSafeInteger(parsedLength) ||
      parsedLength < 0 ||
      parsedLength > MAX_INGEST_BODY_BYTES
    ) {
      throw new PayloadTooLargeError();
    }
  }

  if (!request.body) {
    throw new InvalidJsonError();
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      received += value.byteLength;
      if (received > MAX_INGEST_BODY_BYTES) {
        await reader.cancel();
        throw new PayloadTooLargeError();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  let body: string;
  try {
    body = new TextDecoder("utf-8", { fatal: true }).decode(
      Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)))
    );
  } catch {
    throw new InvalidJsonError();
  }

  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw new InvalidJsonError();
  }
}

function isJsonContentType(value: string | null): boolean {
  return value?.split(";", 1)[0]?.trim().toLowerCase() === "application/json";
}

function isIdentityContentEncoding(value: string | null): boolean {
  return value === null || value.trim().toLowerCase() === "identity";
}

export function createPublicationIngestHandler({
  configuredToken,
  store,
}: IngestHandlerDependencies) {
  return async function handlePublicationIngest(request: Request): Promise<Response> {
    if (!isCanonicalLocalRequest(request)) {
      return errorResponse(
        403,
        "local_only",
        `Publication ingestion is restricted to ${LOCAL_PUBLICATION_ORIGIN}.`
      );
    }

    if (!isConfiguredIngestToken(configuredToken)) {
      return errorResponse(503, "service_unavailable", "Publication ingestion is not safely configured.");
    }

    if (!bearerTokenMatches(request.headers.get("authorization"), configuredToken)) {
      return errorResponse(401, "authentication_required", "A valid bearer token is required.");
    }

    if (!isJsonContentType(request.headers.get("content-type"))) {
      return errorResponse(415, "invalid_content_type", "Content-Type must be application/json.");
    }

    if (!isIdentityContentEncoding(request.headers.get("content-encoding"))) {
      return errorResponse(415, "unsupported_content_encoding", "Compressed request bodies are not accepted.");
    }

    let input: unknown;
    try {
      input = await readBoundedJson(request);
    } catch (error) {
      if (error instanceof PayloadTooLargeError) {
        return errorResponse(
          413,
          "payload_too_large",
          `Request body exceeds ${MAX_INGEST_BODY_BYTES} bytes.`
        );
      }
      return errorResponse(400, "invalid_json", "Request body must contain valid JSON.");
    }

    let publicationRequest: PublicationIngestRequest;
    try {
      publicationRequest = validatePublicationRequest(input);
    } catch (error) {
      if (error instanceof PublicationValidationError) {
        return errorResponse(422, error.code, error.message, error.fields);
      }
      return errorResponse(422, "invalid_request", "Publication request failed validation.");
    }

    const idempotencyHeader = request.headers.get("idempotency-key");
    if (idempotencyHeader !== publicationRequest.idempotencyKey) {
      return errorResponse(
        422,
        "idempotency_key_mismatch",
        "Idempotency-Key header must equal the deterministic request idempotency key.",
        ["idempotencyKey"]
      );
    }

    try {
      const result = publicationRpcResultSchema.parse(await store.ingest(publicationRequest));

      if (
        result.source_job_id !== publicationRequest.sourceJobId ||
        result.report_id !== publicationRequest.reportId ||
        result.slug !== publicationRequest.slug ||
        result.artifact_sha256 !== publicationRequest.artifactSha256 ||
        result.canonical_domain !== publicationRequest.canonicalDomain
      ) {
        return errorResponse(
          503,
          "service_unavailable",
          "Publication persistence returned inconsistent identity data."
        );
      }

      return jsonResponse(
        {
          ok: true,
          outcome: result.outcome,
          publicationId: result.publication_id,
          sourceJobId: result.source_job_id,
          slug: result.slug,
          reportId: result.report_id,
          artifactSha256: result.artifact_sha256,
          canonicalDomain: result.canonical_domain,
          status: result.status,
          publicUrl: `${LOCAL_PUBLICATION_ORIGIN}/serp/${result.slug}`,
        },
        result.outcome === "created" ? 201 : 200
      );
    } catch (error) {
      if (error instanceof PublicationConflictError) {
        return errorResponse(409, "publication_conflict", error.message);
      }

      return errorResponse(
        503,
        "service_unavailable",
        "Publication persistence is temporarily unavailable."
      );
    }
  };
}
