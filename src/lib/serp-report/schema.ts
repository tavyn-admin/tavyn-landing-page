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

const nonnegativeInteger = z.coerce.number().int().nonnegative();
const nonnegativeNumber = z.coerce.number().nonnegative();

export const analysisScopeDataSchema = z
  .object({
    companyName: z.string().min(1),
    queriesDiscovered: nonnegativeInteger,
    queriesEvaluated: nonnegativeInteger,
    queriesValidated: nonnegativeInteger,
    rankingPagesAnalyzed: nonnegativeInteger,
    competitorDomainsFound: nonnegativeInteger,
    medianKeywordDifficulty: nonnegativeNumber,
    problemQueriesValidated: nonnegativeInteger,
    solutionQueriesValidated: nonnegativeInteger,
    contentOpportunitiesScored: nonnegativeInteger,
    contentRecommendationsSelected: nonnegativeInteger,
  })
  .superRefine((data, ctx) => {
    if (data.queriesDiscovered < data.queriesValidated) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "queriesDiscovered must be greater than or equal to queriesValidated.",
        path: ["queriesValidated"],
      });
    }

    if (data.queriesValidated < data.contentOpportunitiesScored) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "queriesValidated must be greater than or equal to contentOpportunitiesScored.",
        path: ["contentOpportunitiesScored"],
      });
    }

    if (data.contentOpportunitiesScored < data.contentRecommendationsSelected) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "contentOpportunitiesScored must be greater than or equal to contentRecommendationsSelected.",
        path: ["contentRecommendationsSelected"],
      });
    }
  });

export type AnalysisScopeData = z.infer<typeof analysisScopeDataSchema>;
