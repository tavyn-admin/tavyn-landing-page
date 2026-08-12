import "server-only";

import { unstable_noStore as noStore } from "next/cache";

import { getDemoDraftPreview } from "@/lib/serp-report/draftPreviewFixtures";
import { getOpportunityGraphMetrics } from "@/lib/serp-report/opportunityMetrics";
import {
  analysisScopeDataSchema,
  competitorLandscapeCompetitorSourceArraySchema,
  competitorLandscapeDataSchema,
  competitorLandscapeScopeSourceSchema,
  competitorLandscapeSummarySourceSchema,
  contentPlanDataSchema,
  contentPlanItemSourceArraySchema,
  queryOverviewDataSchema,
  queryAnalysisSummaryDataSchema,
  reportOverviewContentPlanSummarySourceSchema,
  reportOverviewDataSchema,
  reportOverviewSearchMarketSourceSchema,
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
  "company_name,company:artifact->company,generated_at:artifact->generated_at,search_market:artifact->search_market,queries_discovered:artifact->analysis_coverage->queries_discovered,queries_evaluated:artifact->analysis_coverage->queries_evaluated,queries_validated:artifact->analysis_coverage->queries_validated,ranking_pages_analyzed:artifact->analysis_coverage->ranking_pages_analyzed,competitor_domains_found:artifact->analysis_coverage->competitor_domains_found,problem_queries_validated:artifact->analysis_coverage->problem_queries_validated,solution_queries_validated:artifact->analysis_coverage->solution_queries_validated,content_opportunities_scored:artifact->analysis_coverage->content_opportunities_scored,content_recommendations_selected:artifact->analysis_coverage->content_recommendations_selected,median_keyword_difficulty:artifact->validated_queries->summary->median_keyword_difficulty,validated_query_total:artifact->validated_queries->summary->total,validated_problem_demand:artifact->validated_queries->summary->problem_demand,validated_solution_demand:artifact->validated_queries->summary->solution_demand,validated_combined_monthly_search_volume:artifact->validated_queries->summary->combined_monthly_search_volume,validated_average_monthly_search_volume:artifact->validated_queries->summary->average_monthly_search_volume,validated_median_monthly_search_volume:artifact->validated_queries->summary->median_monthly_search_volume,validated_query_rows:artifact->validated_queries->queries,content_plan_summary:artifact->content_plan->summary,content_plan_items:artifact->content_plan->items,scored_opportunities:artifact->content_opportunities->scored,competitor_scope:artifact->competitor_landscape->scope,competitor_summary:artifact->competitor_landscape->summary,competitor_rows:artifact->competitor_landscape->competitors";

type SerpReportRow = {
  company_name: unknown;
  company: unknown;
  generated_at: unknown;
  search_market: unknown;
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
  validated_combined_monthly_search_volume: unknown;
  validated_average_monthly_search_volume: unknown;
  validated_median_monthly_search_volume: unknown;
  validated_query_rows: unknown;
  content_plan_summary: unknown;
  content_plan_items: unknown;
  scored_opportunities: unknown;
  competitor_scope: unknown;
  competitor_summary: unknown;
  competitor_rows: unknown;
};

function isSafeRouteSlug(slug: string) {
  return slug.length > 0 && slug.length <= MAX_SLUG_LENGTH && SAFE_ROUTE_SLUG.test(slug);
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function formatTitleCase(value: string) {
  return value
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`)
    .join(" ");
}

function clampPercentage(value: number) {
  return Math.min(100, Math.max(0, value));
}

function formatContentPlanDemandType(territory: "problem_demand" | "solution_demand") {
  return territory === "problem_demand" ? "Problem Demand" : "Solution Demand";
}

function formatSearchIntent(value: string | null) {
  return value?.trim() || "Unspecified";
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
    .toSorted((a, b) => {
      if (a.rank !== b.rank) {
        return a.rank - b.rank;
      }

      return a.domain.localeCompare(b.domain);
    });
  const visibilityLeader = sourceCompetitors[0] ?? null;
  const broadestCoverage =
    sourceCompetitors.length > 0
      ? sourceCompetitors.toSorted((a, b) => {
          if (a.query_coverage_percentage !== b.query_coverage_percentage) {
            return b.query_coverage_percentage - a.query_coverage_percentage;
          }

          if (a.rank !== b.rank) {
            return a.rank - b.rank;
          }

          return a.domain.localeCompare(b.domain);
        })[0]
      : null;

  const competitorLandscape = competitorLandscapeDataSchema.parse({
    companyName: analysisScope.companyName,
    queryCount: competitorScope.query_count,
    totalDomainsFound: competitorSummary.total_domains_found,
    competitorsProfiled: competitorSummary.competitors_included,
    pageOneCompetitors: sourceCompetitors.filter(
      (competitor) => Number.isFinite(competitor.median_position) && competitor.median_position <= 10
    ).length,
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
  const contentPlanItems = contentPlanItemSourceArraySchema.parse(data.content_plan_items ?? []).toSorted((a, b) => {
    if (a.recommendation_rank !== b.recommendation_rank) {
      return a.recommendation_rank - b.recommendation_rank;
    }

    return a.query_id.localeCompare(b.query_id);
  });
  const searchMarket = reportOverviewSearchMarketSourceSchema.parse(data.search_market);
  const contentPlanSummary = reportOverviewContentPlanSummarySourceSchema.parse(data.content_plan_summary);
  const contentPlan = contentPlanDataSchema.parse({
    summary: contentPlanSummary,
    recommendations: contentPlanItems.map((item) => {
      const rankingPages = item.serp_results.ranking_pages
        .map((page, sourceIndex) => ({ page, sourceIndex }))
        .toSorted((a, b) => {
          if (a.page.position !== b.page.position) {
            return a.page.position - b.page.position;
          }

          return a.sourceIndex - b.sourceIndex;
        })
        .slice(0, 10)
        .map(({ page }) => ({
          position: page.position,
          title: page.title,
          domain: page.domain,
          url: page.url,
          snippet: page.snippet,
          publishedDate: page.published_date,
        }));
      const demoDraftPreview = getDemoDraftPreview(normalizedSlug, item.recommendation_rank);

      return {
        id: item.query_id,
        recommendationRank: item.recommendation_rank,
        recommendedTitle: item.recommended_title,
        draftPreview: item.draft_preview ?? demoDraftPreview?.draftPreview,
        draftCategory: item.draft_category ?? demoDraftPreview?.draftCategory,
        draftReadTimeMinutes: item.draft_read_time_minutes ?? demoDraftPreview?.draftReadTimeMinutes,
        draftPreviewHeading: item.draft_preview_heading ?? demoDraftPreview?.draftPreviewHeading,
        draftPreviewContinuation:
          item.draft_preview_continuation ?? demoDraftPreview?.draftPreviewContinuation,
        primaryQuery: item.primary_query,
        opportunityScore: item.opportunity_metrics.opportunity_score,
        monthlySearchVolume: item.query_metrics.search_volume,
        keywordDifficulty: item.query_metrics.keyword_difficulty,
        contentAngle: item.content_angle,
        selectionReasoning: item.selection_reasoning,
        productConnection: item.product_connection,
        demandType: formatContentPlanDemandType(item.territory),
        searchIntent: formatSearchIntent(item.query_metrics.search_intent.main),
        paidCompetition: item.query_metrics.paid_competition,
        searchMomentum: {
          monthly: item.query_metrics.search_volume_trend.monthly,
          quarterly: item.query_metrics.search_volume_trend.quarterly,
          yearly: item.query_metrics.search_volume_trend.yearly,
        },
        topTenBenchmark: item.query_metrics.average_top_10
          ? {
              averageBacklinks: item.query_metrics.average_top_10.backlinks,
              averageReferringDomains: item.query_metrics.average_top_10.referring_domains,
              averageDomainRank: item.query_metrics.average_top_10.main_domain_rank,
            }
          : null,
        rankingPages,
      };
    }),
  });
  const scoredOpportunities = scoredOpportunitySourceArraySchema.parse(data.scored_opportunities ?? []);
  const problemDemandPercentage =
    queryAnalysisSummary.total > 0 ? Math.round((queryAnalysisSummary.problemDemand / queryAnalysisSummary.total) * 100) : 0;
  const solutionDemandPercentage = queryAnalysisSummary.total > 0 ? 100 - problemDemandPercentage : 0;
  const reportOverview = reportOverviewDataSchema.parse({
    companyName: company.name,
    companyDomain: company.domain,
    searchMarket: [
      searchMarket.search_engine,
      searchMarket.country,
      searchMarket.language_name,
      searchMarket.device,
    ]
      .map(formatTitleCase)
      .join(" · "),
    generatedAt: dateFormatter.format(new Date(String(data.generated_at))),
    validatedQueries: queryAnalysisSummary.total,
    combinedMonthlyVolume: data.validated_combined_monthly_search_volume,
    problemDemandPercentage: clampPercentage(problemDemandPercentage),
    solutionDemandPercentage: clampPercentage(solutionDemandPercentage),
    competitorsProfiled: competitorLandscape.competitorsProfiled,
    pageOneCompetitors: competitorLandscape.pageOneCompetitors,
    visibilityLeader: competitorLandscape.visibilityLeader
      ? {
          domain: competitorLandscape.visibilityLeader.domain,
        }
      : null,
    broadestCoverage: competitorLandscape.broadestCoverage
      ? {
          domain: competitorLandscape.broadestCoverage.domain,
          percentage: competitorLandscape.broadestCoverage.queryCoveragePercentage,
        }
      : null,
    opportunitiesScored: analysisScope.contentOpportunitiesScored,
    recommendationsSelected: contentPlanSummary.selected_count,
    problemRecommendations: contentPlanSummary.problem_demand_count,
    solutionRecommendations: contentPlanSummary.solution_demand_count,
    recommendationPageTypes: Array.from(
      new Set(
        contentPlanItems
          .map((item) => item.recommended_page_type)
          .filter((pageType): pageType is string => Boolean(pageType))
          .map(formatTitleCase)
      )
    ),
  });
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
      searchIntent: formatSearchIntent(item.metrics.search_intent.main),
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
    sourceQueries.map((item) => {
      const selected = selectedByQueryId.get(item.query_id);
      const scored = scoredByQueryId.get(item.query_id);
      const status = selected ? "selected" : scored ? "scored" : "validated";
      const graphMetrics = getOpportunityGraphMetrics(item.opportunity_metrics);

      if (!graphMetrics.scoreMatchesMethodology) {
        throw new Error(`Opportunity score for query "${item.query_id}" does not match the Tavyn v2.0 methodology.`);
      }

      return {
        queryId: item.query_id,
        query: item.query,
        demandType: item.territory === "problem_demand" ? "Problem" : "Solution",
        searchIntent: formatSearchIntent(item.metrics.search_intent.main),
        searchVolume: item.metrics.search_volume,
        searchVolumeUsed: item.opportunity_metrics.search_volume_used,
        keywordDifficulty: item.metrics.keyword_difficulty,
        keywordDifficultyUsed: item.opportunity_metrics.keyword_difficulty_used,
        keywordDifficultyWasImputed: item.opportunity_metrics.keyword_difficulty_was_imputed,
        territoryP95SearchVolume: graphMetrics.territoryP95SearchVolume,
        relativeSearchDemand: graphMetrics.relativeSearchDemand,
        rankingAttainability: graphMetrics.rankingAttainability,
        status,
        opportunityScore: graphMetrics.opportunityScore,
        recommendationRank: selected?.recommendationRank ?? null,
      };
    })
  );

  return {
    reportOverview,
    company,
    analysisScope,
    queryAnalysisSummary,
    competitorLandscape,
    contentPlan,
    queryOverview,
    searchOpportunityPoints,
  };
}
