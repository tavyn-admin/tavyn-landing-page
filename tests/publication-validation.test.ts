import { describe, expect, it } from "vitest";

import packageJson from "../package.json";

import {
  bearerTokenMatches,
  computeArtifactSha256,
  computePublicationIdempotencyKey,
  isCanonicalLocalRequest,
  isConfiguredIngestToken,
  validatePublicationRequest,
} from "../src/lib/serp-report/publication/validation";
import { makeArtifact, makeHttpRequest, makePublicationRequest, TEST_TOKEN } from "./publication-fixture";

describe("publication validation", () => {
  it("binds development and production servers to the canonical loopback endpoint", () => {
    expect(packageJson.scripts.dev).toBe("next dev --hostname 127.0.0.1 --port 3000");
    expect(packageJson.scripts.start).toBe("next start --hostname 127.0.0.1 --port 3000");
  });

  it("canonicalizes object key order before hashing", () => {
    expect(computeArtifactSha256({ b: 2, a: 1 })).toBe(computeArtifactSha256({ a: 1, b: 2 }));
  });

  it("uses the fixed deterministic idempotency namespace", () => {
    expect(
      computePublicationIdempotencyKey({
        sourceJobId: "48f2d6a3-bfe1-4b58-bd15-dd93bdd430b3",
        reportId: "report-123",
        slug: "example-report",
        artifactSha256: "a".repeat(64),
      })
    ).toBe("ba185426d3cefaf8f654bf4acc4490cee68bf49b3addbb516b77d2ba81ebbfc6");
  });

  it("accepts the complete matching fixture", () => {
    expect(validatePublicationRequest(makePublicationRequest())).toMatchObject({ slug: "example-report" });
  });

  it.each([
    ["HTTP", { websiteUrl: "http://example.com/" }],
    ["trailing slash", { websiteUrl: "https://example.com/" }],
    ["path", { websiteUrl: "https://example.com/path" }],
    ["query", { websiteUrl: "https://example.com/?a=1" }],
    ["domain case", { canonicalDomain: "Example.com" }],
  ])("rejects a non-canonical website identity: %s", (_name, override) => {
    expect(() => validatePublicationRequest({ ...makePublicationRequest(), ...override })).toThrow(
      /schema validation|identity|completion metadata/
    );
  });

  it("rejects an uppercase source UUID before idempotency derivation", () => {
    const request = makePublicationRequest();
    expect(() =>
      validatePublicationRequest({
        ...request,
        sourceJobId: request.sourceJobId.toUpperCase(),
      })
    ).toThrow(/schema validation/);
    expect(() =>
      computePublicationIdempotencyKey({
        sourceJobId: request.sourceJobId.toUpperCase(),
        reportId: request.reportId,
        slug: request.slug,
        artifactSha256: request.artifactSha256,
      })
    ).toThrow(/canonical lowercase UUID/);
  });

  it.each([
    ["search market", (artifact: ReturnType<typeof makeArtifact>) => ({ ...artifact, search_market: {} })],
    [
      "analysis count invariants",
      (artifact: ReturnType<typeof makeArtifact>) => ({
        ...artifact,
        analysis_coverage: { ...artifact.analysis_coverage, queries_discovered: 1 },
      }),
    ],
    [
      "exact three-item content plan",
      (artifact: ReturnType<typeof makeArtifact>) => ({
        ...artifact,
        content_plan: { ...artifact.content_plan, items: artifact.content_plan.items.slice(0, 2) },
      }),
    ],
    [
      "opportunity-score methodology",
      (artifact: ReturnType<typeof makeArtifact>) => ({
        ...artifact,
        validated_queries: {
          ...artifact.validated_queries,
          queries: artifact.validated_queries.queries.map((query, index) =>
            index === 0
              ? { ...query, opportunity_metrics: { ...query.opportunity_metrics, opportunity_score: 99 } }
              : query
          ),
        },
      }),
    ],
  ])("rejects a non-renderable artifact: %s", (_name, mutate) => {
    const request = makePublicationRequest();
    expect(() => validatePublicationRequest({ ...request, artifact: mutate(request.artifact) })).toThrow(
      /complete data required/
    );
  });

  it.each([
    "javascript:alert(1)",
    "data:text/html,unsafe",
    "https://user:pass@example.com/private",
    "https://example.com/unsafe\npath",
    `https://example.com/${"x".repeat(2_048)}`,
  ])("rejects an unsafe rendered ranking-page URL: %s", (url) => {
    const request = makePublicationRequest();
    expect(() =>
      validatePublicationRequest({
        ...request,
        artifact: withFirstRankingPageUrl(request.artifact, url),
      })
    ).toThrow(/complete data required/);
  });

  it("rejects cross-field artifact identity changes", () => {
    const request = makePublicationRequest();
    expect(() =>
      validatePublicationRequest({
        ...request,
        artifact: { ...request.artifact, report_id: "different" },
      })
    ).toThrow(/identity/);
  });

  it("rejects a mismatched artifact hash before persistence", () => {
    expect(() => validatePublicationRequest({ ...makePublicationRequest(), artifactSha256: "0".repeat(64) })).toThrow(
      /SHA-256/
    );
  });

  it("rejects a mismatched deterministic idempotency key", () => {
    expect(() => validatePublicationRequest({ ...makePublicationRequest(), idempotencyKey: "0".repeat(64) })).toThrow(
      /Idempotency key/
    );
  });

  it("rejects an artifact above the canonical one MiB limit", () => {
    const artifact = { ...makeArtifact(), padding: "x".repeat(1024 * 1024) };
    const request = makePublicationRequest();
    expect(() => validatePublicationRequest({ ...request, artifact })).toThrow(/exceeds/);
  });

  it("matches bearer tokens without direct variable-length comparison", () => {
    expect(bearerTokenMatches(`Bearer ${TEST_TOKEN}`, TEST_TOKEN)).toBe(true);
    expect(bearerTokenMatches(`Bearer ${"x".repeat(4_096)}`, "x".repeat(4_096))).toBe(true);
    expect(bearerTokenMatches("Bearer incorrect", TEST_TOKEN)).toBe(false);
    expect(bearerTokenMatches(`Basic ${TEST_TOKEN}`, TEST_TOKEN)).toBe(false);
  });

  it("requires a bounded, single bearer-safe configured token", () => {
    expect(isConfiguredIngestToken("x".repeat(32))).toBe(true);
    expect(isConfiguredIngestToken("x".repeat(4_096))).toBe(true);
    expect(isConfiguredIngestToken("x".repeat(31))).toBe(false);
    expect(isConfiguredIngestToken("x".repeat(4_097))).toBe(false);
    expect(isConfiguredIngestToken(`${"x".repeat(32)} space`)).toBe(false);
    expect(isConfiguredIngestToken(`${"x".repeat(32)}\n`)).toBe(false);
    expect(isConfiguredIngestToken("é".repeat(32))).toBe(false);
  });

  it("permits only the exact loopback origin, host, and protocol", () => {
    expect(isCanonicalLocalRequest(makeHttpRequest())).toBe(true);
    expect(isCanonicalLocalRequest(new Request("http://localhost:3000/api/serp-reports/ingest"))).toBe(false);
    expect(isCanonicalLocalRequest(new Request("https://127.0.0.1:3000/api/serp-reports/ingest"))).toBe(false);
    expect(
      isCanonicalLocalRequest(makeHttpRequest(undefined, { origin: "https://external.example" }))
    ).toBe(false);
    expect(
      isCanonicalLocalRequest(makeHttpRequest(undefined, { "x-forwarded-host": "external.example" }))
    ).toBe(false);
    expect(isCanonicalLocalRequest(makeHttpRequest(undefined, { "x-forwarded-proto": "https" }))).toBe(false);
  });
});

function withFirstRankingPageUrl(
  artifact: ReturnType<typeof makeArtifact>,
  url: string
) {
  return {
    ...artifact,
    content_plan: {
      ...artifact.content_plan,
      items: artifact.content_plan.items.map((item, itemIndex) => ({
        ...item,
        serp_results: {
          ...item.serp_results,
          ranking_pages: item.serp_results.ranking_pages.map((page, pageIndex) =>
            itemIndex === 0 && pageIndex === 0 ? { ...page, url } : page
          ),
        },
      })),
    },
  };
}
