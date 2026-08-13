import { publicationProofSchema, type PublicationProof } from "./contract";

export const PUBLICATION_PROOF_ELEMENT_ID = "tavyn-serp-publication-proof";
export const PUBLICATION_PROOF_SELECT =
  "publication_id:id, source_job_id, report_id, artifact_sha256, canonical_domain, slug, completed_at";

export type PublicationProofRow = {
  publication_id: unknown;
  source_job_id: unknown;
  report_id: unknown;
  artifact_sha256: unknown;
  canonical_domain: unknown;
  slug: unknown;
  completed_at: unknown;
};

export function parsePublicationProofRow(data: PublicationProofRow): PublicationProof {
  return publicationProofSchema.parse({
    publicationId: data.publication_id,
    sourceJobId: data.source_job_id,
    reportId: data.report_id,
    artifactSha256: data.artifact_sha256,
    canonicalDomain: data.canonical_domain,
    slug: data.slug,
    completedAt: data.completed_at,
  });
}

export function escapeJsonForHtml(value: string): string {
  return value.replaceAll("<", "\\u003c");
}

export function serializePublicationProof(proof: PublicationProof): string {
  const parsed = publicationProofSchema.parse(proof);

  // Every value is schema-restricted to UUID, hash, DNS, report-id, or slug
  // characters. Replacing '<' is an additional invariant against closing a
  // script element if the schema is changed later.
  return escapeJsonForHtml(JSON.stringify(parsed));
}
