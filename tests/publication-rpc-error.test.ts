import { describe, expect, it } from "vitest";

import { isPublicationConflictRpcError } from "../src/lib/serp-report/publication/rpcError";

describe("publication RPC error mapping", () => {
  it.each(["code", "message", "details", "hint"] as const)("recognizes the stable conflict token in %s", (field) => {
    expect(isPublicationConflictRpcError({ [field]: "serp_publication_idempotency_conflict" })).toBe(true);
  });

  it("does not misclassify an unrelated database failure", () => {
    expect(isPublicationConflictRpcError({ code: "42501", message: "permission denied" })).toBe(false);
  });
});
