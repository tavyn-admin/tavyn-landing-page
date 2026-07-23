"use client";

import type { ContentPlanData, ContentPlanRecommendation } from "@/lib/serp-report/schema";
import ExpandedContentPlanCard from "./ExpandedContentPlanCard";
import MetricTooltip from "./MetricTooltip";
import styles from "./RecommendedContentPlan.module.css";

const chevronDownSrc = "/serp-report/query-analysis/chevron-down.png";
const opportunityScoreTooltip =
  "A 0–100 score combining search demand and ranking difficulty. Higher scores indicate stronger opportunities. The Avg bar represents the average across all validated candidates.";
const difficultyTooltip =
  "An estimated 0–100 score of how competitive it may be to rank organically for this query. Lower scores indicate an easier opportunity to rank for.";

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const integerFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

type ContentPlanCardsProps = {
  recommendations: ContentPlanData["recommendations"];
  averageOpportunityScore: number;
  selectedRecommendationIndex: number | null;
  onToggleRecommendation: (index: number) => void;
  onCloseRecommendation: () => void;
};

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function formatInteger(value: number) {
  return integerFormatter.format(value);
}

function formatRecommendationNumber(rank: number) {
  return String(rank).padStart(2, "0");
}

function clampScore(value: number) {
  return Math.min(100, Math.max(0, value));
}

function ContentPlanCard({
  recommendation,
  averageOpportunityScore,
  index,
  isExpanded,
  expandedPanelId,
  onToggle,
}: {
  recommendation: ContentPlanRecommendation;
  averageOpportunityScore: number;
  index: number;
  isExpanded: boolean;
  expandedPanelId: string;
  onToggle: () => void;
}) {
  const opportunityScoreHeight = `${clampScore(recommendation.opportunityScore)}%`;
  const averageScoreHeight = `${clampScore(averageOpportunityScore)}%`;
  const formattedOpportunityScore = formatNumber(recommendation.opportunityScore);
  const formattedAverageScore = formatNumber(averageOpportunityScore);

  return (
    <article className={styles.card}>
      <header className={styles.cardHeader}>
        <h2 title={recommendation.recommendedTitle}>{recommendation.recommendedTitle}</h2>
        <span>{formatRecommendationNumber(index + 1)}</span>
      </header>

      <div className={styles.cardMain}>
        <div className={styles.graphColumn}>
          <div
            className={styles.scoreGraph}
            aria-label={`Opportunity score comparison: average ${formattedAverageScore}, target query ${formattedOpportunityScore}.`}
            role="group"
          >
            <div className={styles.yAxisLabel}>
              <span className={styles.metricLabel}>
                <span className={styles.yAxisLabelText}>Opportunity Score</span>
                <MetricTooltip
                  id={`content-plan-opportunity-score-${index}`}
                  label="Opportunity Score"
                  description={opportunityScoreTooltip}
                  align="start"
                  side="bottom"
                />
              </span>
            </div>
            <div className={styles.graphPlot}>
              <div className={styles.barTrack}>
                <div className={styles.barGroup}>
                  <span className={styles.barValue}>{formattedAverageScore}</span>
                  <div className={styles.scoreBarSlot}>
                    <div className={styles.avgBar} style={{ height: averageScoreHeight }} />
                  </div>
                </div>
                <div className={styles.barGroup}>
                  <span className={styles.barValue}>{formattedOpportunityScore}</span>
                  <div className={styles.scoreBarSlot}>
                    <div className={styles.scoreBar} style={{ height: opportunityScoreHeight }} />
                  </div>
                </div>
              </div>
              <div className={styles.xAxisLabels}>
                <span className={styles.xAxisLabel}>Average</span>
                <span className={styles.xAxisLabel}>Target Query</span>
              </div>
            </div>
          </div>
        </div>

        <dl className={styles.metricsColumn}>
          <div className={styles.targetQueryMetric}>
            <dt>Target Query</dt>
            <dd className={styles.targetQueryValue}>{recommendation.primaryQuery}</dd>
          </div>
          <div>
            <dt>Monthly Search Volume</dt>
            <dd>{formatInteger(recommendation.monthlySearchVolume)}</dd>
          </div>
          <div>
            <dt className={styles.difficultyLabel}>
              <span>Difficulty</span>
              <MetricTooltip
                id={`content-plan-difficulty-${index}`}
                label="Difficulty"
                description={difficultyTooltip}
                align="end"
                side="top"
              />
            </dt>
            <dd>{formatNumber(recommendation.keywordDifficulty)}</dd>
          </div>
        </dl>
      </div>

      <footer className={styles.cardFooter}>
        <button
          type="button"
          className={styles.cardChevronButton}
          aria-expanded={isExpanded}
          aria-controls={expandedPanelId}
          aria-label={`${isExpanded ? "Close" : "Open"} content brief for ${recommendation.recommendedTitle}`}
          onClick={onToggle}
        >
          <img className={styles.cardChevron} src={chevronDownSrc} alt="" aria-hidden="true" />
        </button>
      </footer>
    </article>
  );
}

export default function RecommendedContentPlanCards({
  recommendations,
  averageOpportunityScore,
  selectedRecommendationIndex,
  onToggleRecommendation,
  onCloseRecommendation,
}: ContentPlanCardsProps) {
  const selectedRecommendation =
    selectedRecommendationIndex === null ? null : recommendations[selectedRecommendationIndex] ?? null;
  const expandedPanelId = "recommended-content-plan-expanded";

  return (
    <div className={styles.contentPlanStack}>
      <div className={styles.staticCardRow}>
        {recommendations.map((recommendation, index) => (
          <div className={styles.staticCardItem} key={recommendation.id}>
            <ContentPlanCard
              recommendation={recommendation}
              averageOpportunityScore={averageOpportunityScore}
              index={index}
              isExpanded={selectedRecommendationIndex === index}
              expandedPanelId={expandedPanelId}
              onToggle={() => onToggleRecommendation(index)}
            />
          </div>
        ))}
      </div>

      {selectedRecommendation && selectedRecommendationIndex !== null ? (
        <ExpandedContentPlanCard
          id={expandedPanelId}
          key={selectedRecommendation.id}
          recommendation={selectedRecommendation}
          index={selectedRecommendationIndex}
          averageOpportunityScore={averageOpportunityScore}
          onClose={onCloseRecommendation}
        />
      ) : null}
    </div>
  );
}
