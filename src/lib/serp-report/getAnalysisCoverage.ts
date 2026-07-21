import "server-only";

import { unstable_noStore as noStore } from "next/cache";

import { analysisScopeDataSchema, type AnalysisScopeData } from "@/lib/serp-report/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const SAFE_ROUTE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 160;

export const ANALYSIS_COVERAGE_SELECT =
  "company_name,queries_discovered:artifact->analysis_coverage->queries_discovered,queries_evaluated:artifact->analysis_coverage->queries_evaluated,queries_validated:artifact->analysis_coverage->queries_validated,ranking_pages_analyzed:artifact->analysis_coverage->ranking_pages_analyzed,competitor_domains_found:artifact->analysis_coverage->competitor_domains_found,problem_queries_validated:artifact->analysis_coverage->problem_queries_validated,solution_queries_validated:artifact->analysis_coverage->solution_queries_validated,content_opportunities_scored:artifact->analysis_coverage->content_opportunities_scored,content_recommendations_selected:artifact->analysis_coverage->content_recommendations_selected,median_keyword_difficulty:artifact->validated_queries->summary->median_keyword_difficulty";

type AnalysisCoverageRow = {
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
};

function isSafeRouteSlug(slug: string) {
  return slug.length > 0 && slug.length <= MAX_SLUG_LENGTH && SAFE_ROUTE_SLUG.test(slug);
}

export async function getAnalysisCoverage(slug: string): Promise<AnalysisScopeData | null> {
  noStore();

  const normalizedSlug = slug.trim();

  if (!isSafeRouteSlug(normalizedSlug)) {
    return null;
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("serp_reports")
    .select(ANALYSIS_COVERAGE_SELECT)
    .eq("slug", normalizedSlug)
    .eq("status", "complete")
    .maybeSingle<AnalysisCoverageRow>();

  if (error) {
    throw new Error(`Unable to load SERP report analysis coverage for "${normalizedSlug}": ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return analysisScopeDataSchema.parse({
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
}
