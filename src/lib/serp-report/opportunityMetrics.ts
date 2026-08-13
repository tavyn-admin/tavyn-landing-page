const SCORE_ROUNDING_TOLERANCE = 0.11;

type OpportunityMetricsSource = {
    demand_score: number;
    attainability_score: number;
    opportunity_score: number;
    territory_p95_search_volume?: number;
    maximum_territory_search_volume?: number;
};

function clampPercentage(value: number) {
    return Math.min(100, Math.max(0, value));
}

export function getOpportunityGraphMetrics(metrics: OpportunityMetricsSource) {
    const relativeSearchDemand = clampPercentage(metrics.demand_score * 100);
    const rankingAttainability = clampPercentage(
        metrics.attainability_score * 100,
    );
    const opportunityScore = clampPercentage(metrics.opportunity_score);
    const expectedScore =
        0.7 * relativeSearchDemand + 0.3 * rankingAttainability;

    return {
        relativeSearchDemand,
        rankingAttainability,
        opportunityScore,
        territoryP95SearchVolume:
            metrics.territory_p95_search_volume ??
            metrics.maximum_territory_search_volume ??
            0,
        scoreMatchesMethodology:
            Math.abs(opportunityScore - expectedScore) <=
            SCORE_ROUNDING_TOLERANCE,
    };
}
