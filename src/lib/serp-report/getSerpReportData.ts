import "server-only";

import { unstable_noStore as noStore } from "next/cache";

import {
  analysisScopeDataSchema,
  queryAnalysisSummaryDataSchema,
  type SerpReportData,
} from "@/lib/serp-report/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const SAFE_ROUTE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 160;

export const SERP_REPORT_SELECT =
  "company_name,queries_discovered:artifact->analysis_coverage->queries_discovered,queries_evaluated:artifact->analysis_coverage->queries_evaluated,queries_validated:artifact->analysis_coverage->queries_validated,ranking_pages_analyzed:artifact->analysis_coverage->ranking_pages_analyzed,competitor_domains_found:artifact->analysis_coverage->competitor_domains_found,problem_queries_validated:artifact->analysis_coverage->problem_queries_validated,solution_queries_validated:artifact->analysis_coverage->solution_queries_validated,content_opportunities_scored:artifact->analysis_coverage->content_opportunities_scored,content_recommendations_selected:artifact->analysis_coverage->content_recommendations_selected,median_keyword_difficulty:artifact->validated_queries->summary->median_keyword_difficulty,validated_query_total:artifact->validated_queries->summary->total,validated_problem_demand:artifact->validated_queries->summary->problem_demand,validated_solution_demand:artifact->validated_queries->summary->solution_demand,validated_average_monthly_search_volume:artifact->validated_queries->summary->average_monthly_search_volume,validated_median_monthly_search_volume:artifact->validated_queries->summary->median_monthly_search_volume";

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

  return {
    analysisScope,
    queryAnalysisSummary,
  };
}
