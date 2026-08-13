import { describe, expect, it, vi } from "vitest";

import { buildPublicationRpcArgs, MAX_INGEST_BODY_BYTES } from "../src/lib/serp-report/publication/contract";
import {
  createPublicationIngestHandler,
  normalizePublicationErrorFields,
  PublicationConflictError,
  type PublicationStore,
} from "../src/lib/serp-report/publication/ingest";
import {
  makeHttpRequest,
  makePublicationRequest,
  makeRpcResult,
  PUBLICATION_ID,
  TEST_TOKEN,
} from "./publication-fixture";

function makeHandler(store: PublicationStore, token: string | undefined = TEST_TOKEN) {
  return createPublicationIngestHandler({ configuredToken: token, store });
}

describe("publication ingest handler", () => {
  it("normalizes validation field paths to the bounded public error contract", () => {
    const fields = [
      ...Array.from({ length: 40 }, (_, index) => `artifact.queries.${String(index).padStart(2, "0")}`),
      ` ${"x".repeat(300)} `,
      "artifact.queries.00",
      "   ",
    ];

    const normalized = normalizePublicationErrorFields(fields);
    const bounded = normalized ?? [];

    expect(bounded).toHaveLength(32);
    expect(bounded).toEqual([...bounded].sort());
    expect(new Set(bounded).size).toBe(bounded.length);
    expect(bounded.every((field) => field.length > 0 && field.length <= 240)).toBe(true);
  });

  it("maps the accepted request to only the authorized RPC arguments", () => {
    expect(buildPublicationRpcArgs(makePublicationRequest())).toEqual({
      p_idempotency_key: makePublicationRequest().idempotencyKey,
      p_source_job_id: makePublicationRequest().sourceJobId,
      p_lease_token: makePublicationRequest().leaseToken,
      p_expected_workflow_revision: 1,
      p_artifact_sha256: makePublicationRequest().artifactSha256,
      p_report_id: "report-123",
      p_slug: "example-report",
      p_website_url: "https://example.com",
      p_canonical_domain: "example.com",
      p_company_name: "Example, Inc.",
      p_artifact: makePublicationRequest().artifact,
    });
  });

  it("persists only through the injected RPC boundary and returns a created receipt", async () => {
    const ingest = vi.fn().mockResolvedValue(makeRpcResult());
    const response = await makeHandler({ ingest })(makeHttpRequest());

    expect(response.status).toBe(201);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("pragma")).toBe("no-cache");
    expect(ingest).toHaveBeenCalledOnce();
    expect(await response.json()).toEqual({
      ok: true,
      outcome: "created",
      publicationId: PUBLICATION_ID,
      sourceJobId: makePublicationRequest().sourceJobId,
      slug: "example-report",
      reportId: "report-123",
      artifactSha256: makePublicationRequest().artifactSha256,
      canonicalDomain: "example.com",
      status: "complete",
      publicUrl: "http://127.0.0.1:3000/serp/example-report",
    });
  });

  it("returns the same identity for an idempotent replay", async () => {
    const response = await makeHandler({ ingest: vi.fn().mockResolvedValue(makeRpcResult("replayed")) })(
      makeHttpRequest()
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true, outcome: "replayed", publicationId: PUBLICATION_ID });
  });

  it("maps the stable persistence conflict to 409", async () => {
    const response = await makeHandler({
      ingest: vi.fn().mockRejectedValue(new PublicationConflictError()),
    })(makeHttpRequest());
    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({ ok: false, error: { code: "publication_conflict" } });
  });

  it("does not expose an unexpected persistence failure", async () => {
    const response = await makeHandler({
      ingest: vi.fn().mockRejectedValue(new Error("raw database details must stay private")),
    })(makeHttpRequest());
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain("raw database details");
  });

  it("fails closed when persistence returns inconsistent identity", async () => {
    const response = await makeHandler({
      ingest: vi.fn().mockResolvedValue({ ...makeRpcResult(), report_id: "other" }),
    })(makeHttpRequest());
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ ok: false, error: { code: "service_unavailable" } });
  });

  it.each([
    ["missing token configuration", undefined, makeHttpRequest(), 503, "service_unavailable"],
    ["short token configuration", "too-short", makeHttpRequest(), 503, "service_unavailable"],
    [
      "bad bearer token",
      TEST_TOKEN,
      makeHttpRequest(undefined, { authorization: "Bearer incorrect" }),
      401,
      "authentication_required",
    ],
    [
      "wrong content type",
      TEST_TOKEN,
      makeHttpRequest(undefined, { "content-type": "text/plain" }),
      415,
      "invalid_content_type",
    ],
    [
      "compressed content",
      TEST_TOKEN,
      makeHttpRequest(undefined, { "content-encoding": "gzip" }),
      415,
      "unsupported_content_encoding",
    ],
  ])("rejects %s before calling persistence", async (_name, token, request, status, code) => {
    const ingest = vi.fn();
    const response = await createPublicationIngestHandler({ configuredToken: token, store: { ingest } })(request as Request);
    expect(response.status).toBe(status);
    expect(await response.json()).toMatchObject({ ok: false, error: { code } });
    expect(ingest).not.toHaveBeenCalled();
  });

  it.each([
    ["missing", ""],
    ["different", "0".repeat(64)],
    ["multiple", `${makePublicationRequest().idempotencyKey},${makePublicationRequest().idempotencyKey}`],
  ])("rejects a %s Idempotency-Key header", async (_name, value) => {
    const ingest = vi.fn();
    const request = makeHttpRequest();
    const headers = new Headers(request.headers);
    if (value) headers.set("idempotency-key", value);
    else headers.delete("idempotency-key");
    const response = await makeHandler({ ingest })(
      new Request(request.url, { method: "POST", headers, body: await request.text() })
    );
    expect(response.status).toBe(422);
    expect(await response.json()).toMatchObject({ ok: false, error: { code: "idempotency_key_mismatch" } });
    expect(ingest).not.toHaveBeenCalled();
  });

  it("rejects invalid JSON", async () => {
    const ingest = vi.fn();
    const response = await makeHandler({ ingest })(makeHttpRequest("{"));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ ok: false, error: { code: "invalid_json" } });
    expect(ingest).not.toHaveBeenCalled();
  });

  it("rejects a declared request above the envelope limit without reading it", async () => {
    const ingest = vi.fn();
    const response = await makeHandler({ ingest })(
      makeHttpRequest(undefined, { "content-length": String(MAX_INGEST_BODY_BYTES + 1) })
    );
    expect(response.status).toBe(413);
    expect(ingest).not.toHaveBeenCalled();
  });

  it("rejects a malformed Content-Length", async () => {
    const ingest = vi.fn();
    const response = await makeHandler({ ingest })(makeHttpRequest(undefined, { "content-length": "1e2" }));
    expect(response.status).toBe(413);
    expect(ingest).not.toHaveBeenCalled();
  });

  it("rejects invalid UTF-8 as invalid JSON", async () => {
    const ingest = vi.fn();
    const request = new Request("http://127.0.0.1:3000/api/serp-reports/ingest", {
      method: "POST",
      headers: {
        authorization: `Bearer ${TEST_TOKEN}`,
        "content-type": "application/json",
        "idempotency-key": makePublicationRequest().idempotencyKey,
      },
      body: new Uint8Array([0x7b, 0x22, 0xff, 0x22, 0x7d]),
    });
    const response = await makeHandler({ ingest })(request);
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ ok: false, error: { code: "invalid_json" } });
    expect(ingest).not.toHaveBeenCalled();
  });

  it("stops an oversized streamed body even without a content-length header", async () => {
    const ingest = vi.fn();
    const response = await makeHandler({ ingest })(makeHttpRequest("x".repeat(MAX_INGEST_BODY_BYTES + 1)));
    expect(response.status).toBe(413);
    expect(await response.json()).toMatchObject({ ok: false, error: { code: "payload_too_large" } });
    expect(ingest).not.toHaveBeenCalled();
  });

  it("rejects a non-loopback request before authentication", async () => {
    const ingest = vi.fn();
    const source = makeHttpRequest();
    const response = await makeHandler({ ingest })(
      new Request("https://example.com/api/serp-reports/ingest", {
        method: "POST",
        headers: source.headers,
        body: await source.text(),
      })
    );
    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ ok: false, error: { code: "local_only" } });
    expect(ingest).not.toHaveBeenCalled();
  });
});
