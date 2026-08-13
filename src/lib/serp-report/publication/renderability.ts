import { z } from "zod";

import { getOpportunityGraphMetrics } from "../opportunityMetrics";
import {
  analysisScopeDataSchema,
  competitorLandscapeCompetitorSourceArraySchema,
  competitorLandscapeScopeSourceSchema,
  competitorLandscapeSummarySourceSchema,
  contentPlanItemSourceArraySchema,
  queryAnalysisSummaryDataSchema,
  reportOverviewContentPlanSummarySourceSchema,
  reportOverviewSearchMarketSourceSchema,
  scoredOpportunitySourceArraySchema,
  serpReportCompanySchema,
  validatedQueryOverviewSourceArraySchema,
} from "../schema";

const nonnegativeInteger = z.coerce.number().int().nonnegative();
const nonnegativeNumber = z.coerce.number().nonnegative();

const boundedArtifactIdSchema = z
  .string()
  .min(1)
  .max(128)
  .refine(
    (value) => value.trim().length > 0 && !/[\u0000-\u001f\u007f]/u.test(value),
    "Artifact identifier must be bounded non-control text."
  );

const timezoneTimestampSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/u)
  .refine((value) => Number.isFinite(Date.parse(value)), "Timestamp must be a valid timezone-qualified instant.");

const renderableCompanySchema = serpReportCompanySchema.extend({
  name: z
    .string()
    .min(1)
    .max(200)
    .refine(
      (value) => value === value.trim() && !/[\u0000-\u001f\u007f]/u.test(value),
      "Company name must be trimmed non-control text."
    ),
});

const analysisCoverageSourceSchema = z
  .object({
    queries_discovered: nonnegativeInteger,
    queries_evaluated: nonnegativeInteger,
    queries_validated: nonnegativeInteger,
    ranking_pages_analyzed: nonnegativeInteger,
    competitor_domains_found: nonnegativeInteger,
    problem_queries_validated: nonnegativeInteger,
    solution_queries_validated: nonnegativeInteger,
    content_opportunities_scored: nonnegativeInteger,
    content_recommendations_selected: nonnegativeInteger,
  })
  .passthrough();

const validatedQuerySummarySourceSchema = z
  .object({
    total: nonnegativeInteger,
    problem_demand: nonnegativeInteger,
    solution_demand: nonnegativeInteger,
    combined_monthly_search_volume: nonnegativeNumber,
    average_monthly_search_volume: nonnegativeNumber,
    median_monthly_search_volume: nonnegativeNumber,
    median_keyword_difficulty: nonnegativeNumber,
  })
  .passthrough();

const renderableArtifactSourceSchema = z
  .object({
    schema_version: boundedArtifactIdSchema,
    run_id: boundedArtifactIdSchema,
    generated_at: timezoneTimestampSchema,
    company: renderableCompanySchema,
    search_market: reportOverviewSearchMarketSourceSchema,
    analysis_coverage: analysisCoverageSourceSchema,
    validated_queries: z
      .object({
        summary: validatedQuerySummarySourceSchema,
        queries: validatedQueryOverviewSourceArraySchema,
      })
      .passthrough(),
    competitor_landscape: z
      .object({
        scope: competitorLandscapeScopeSourceSchema,
        summary: competitorLandscapeSummarySourceSchema,
        competitors: competitorLandscapeCompetitorSourceArraySchema,
      })
      .passthrough(),
    content_plan: z
      .object({
        summary: reportOverviewContentPlanSummarySourceSchema,
        items: contentPlanItemSourceArraySchema,
      })
      .passthrough(),
    content_opportunities: z
      .object({
        scored: scoredOpportunitySourceArraySchema,
      })
      .passthrough(),
  })
  .passthrough();

export class RenderableArtifactValidationError extends Error {
  constructor(readonly fields: string[]) {
    super("Artifact does not contain the complete data required by the SERP report route.");
    this.name = "RenderableArtifactValidationError";
  }
}

export function validateRenderableSerpReportArtifact(artifact: unknown): void {
  const parsed = renderableArtifactSourceSchema.safeParse(artifact);
  if (!parsed.success) {
    throw new RenderableArtifactValidationError(
      Array.from(
        new Set(parsed.error.issues.map((issue) => `artifact.${issue.path.join(".") || "request"}`))
      ).sort()
    );
  }

  const source = parsed.data;
  const coverage = source.analysis_coverage;
  const querySummary = source.validated_queries.summary;

  try {
    analysisScopeDataSchema.parse({
      companyName: source.company.name,
      queriesDiscovered: coverage.queries_discovered,
      queriesEvaluated: coverage.queries_evaluated,
      queriesValidated: coverage.queries_validated,
      rankingPagesAnalyzed: coverage.ranking_pages_analyzed,
      competitorDomainsFound: coverage.competitor_domains_found,
      medianKeywordDifficulty: querySummary.median_keyword_difficulty,
      problemQueriesValidated: coverage.problem_queries_validated,
      solutionQueriesValidated: coverage.solution_queries_validated,
      contentOpportunitiesScored: coverage.content_opportunities_scored,
      contentRecommendationsSelected: coverage.content_recommendations_selected,
    });

    queryAnalysisSummaryDataSchema.parse({
      total: querySummary.total,
      problemDemand: querySummary.problem_demand,
      solutionDemand: querySummary.solution_demand,
      medianKeywordDifficulty: querySummary.median_keyword_difficulty,
      averageMonthlySearchVolume: querySummary.average_monthly_search_volume,
      medianMonthlySearchVolume: querySummary.median_monthly_search_volume,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new RenderableArtifactValidationError(
        Array.from(new Set(error.issues.map((issue) => `artifact.${issue.path.join(".")}`))).sort()
      );
    }
    throw error;
  }

  const invalidOpportunity = source.validated_queries.queries.find(
    (query) => !getOpportunityGraphMetrics(query.opportunity_metrics).scoreMatchesMethodology
  );
  if (invalidOpportunity) {
    throw new RenderableArtifactValidationError([
      `artifact.validated_queries.queries.${invalidOpportunity.query_id}.opportunity_metrics.opportunity_score`,
    ]);
  }
}
