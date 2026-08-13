import { z } from "zod";

import { serpReportArtifactSchema } from "../schema";

export const LOCAL_PUBLICATION_ORIGIN = "http://127.0.0.1:3000" as const;
export const MAX_INGEST_BODY_BYTES = 4 * 1024 * 1024;
export const MAX_ARTIFACT_BYTES = 1024 * 1024;

export const SHA256_PATTERN = /^[a-f0-9]{64}$/;
export const REPORT_ID_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9._:-]{0,127})$/;
export const SAFE_ROUTE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const CANONICAL_DOMAIN_PATTERN =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export const canonicalUuidSchema = z
  .string()
  .uuid()
  .refine((value) => value === value.toLowerCase(), "UUID must use canonical lowercase text.");

export const canonicalDomainSchema = z
  .string()
  .min(1)
  .max(253)
  .regex(CANONICAL_DOMAIN_PATTERN)
  .refine((value) => !/^[0-9.]+$/.test(value), "Domain must not be an IP-shaped value.");

export const publicationIngestRequestSchema = z
  .object({
    idempotencyKey: z.string().regex(SHA256_PATTERN),
    sourceJobId: canonicalUuidSchema,
    leaseToken: canonicalUuidSchema,
    workflowRevision: z.number().int().min(1),
    artifactSha256: z.string().regex(SHA256_PATTERN),
    reportId: z.string().regex(REPORT_ID_PATTERN),
    slug: z.string().min(1).max(160).regex(SAFE_ROUTE_SLUG_PATTERN),
    websiteUrl: z.string().url().max(2_048),
    canonicalDomain: canonicalDomainSchema,
    companyName: z.string().trim().min(1).max(200),
    artifact: serpReportArtifactSchema,
  })
  .strict();

export type PublicationIngestRequest = z.infer<typeof publicationIngestRequestSchema>;

export function buildPublicationRpcArgs(request: PublicationIngestRequest) {
  return {
    p_idempotency_key: request.idempotencyKey,
    p_source_job_id: request.sourceJobId,
    p_lease_token: request.leaseToken,
    p_expected_workflow_revision: request.workflowRevision,
    p_artifact_sha256: request.artifactSha256,
    p_report_id: request.reportId,
    p_slug: request.slug,
    p_website_url: request.websiteUrl,
    p_canonical_domain: request.canonicalDomain,
    p_company_name: request.companyName,
    p_artifact: request.artifact,
  };
}

export const publicationRpcResultSchema = z
  .object({
    outcome: z.enum(["created", "replayed"]),
    publication_id: canonicalUuidSchema,
    source_job_id: canonicalUuidSchema,
    slug: z.string().min(1).max(160).regex(SAFE_ROUTE_SLUG_PATTERN),
    report_id: z.string().regex(REPORT_ID_PATTERN),
    artifact_sha256: z.string().regex(SHA256_PATTERN),
    canonical_domain: canonicalDomainSchema,
    status: z.literal("complete"),
  })
  .strict();

export type PublicationRpcResult = z.infer<typeof publicationRpcResultSchema>;

export const publicationIngestSuccessSchema = z
  .object({
    ok: z.literal(true),
    outcome: z.enum(["created", "replayed"]),
    publicationId: canonicalUuidSchema,
    sourceJobId: canonicalUuidSchema,
    slug: z.string().min(1).max(160).regex(SAFE_ROUTE_SLUG_PATTERN),
    reportId: z.string().regex(REPORT_ID_PATTERN),
    artifactSha256: z.string().regex(SHA256_PATTERN),
    canonicalDomain: canonicalDomainSchema,
    status: z.literal("complete"),
    publicUrl: z.string().url(),
  })
  .strict();

export type PublicationIngestSuccess = z.infer<typeof publicationIngestSuccessSchema>;

export const publicationIngestErrorCodeSchema = z.enum([
  "authentication_required",
  "invalid_content_type",
  "unsupported_content_encoding",
  "payload_too_large",
  "invalid_json",
  "invalid_request",
  "artifact_hash_mismatch",
  "idempotency_key_mismatch",
  "publication_conflict",
  "local_only",
  "service_unavailable",
]);

export const publicationIngestErrorSchema = z
  .object({
    ok: z.literal(false),
    error: z
      .object({
        code: publicationIngestErrorCodeSchema,
        message: z.string().min(1).max(240),
        fields: z.array(z.string().min(1).max(240)).max(32).optional(),
      })
      .strict(),
  })
  .strict();

export type PublicationIngestError = z.infer<typeof publicationIngestErrorSchema>;

export const publicationProofSchema = z
  .object({
    publicationId: canonicalUuidSchema,
    sourceJobId: canonicalUuidSchema,
    reportId: z.string().regex(REPORT_ID_PATTERN),
    artifactSha256: z.string().regex(SHA256_PATTERN),
    canonicalDomain: canonicalDomainSchema,
    slug: z.string().min(1).max(160).regex(SAFE_ROUTE_SLUG_PATTERN),
    completedAt: z.iso.datetime({ offset: true }),
  })
  .strict();

export type PublicationProof = z.infer<typeof publicationProofSchema>;
