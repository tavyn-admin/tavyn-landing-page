import { describe, expect, it } from "vitest";

import {
  CP8_DEVELOPMENT_PROJECT_REF,
  CP8_DEVELOPMENT_SUPABASE_URL,
  requireCp8DevelopmentTarget,
} from "../src/lib/supabase/cp8-target";

describe("Checkpoint 8 Supabase target guard", () => {
  it("accepts only the explicitly confirmed development ref and URL", () => {
    expect(
      requireCp8DevelopmentTarget({
        SUPABASE_PROJECT_REF: CP8_DEVELOPMENT_PROJECT_REF,
        SUPABASE_URL: CP8_DEVELOPMENT_SUPABASE_URL,
      }),
    ).toBe(CP8_DEVELOPMENT_SUPABASE_URL);
  });

  it.each([
    {},
    {
      SUPABASE_PROJECT_REF: CP8_DEVELOPMENT_PROJECT_REF,
      SUPABASE_URL: `${CP8_DEVELOPMENT_SUPABASE_URL}/`,
    },
    {
      SUPABASE_PROJECT_REF: "different-project",
      SUPABASE_URL: CP8_DEVELOPMENT_SUPABASE_URL,
    },
    {
      SUPABASE_PROJECT_REF: CP8_DEVELOPMENT_PROJECT_REF,
      SUPABASE_URL: "https://different-project.supabase.co",
    },
  ])("fails closed for a missing or mismatched target: %o", (environment) => {
    expect(() => requireCp8DevelopmentTarget(environment)).toThrow(
      "explicitly confirmed Supabase development project",
    );
  });
});
