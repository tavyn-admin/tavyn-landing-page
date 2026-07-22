import { z } from "zod";

export const companyDifferentiatorSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

export const serpReportCompanySchema = z.object({
  name: z.string().min(1),
  domain: z.string().min(1),
  primary_icp: z.object({
    name: z.string().min(1),
    description: z.string().min(1),
  }),
  product_angle: z.string().min(1),
  product_summary: z.string().min(1),
  product_category: z.string().min(1),
  category_point_of_view: z.string().min(1),
  primary_differentiators: z.array(companyDifferentiatorSchema).min(1).max(5),
});

export type SerpReportCompany = z.infer<typeof serpReportCompanySchema>;

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
    company: serpReportCompanySchema,
    analysis_coverage: z.unknown(),
    validated_queries: validatedQueriesSchema,
    competitor_landscape: competitorLandscapeSchema,
    content_plan: contentPlanSchema,
  })
  .passthrough();

export type SerpReportArtifact = z.infer<typeof serpReportArtifactSchema>;

const nonnegativeInteger = z.coerce.number().int().nonnegative();
const nonnegativeNumber = z.coerce.number().nonnegative();
const positiveInteger = z.coerce.number().int().positive();
const percentageNumber = nonnegativeNumber.max(100);
const nullableNumber = z.union([z.null(), z.coerce.number()]);
const nullableNonnegativeNumber = z.union([z.null(), nonnegativeNumber]);

export const reportOverviewSearchMarketSourceSchema = z
  .object({
    search_engine: z.string().min(1),
    country: z.string().min(1),
    language_name: z.string().min(1),
    device: z.string().min(1),
  })
  .passthrough();

export const reportOverviewContentPlanSummarySourceSchema = z
  .object({
    selected_count: nonnegativeInteger,
    problem_demand_count: nonnegativeInteger,
    solution_demand_count: nonnegativeInteger,
  })
  .passthrough();

export const reportOverviewDataSchema = z.object({
  companyName: z.string().min(1),
  companyDomain: z.string().min(1),
  searchMarket: z.string().min(1),
  generatedAt: z.string().min(1),
  validatedQueries: nonnegativeInteger,
  combinedMonthlyVolume: nonnegativeNumber,
  problemDemandPercentage: percentageNumber,
  solutionDemandPercentage: percentageNumber,
  competitorsProfiled: nonnegativeInteger,
  pageOneCompetitors: nonnegativeInteger,
  visibilityLeader: z
    .object({
      domain: z.string().min(1),
    })
    .nullable(),
  broadestCoverage: z
    .object({
      domain: z.string().min(1),
      percentage: percentageNumber,
    })
    .nullable(),
  opportunitiesScored: nonnegativeInteger,
  recommendationsSelected: nonnegativeInteger,
  problemRecommendations: nonnegativeInteger,
  solutionRecommendations: nonnegativeInteger,
  recommendationPageTypes: z.array(z.string().min(1)),
});

export type ReportOverviewData = z.infer<typeof reportOverviewDataSchema>;

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

export const competitorLandscapeScopeSourceSchema = z
  .object({
    query_count: nonnegativeInteger,
  })
  .passthrough();

export const competitorLandscapeSummarySourceSchema = z
  .object({
    total_domains_found: nonnegativeInteger,
    competitors_included: nonnegativeInteger,
    target_domain_excluded: z.boolean(),
  })
  .passthrough();

export const competitorLandscapeCompetitorSourceSchema = z
  .object({
    rank: positiveInteger,
    domain: z.string().min(1),
    median_position: nonnegativeNumber,
    average_position: nonnegativeNumber,
    keywords_ranked_count: nonnegativeInteger,
    query_coverage_percentage: percentageNumber,
    estimated_traffic_from_analyzed_queries: nonnegativeNumber,
    query_positions: z.array(
      z
        .object({
          query: z.string().min(1),
          query_id: z.string().min(1),
          positions: z.array(z.coerce.number().int().positive()),
        })
        .passthrough()
    ),
  })
  .passthrough();

export const competitorLandscapeCompetitorSourceArraySchema = z.array(competitorLandscapeCompetitorSourceSchema);

export const competitorLandscapeDataSchema = z.object({
  companyName: z.string().min(1),
  queryCount: nonnegativeInteger,
  totalDomainsFound: nonnegativeInteger,
  competitorsProfiled: nonnegativeInteger,
  pageOneCompetitors: nonnegativeInteger,
  visibilityLeader: z
    .object({
      domain: z.string().min(1),
      queryCoveragePercentage: percentageNumber,
      medianPosition: nonnegativeNumber,
      keywordsRankedCount: nonnegativeInteger,
    })
    .nullable(),
  broadestCoverage: z
    .object({
      domain: z.string().min(1),
      queryCoveragePercentage: percentageNumber,
    })
    .nullable(),
  competitors: z.array(
    z.object({
      rank: positiveInteger,
      domain: z.string().min(1),
      keywordsRankedCount: nonnegativeInteger,
      queryCoveragePercentage: percentageNumber,
      averagePosition: nonnegativeNumber,
      medianPosition: nonnegativeNumber,
      estimatedTraffic: nonnegativeNumber,
      rankingFootprint: z.object({
        matchedQueries: nonnegativeInteger,
        pageOneQueries: nonnegativeInteger,
        pageTwoQueries: nonnegativeInteger,
        lowerRankingQueries: nonnegativeInteger,
        pageOneShare: percentageNumber,
      }),
      strongestQueryRankings: z.array(
        z.object({
          query: z.string().min(1),
          position: positiveInteger,
        })
      ),
    })
  ),
});

export type CompetitorLandscapeData = z.infer<typeof competitorLandscapeDataSchema>;

const searchIntentSourceSchema = z
  .object({
    main: z.string().min(1),
    secondary: z.array(z.string()),
  })
  .passthrough();

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
        search_intent: searchIntentSourceSchema,
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
    territory: z.enum(["problem_demand", "solution_demand"]),
    confidence: z.enum(["high", "medium", "low"]),
    core_keyword: z.string().nullable(),
    primary_query: z.string().min(1),
    recommended_title: z.string().min(1),
    recommended_page_type: z.string().min(1),
    content_angle: z.string().min(1),
    product_connection: z.string().min(1),
    selection_reasoning: z.string().min(1),
    recommendation_rank: nonnegativeNumber,
    query_metrics: z
      .object({
        cpc: nullableNonnegativeNumber,
        search_intent: searchIntentSourceSchema,
        search_volume: nonnegativeNumber,
        keyword_difficulty: nonnegativeNumber,
        paid_competition: nullableNonnegativeNumber,
        paid_competition_level: z.string().nullable(),
        search_volume_trend: z
          .object({
            monthly: nullableNumber,
            quarterly: nullableNumber,
            yearly: nullableNumber,
          })
          .passthrough(),
        average_top_10: z
          .object({
            backlinks: nonnegativeNumber,
            referring_domains: nonnegativeNumber,
            main_domain_rank: nonnegativeNumber,
          })
          .passthrough()
          .nullable(),
      })
      .passthrough(),
    opportunity_metrics: z
      .object({
        opportunity_score: nonnegativeNumber,
        volume_score: nonnegativeNumber,
        difficulty_score: nonnegativeNumber,
        search_volume_used: nonnegativeNumber,
        keyword_difficulty_used: nonnegativeNumber,
        keyword_difficulty_original: nonnegativeNumber,
        keyword_difficulty_was_imputed: z.boolean(),
        maximum_territory_search_volume: nonnegativeNumber,
      })
      .passthrough(),
    serp_results: z
      .object({
        provider: z.string().min(1),
        searched_at: z.string().min(1),
        results_received: nonnegativeInteger,
        ranking_pages: z.array(
          z
            .object({
              position: positiveInteger,
              title: z.string().min(1),
              domain: z.string().min(1),
              url: z.string().min(1),
              snippet: z.string(),
              published_date: z.string().nullable(),
            })
            .passthrough()
        ),
      })
      .passthrough(),
  })
  .passthrough();

export const contentPlanItemSourceArraySchema = z.array(contentPlanItemSourceSchema);

export const contentPlanRecommendationSchema = z.object({
  id: z.string().min(1),
  primaryQuery: z.string().min(1),
  confidence: z.enum(["high", "medium", "low"]),
  opportunityScore: nonnegativeNumber,
  monthlySearchVolume: nonnegativeNumber,
  keywordDifficulty: nonnegativeNumber,
});

export const contentPlanDataSchema = z.object({
  summary: reportOverviewContentPlanSummarySourceSchema,
  recommendations: z.array(contentPlanRecommendationSchema),
});

export type ContentPlanRecommendation = z.infer<typeof contentPlanRecommendationSchema>;
export type ContentPlanData = z.infer<typeof contentPlanDataSchema>;

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
  reportOverview: ReportOverviewData;
  company: SerpReportCompany;
  analysisScope: AnalysisScopeData;
  queryAnalysisSummary: QueryAnalysisSummaryData;
  competitorLandscape: CompetitorLandscapeData;
  contentPlan: ContentPlanData;
  queryOverview: QueryOverviewItem[];
  searchOpportunityPoints: SearchOpportunityPoint[];
};
