import type { SearchOpportunityPoint } from '@/lib/serp-report/schema';

const MAX_NORMALIZED_DELTA = 3;
// The largest rendered marker outline is about 12px across. Six pixels of
// clearance prevents nearby markers from visually colliding.
const MIN_RENDERED_MARKER_SEPARATION = 18;

export type OpportunityCluster = {
    id: string;
    points: SearchOpportunityPoint[];
    rankingAttainability: number;
    relativeSearchDemand: number;
    hasSelected: boolean;
    hasTopTwenty: boolean;
    hasMixedTerritories: boolean;
    opportunityScore: number;
};

export function clusterOpportunityPoints(
    points: SearchOpportunityPoint[],
    renderedPlotWidth: number,
    renderedPlotHeight: number,
) {
    const sortedPoints = [...points].sort((a, b) => {
        if (a.rankingAttainability !== b.rankingAttainability) {
            return a.rankingAttainability - b.rankingAttainability;
        }

        if (a.relativeSearchDemand !== b.relativeSearchDemand) {
            return a.relativeSearchDemand - b.relativeSearchDemand;
        }

        return a.queryId.localeCompare(b.queryId);
    });
    const groups: SearchOpportunityPoint[][] = [];

    const pointsAreClose = (
        first: SearchOpportunityPoint,
        second: SearchOpportunityPoint,
    ) => {
        const deltaX = Math.abs(
            first.rankingAttainability - second.rankingAttainability,
        );
        const deltaY = Math.abs(
            first.relativeSearchDemand - second.relativeSearchDemand,
        );
        const renderedDistance = Math.hypot(
            (deltaX / 100) * renderedPlotWidth,
            (deltaY / 100) * renderedPlotHeight,
        );

        return (
            deltaX <= MAX_NORMALIZED_DELTA &&
            deltaY <= MAX_NORMALIZED_DELTA &&
            renderedDistance < MIN_RENDERED_MARKER_SEPARATION
        );
    };

    sortedPoints.forEach((point) => {
        // Complete-link grouping keeps every pair close, preventing transitive
        // chains from pulling visually distinct queries into one cluster.
        const matchingGroup = groups.find((group) =>
            group.every((member) => pointsAreClose(point, member)),
        );

        if (matchingGroup) {
            matchingGroup.push(point);
        } else {
            groups.push([point]);
        }
    });

    return groups.map((group): OpportunityCluster => {
        const centroid = group.reduce(
            (total, point) => ({
                x: total.x + point.rankingAttainability / group.length,
                y: total.y + point.relativeSearchDemand / group.length,
            }),
            { x: 0, y: 0 },
        );
        const representative = group.reduce((closest, point) => {
            const closestDistance = Math.hypot(
                ((closest.rankingAttainability - centroid.x) / 100) *
                    renderedPlotWidth,
                ((closest.relativeSearchDemand - centroid.y) / 100) *
                    renderedPlotHeight,
            );
            const pointDistance = Math.hypot(
                ((point.rankingAttainability - centroid.x) / 100) *
                    renderedPlotWidth,
                ((point.relativeSearchDemand - centroid.y) / 100) *
                    renderedPlotHeight,
            );

            return pointDistance < closestDistance ||
                (pointDistance === closestDistance &&
                    point.queryId.localeCompare(closest.queryId) < 0)
                ? point
                : closest;
        }, group[0]);
        const territories = new Set(group.map((point) => point.demandType));
        const queryIds = group.map((point) => point.queryId).toSorted();

        return {
            id: queryIds.join('--'),
            points: [...group].sort((a, b) => {
                const statusPriority = {
                    selected: 0,
                    scored: 1,
                    validated: 2,
                } as const;
                const statusDifference =
                    statusPriority[a.status] - statusPriority[b.status];

                if (statusDifference !== 0) {
                    return statusDifference;
                }

                if (a.recommendationRank !== b.recommendationRank) {
                    return (
                        (a.recommendationRank ?? Number.POSITIVE_INFINITY) -
                        (b.recommendationRank ?? Number.POSITIVE_INFINITY)
                    );
                }

                return (
                    b.opportunityScore - a.opportunityScore ||
                    a.query.localeCompare(b.query)
                );
            }),
            rankingAttainability: representative.rankingAttainability,
            relativeSearchDemand: representative.relativeSearchDemand,
            hasSelected: group.some((point) => point.status === 'selected'),
            hasTopTwenty: group.some((point) => point.status === 'scored'),
            hasMixedTerritories: territories.size > 1,
            opportunityScore: Math.max(
                ...group.map((point) => point.opportunityScore),
            ),
        };
    });
}
