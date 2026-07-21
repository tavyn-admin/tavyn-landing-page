import "server-only";

import { unstable_noStore as noStore } from "next/cache";

import {
  analysisScopeDataSchema,
  contentPlanItemSourceArraySchema,
  queryOverviewDataSchema,
  queryAnalysisSummaryDataSchema,
  scoredOpportunitySourceArraySchema,
  searchOpportunityPointArraySchema,
  validatedQueryOverviewSourceArraySchema,
  type SerpReportData,
} from "@/lib/serp-report/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const SAFE_ROUTE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 160;

export const SERP_REPORT_SELECT =
  "company_name,queries_discovered:artifact->analysis_coverage->queries_discovered,queries_evaluated:artifact->analysis_coverage->queries_evaluated,queries_validated:artifact->analysis_coverage->queries_validated,ranking_pages_analyzed:artifact->analysis_coverage->ranking_pages_analyzed,competitor_domains_found:artifact->analysis_coverage->competitor_domains_found,problem_queries_validated:artifact->analysis_coverage->problem_queries_validated,solution_queries_validated:artifact->analysis_coverage->solution_queries_validated,content_opportunities_scored:artifact->analysis_coverage->content_opportunities_scored,content_recommendations_selected:artifact->analysis_coverage->content_recommendations_selected,median_keyword_difficulty:artifact->validated_queries->summary->median_keyword_difficulty,validated_query_total:artifact->validated_queries->summary->total,validated_problem_demand:artifact->validated_queries->summary->problem_demand,validated_solution_demand:artifact->validated_queries->summary->solution_demand,validated_average_monthly_search_volume:artifact->validated_queries->summary->average_monthly_search_volume,validated_median_monthly_search_volume:artifact->validated_queries->summary->median_monthly_search_volume,validated_query_rows:artifact->validated_queries->queries,content_plan_items:artifact->content_plan->items,scored_opportunities:artifact->content_opportunities->scored";

type SerpReportRow = {
  company_name: unknown;
  queries_discovered: unknown;
  queries_evaluated: unknown;
  queries_validated: unknown;
  ranking_pages_analyzed: unknown;
  competitor_domains_found: unknown;
  median_keyword_difficulty: unknown;
  problem_queries_validated: unknown;
  solution_queries_validated: unknown;
  content_opportunities_scored: unknown;
  content_recommendations_selected: unknown;
  validated_query_total: unknown;
  validated_problem_demand: unknown;
  validated_solution_demand: unknown;
  validated_average_monthly_search_volume: unknown;
  validated_median_monthly_search_volume: unknown;
  validated_query_rows: unknown;
  content_plan_items: unknown;
  scored_opportunities: unknown;
};

function isSafeRouteSlug(slug: string) {
  return slug.length > 0 && slug.length <= MAX_SLUG_LENGTH && SAFE_ROUTE_SLUG.test(slug);
}

export async function getSerpReportData(slug: string): Promise<SerpReportData | null> {
  noStore();

  const normalizedSlug = slug.trim();

  if (!isSafeRouteSlug(normalizedSlug)) {
    return null;
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("serp_reports")
    .select(SERP_REPORT_SELECT)
    .eq("slug", normalizedSlug)
    .eq("status", "complete")
    .maybeSingle<SerpReportRow>();

  if (error) {
    throw new Error(`Unable to load SERP report data for "${normalizedSlug}": ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const analysisScope = analysisScopeDataSchema.parse({
    companyName: data.company_name,
    queriesDiscovered: data.queries_discovered,
    queriesEvaluated: data.queries_evaluated,
    queriesValidated: data.queries_validated,
    rankingPagesAnalyzed: data.ranking_pages_analyzed,
    competitorDomainsFound: data.competitor_domains_found,
    medianKeywordDifficulty: data.median_keyword_difficulty,
    problemQueriesValidated: data.problem_queries_validated,
    solutionQueriesValidated: data.solution_queries_validated,
    contentOpportunitiesScored: data.content_opportunities_scored,
    contentRecommendationsSelected: data.content_recommendations_selected,
  });

  const queryAnalysisSummary = queryAnalysisSummaryDataSchema.parse({
    total: data.validated_query_total,
    problemDemand: data.validated_problem_demand,
    solutionDemand: data.validated_solution_demand,
    medianKeywordDifficulty: data.median_keyword_difficulty,
    averageMonthlySearchVolume: data.validated_average_monthly_search_volume,
    medianMonthlySearchVolume: data.validated_median_monthly_search_volume,
  });

  const sourceQueries = validatedQueryOverviewSourceArraySchema.parse(data.validated_query_rows);
  const contentPlanItems = contentPlanItemSourceArraySchema.parse(data.content_plan_items ?? []);
  const scoredOpportunities = scoredOpportunitySourceArraySchema.parse(data.scored_opportunities ?? []);
  const selectedByQueryId = new Map(
    contentPlanItems.map((item) => [
      item.query_id,
      {
        opportunityScore: item.opportunity_metrics?.opportunity_score ?? null,
        recommendationRank: item.recommendation_rank ?? null,
      },
    ])
  );
  const scoredByQueryId = new Map(
    scoredOpportunities.map((item) => [
      item.query_id,
      {
        opportunityScore: item.opportunity_score ?? null,
      },
    ])
  );

  const queryOverview = queryOverviewDataSchema.parse(
    sourceQueries.map((item) => ({
      id: item.query_id,
      query: item.query,
      demandType: item.territory === "problem_demand" ? "Problem" : "Solution",
      searchIntent: item.metrics.search_intent.main,
      searchVolume: item.metrics.search_volume,
      keywordDifficulty: item.metrics.keyword_difficulty,
      secondaryIntents: item.metrics.search_intent.secondary,
      coreKeyword: item.core_keyword,
      monthlyTrend: item.metrics.search_volume_trend?.monthly ?? null,
      quarterlyTrend: item.metrics.search_volume_trend?.quarterly ?? null,
      yearlyTrend: item.metrics.search_volume_trend?.yearly ?? null,
      cpc: item.metrics.cpc,
      paidCompetitionLevel: item.metrics.paid_competition_level,
      averageBacklinks: item.metrics.average_top_10?.backlinks ?? null,
      averageReferringDomains: item.metrics.average_top_10?.referring_domains ?? null,
      validationReasoning: item.validation_reasoning,
    }))
  ).toSorted((a, b) => {
    if (a.searchVolume === null && b.searchVolume === null) {
      return 0;
    }

    if (a.searchVolume === null) {
      return 1;
    }

    if (b.searchVolume === null) {
      return -1;
    }

    return b.searchVolume - a.searchVolume;
  });
  const searchOpportunityPoints = searchOpportunityPointArraySchema.parse(
    sourceQueries
      .filter((item) => item.metrics.search_volume !== null && item.metrics.keyword_difficulty !== null)
      .map((item) => {
        const selected = selectedByQueryId.get(item.query_id);
        const scored = scoredByQueryId.get(item.query_id);
        const status = selected ? "selected" : scored ? "scored" : "validated";

        return {
          queryId: item.query_id,
          query: item.query,
          demandType: item.territory === "problem_demand" ? "Problem" : "Solution",
          searchIntent: item.metrics.search_intent.main,
          searchVolume: item.metrics.search_volume,
          keywordDifficulty: item.metrics.keyword_difficulty,
          status,
          opportunityScore: selected?.opportunityScore ?? scored?.opportunityScore ?? null,
          recommendationRank: selected?.recommendationRank ?? null,
        };
      })
  );

  return {
    analysisScope,
    queryAnalysisSummary,
    queryOverview,
    searchOpportunityPoints,
  };
}
