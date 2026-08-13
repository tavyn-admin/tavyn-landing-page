import { describe, expect, it } from "vitest";

import { publicationProofSchema } from "../src/lib/serp-report/publication/contract";
import {
  escapeJsonForHtml,
  parsePublicationProofRow,
  PUBLICATION_PROOF_ELEMENT_ID,
  PUBLICATION_PROOF_SELECT,
  serializePublicationProof,
} from "../src/lib/serp-report/publication/proof";
import { makePublicationRequest, PUBLICATION_ID } from "./publication-fixture";

describe("publication readback proof", () => {
  it("escapes script-closing input defensively", () => {
    expect(escapeJsonForHtml('{"value":"</script>"}')).toBe('{"value":"\\u003c/script>"}');
  });

  it("reads the database-generated id as publicationId", () => {
    const request = makePublicationRequest();
    expect(PUBLICATION_PROOF_SELECT).toContain("publication_id:id");
    expect(
      parsePublicationProofRow({
        publication_id: PUBLICATION_ID,
        source_job_id: request.sourceJobId,
        report_id: request.reportId,
        artifact_sha256: request.artifactSha256,
        canonical_domain: request.canonicalDomain,
        slug: request.slug,
        completed_at: "2026-08-12T20:00:00.000Z",
      })
    ).toMatchObject({ publicationId: PUBLICATION_ID, sourceJobId: request.sourceJobId });
  });

  it("serializes an exact, machine-readable immutable identity", () => {
    const request = makePublicationRequest();
    const proof = {
      publicationId: PUBLICATION_ID,
      sourceJobId: request.sourceJobId,
      reportId: request.reportId,
      artifactSha256: request.artifactSha256,
      canonicalDomain: request.canonicalDomain,
      slug: request.slug,
      completedAt: "2026-08-12T20:00:00.000Z",
    };
    const serialized = serializePublicationProof(proof);

    expect(PUBLICATION_PROOF_ELEMENT_ID).toBe("tavyn-serp-publication-proof");
    expect(publicationProofSchema.parse(JSON.parse(serialized))).toEqual(proof);
    expect(serialized).not.toContain("<");
  });

  it("rejects extra or malformed proof fields", () => {
    const request = makePublicationRequest();
    expect(() =>
      serializePublicationProof({
        publicationId: PUBLICATION_ID,
        sourceJobId: request.sourceJobId,
        reportId: request.reportId,
        artifactSha256: request.artifactSha256,
        canonicalDomain: request.canonicalDomain,
        slug: request.slug,
        completedAt: "2026-08-12T20:00:00.000Z",
        unexpected: "value",
      } as never)
    ).toThrow();
  });
});
