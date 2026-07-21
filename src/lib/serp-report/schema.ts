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
const nullableNumber = z.union([z.null(), z.coerce.number()]);
const nullableNonnegativeNumber = z.union([z.null(), nonnegativeNumber]);

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

export const queryAnalysisSummaryDataSchema = z.object({
  total: nonnegativeInteger,
  problemDemand: nonnegativeInteger,
  solutionDemand: nonnegativeInteger,
  medianKeywordDifficulty: nonnegativeNumber,
  averageMonthlySearchVolume: nonnegativeNumber,
  medianMonthlySearchVolume: nonnegativeNumber,
});

export type QueryAnalysisSummaryData = z.infer<typeof queryAnalysisSummaryDataSchema>;

export const validatedQueryOverviewSourceSchema = z
  .object({
    query_id: z.string().min(1),
    query: z.string().min(1),
    core_keyword: z.string().nullable(),
    validation_reasoning: z.string().min(1),
    territory: z.enum(["problem_demand", "solution_demand"]),
    metrics: z
      .object({
        cpc: nullableNonnegativeNumber,
        search_intent: z
          .object({
            main: z.string().min(1),
            secondary: z.array(z.string()),
          })
          .passthrough(),
        search_volume_trend: z
          .object({
            monthly: nullableNumber,
            quarterly: nullableNumber,
            yearly: nullableNumber,
          })
          .passthrough()
          .nullable(),
        search_volume: nullableNonnegativeNumber,
        keyword_difficulty: nullableNonnegativeNumber,
        paid_competition_level: z.string().nullable(),
        average_top_10: z
          .object({
            backlinks: nullableNonnegativeNumber,
            referring_domains: nullableNonnegativeNumber,
          })
          .passthrough()
          .nullable(),
      })
      .passthrough(),
  })
  .passthrough();

export const validatedQueryOverviewSourceArraySchema = z.array(validatedQueryOverviewSourceSchema);

export const queryOverviewItemSchema = z.object({
  id: z.string().min(1),
  query: z.string().min(1),
  demandType: z.enum(["Problem", "Solution"]),
  searchIntent: z.string().min(1),
  searchVolume: nullableNonnegativeNumber,
  keywordDifficulty: nullableNonnegativeNumber,
  secondaryIntents: z.array(z.string()),
  coreKeyword: z.string().nullable(),
  monthlyTrend: nullableNumber,
  quarterlyTrend: nullableNumber,
  yearlyTrend: nullableNumber,
  cpc: nullableNonnegativeNumber,
  paidCompetitionLevel: z.string().nullable(),
  averageBacklinks: nullableNonnegativeNumber,
  averageReferringDomains: nullableNonnegativeNumber,
  validationReasoning: z.string().min(1),
});

export const queryOverviewDataSchema = z.array(queryOverviewItemSchema);

export type QueryOverviewItem = z.infer<typeof queryOverviewItemSchema>;

export const contentPlanItemSourceSchema = z
  .object({
    query_id: z.string().min(1),
    recommendation_rank: nullableNonnegativeNumber.optional(),
    opportunity_metrics: z
      .object({
        opportunity_score: nullableNonnegativeNumber.optional(),
      })
      .passthrough()
      .nullable()
      .optional(),
  })
  .passthrough();

export const contentPlanItemSourceArraySchema = z.array(contentPlanItemSourceSchema);

export const scoredOpportunitySourceSchema = z
  .object({
    query_id: z.string().min(1),
    opportunity_score: nullableNonnegativeNumber.optional(),
  })
  .passthrough();

export const scoredOpportunitySourceArraySchema = z.array(scoredOpportunitySourceSchema);

export const searchOpportunityPointSchema = z.object({
  queryId: z.string().min(1),
  query: z.string().min(1),
  demandType: z.enum(["Problem", "Solution"]),
  searchIntent: z.string().min(1),
  searchVolume: nonnegativeNumber,
  keywordDifficulty: nonnegativeNumber,
  status: z.enum(["validated", "scored", "selected"]),
  opportunityScore: nullableNonnegativeNumber,
  recommendationRank: nullableNonnegativeNumber,
});

export const searchOpportunityPointArraySchema = z.array(searchOpportunityPointSchema);

export type SearchOpportunityPoint = z.infer<typeof searchOpportunityPointSchema>;

export type SerpReportData = {
  analysisScope: AnalysisScopeData;
  queryAnalysisSummary: QueryAnalysisSummaryData;
  queryOverview: QueryOverviewItem[];
  searchOpportunityPoints: SearchOpportunityPoint[];
};
