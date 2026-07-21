import "server-only";

import { unstable_noStore as noStore } from "next/cache";

import {
  analysisScopeDataSchema,
  competitorLandscapeCompetitorSourceArraySchema,
  competitorLandscapeDataSchema,
  competitorLandscapeScopeSourceSchema,
  competitorLandscapeSummarySourceSchema,
  contentPlanItemSourceArraySchema,
  queryOverviewDataSchema,
  queryAnalysisSummaryDataSchema,
  scoredOpportunitySourceArraySchema,
  searchOpportunityPointArraySchema,
  serpReportCompanySchema,
  validatedQueryOverviewSourceArraySchema,
  type SerpReportData,
} from "@/lib/serp-report/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const SAFE_ROUTE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 160;

export const SERP_REPORT_SELECT =
  "company_name,company:artifact->company,queries_discovered:artifact->analysis_coverage->queries_discovered,queries_evaluated:artifact->analysis_coverage->queries_evaluated,queries_validated:artifact->analysis_coverage->queries_validated,ranking_pages_analyzed:artifact->analysis_coverage->ranking_pages_analyzed,competitor_domains_found:artifact->analysis_coverage->competitor_domains_found,problem_queries_validated:artifact->analysis_coverage->problem_queries_validated,solution_queries_validated:artifact->analysis_coverage->solution_queries_validated,content_opportunities_scored:artifact->analysis_coverage->content_opportunities_scored,content_recommendations_selected:artifact->analysis_coverage->content_recommendations_selected,median_keyword_difficulty:artifact->validated_queries->summary->median_keyword_difficulty,validated_query_total:artifact->validated_queries->summary->total,validated_problem_demand:artifact->validated_queries->summary->problem_demand,validated_solution_demand:artifact->validated_queries->summary->solution_demand,validated_average_monthly_search_volume:artifact->validated_queries->summary->average_monthly_search_volume,validated_median_monthly_search_volume:artifact->validated_queries->summary->median_monthly_search_volume,validated_query_rows:artifact->validated_queries->queries,content_plan_items:artifact->content_plan->items,scored_opportunities:artifact->content_opportunities->scored,competitor_scope:artifact->competitor_landscape->scope,competitor_summary:artifact->competitor_landscape->summary,competitor_rows:artifact->competitor_landscape->competitors";

type SerpReportRow = {
  company_name: unknown;
  company: unknown;
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
  competitor_scope: unknown;
  competitor_summary: unknown;
  competitor_rows: unknown;
};

function isSafeRouteSlug(slug: string) {
  return slug.length > 0 && slug.length <= MAX_SLUG_LENGTH && SAFE_ROUTE_SLUG.test(slug);
}

function getRankingDetails(
  queryPositions: Array<{
    query: string;
    positions: number[];
  }>
) {
  const rankingsByQuery = new Map<string, { query: string; position: number }>();

  queryPositions.forEach((item) => {
    if (item.positions.length === 0) {
      return;
    }

    const query = item.query.trim().replace(/\s+/g, " ");

    if (query.length === 0) {
      return;
    }

    const normalizedQuery = query.toLowerCase();
    const bestPosition = Math.min(...item.positions);
    const existing = rankingsByQuery.get(normalizedQuery);

    if (!existing || bestPosition < existing.position) {
      rankingsByQuery.set(normalizedQuery, {
        query,
        position: bestPosition,
      });
    }
  });

  const uniqueQueryRankings = Array.from(rankingsByQuery.values());
  const pageOneQueries = uniqueQueryRankings.filter((ranking) => ranking.position >= 1 && ranking.position <= 10).length;
  const pageTwoQueries = uniqueQueryRankings.filter((ranking) => ranking.position >= 11 && ranking.position <= 20).length;
  const lowerRankingQueries = uniqueQueryRankings.filter((ranking) => ranking.position >= 21).length;
  const matchedQueries = uniqueQueryRankings.length;

  return {
    rankingFootprint: {
      matchedQueries,
      pageOneQueries,
      pageTwoQueries,
      lowerRankingQueries,
      pageOneShare: matchedQueries > 0 ? (pageOneQueries / matchedQueries) * 100 : 0,
    },
    strongestQueryRankings: uniqueQueryRankings
      .toSorted((a, b) => {
        if (a.position !== b.position) {
          return a.position - b.position;
        }

        return a.query.localeCompare(b.query);
      })
      .slice(0, 5),
  };
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

  const company = serpReportCompanySchema.parse(data.company);

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

  const competitorScope = competitorLandscapeScopeSourceSchema.parse(data.competitor_scope);
  const competitorSummary = competitorLandscapeSummarySourceSchema.parse(data.competitor_summary);
  const sourceCompetitors = competitorLandscapeCompetitorSourceArraySchema
    .parse(data.competitor_rows ?? [])
    .toSorted((a, b) => a.rank - b.rank);
  const visibilityLeader = sourceCompetitors[0] ?? null;
  const broadestCoverage =
    sourceCompetitors.length > 0
      ? sourceCompetitors.reduce((leader, competitor) =>
          competitor.query_coverage_percentage > leader.query_coverage_percentage ? competitor : leader
        )
      : null;

  const competitorLandscape = competitorLandscapeDataSchema.parse({
    companyName: analysisScope.companyName,
    queryCount: competitorScope.query_count,
    totalDomainsFound: competitorSummary.total_domains_found,
    competitorsProfiled: competitorSummary.competitors_included,
    pageOneCompetitors: sourceCompetitors.filter((competitor) => competitor.median_position <= 10).length,
    visibilityLeader: visibilityLeader
      ? {
          domain: visibilityLeader.domain,
          queryCoveragePercentage: visibilityLeader.query_coverage_percentage,
          medianPosition: visibilityLeader.median_position,
          keywordsRankedCount: visibilityLeader.keywords_ranked_count,
        }
      : null,
    broadestCoverage: broadestCoverage
      ? {
          domain: broadestCoverage.domain,
          queryCoveragePercentage: broadestCoverage.query_coverage_percentage,
        }
      : null,
    competitors: sourceCompetitors.map((competitor) => {
      const rankingDetails = getRankingDetails(competitor.query_positions);

      return {
        rank: competitor.rank,
        domain: competitor.domain,
        keywordsRankedCount: competitor.keywords_ranked_count,
        queryCoveragePercentage: competitor.query_coverage_percentage,
        averagePosition: competitor.average_position,
        medianPosition: competitor.median_position,
        estimatedTraffic: competitor.estimated_traffic_from_analyzed_queries,
        rankingFootprint: rankingDetails.rankingFootprint,
        strongestQueryRankings: rankingDetails.strongestQueryRankings,
      };
    }),
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
    company,
    analysisScope,
    queryAnalysisSummary,
    competitorLandscape,
    queryOverview,
    searchOpportunityPoints,
  };
}
