import { z } from "zod";

const companySchema = z
  .object({
    name: z.string(),
  })
  .passthrough();

const validatedQueriesSchema = z
  .object({
    queries: z.array(z.unknown()),
  })
  .passthrough();

const competitorLandscapeSchema = z
  .object({
    competitors: z.array(z.unknown()),
  })
  .passthrough();

const contentPlanSchema = z
  .object({
    items: z.array(z.unknown()),
  })
  .passthrough();

export const serpReportArtifactSchema = z
  .object({
    schema_version: z.string(),
    report_id: z.string(),
    report_slug: z.string(),
    run_id: z.string(),
    generated_at: z.string(),
    status: z.string(),
    warnings: z.array(z.unknown()),
    website_url: z.string(),
    search_market: z.unknown(),
    company: companySchema,
    analysis_coverage: z.unknown(),
    validated_queries: validatedQueriesSchema,
    competitor_landscape: competitorLandscapeSchema,
    content_plan: contentPlanSchema,
  })
  .passthrough();

export type SerpReportArtifact = z.infer<typeof serpReportArtifactSchema>;
