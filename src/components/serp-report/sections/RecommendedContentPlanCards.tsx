"use client";

import { useRef, useState, type KeyboardEvent } from "react";

import type { ContentPlanData, ContentPlanRecommendation } from "@/lib/serp-report/schema";
import ExpandedContentPlanCard from "./ExpandedContentPlanCard";
import styles from "./RecommendedContentPlan.module.css";

const numberFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const integerFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const publishLabels = ["Publish first", "Publish second", "Publish third"] as const;

type ContentPlanCardsProps = {
  recommendations: ContentPlanData["recommendations"];
  averageOpportunityScore: number;
  companyName: string;
};

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function formatInteger(value: number) {
  return integerFormatter.format(value);
}

function formatRecommendationNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}

function RecommendationSummary({
  recommendation,
  index,
}: {
  recommendation: ContentPlanRecommendation;
  index: number;
}) {
  const title = recommendation.recommendedTitle || recommendation.primaryQuery;

  return (
    <span className={styles.recommendationSummary}>
      <span className={styles.recommendationSequence}>
        <strong>{formatRecommendationNumber(index)}</strong>
        <span>{publishLabels[index]}</span>
      </span>
      <span className={styles.recommendationTitle}>{title}</span>
      <span className={styles.recommendationQuery}>Target query: {recommendation.primaryQuery}</span>
      <span className={styles.recommendationMetrics}>
        <span>
          <small>Monthly volume</small>
          <strong>{formatInteger(recommendation.monthlySearchVolume)}</strong>
        </span>
        <span>
          <small>Difficulty</small>
          <strong>{formatNumber(recommendation.keywordDifficulty)}</strong>
        </span>
        <span>
          <small>Opportunity</small>
          <strong>{formatNumber(recommendation.opportunityScore)}</strong>
        </span>
      </span>
    </span>
  );
}

export default function RecommendedContentPlanCards({
  recommendations,
  averageOpportunityScore,
  companyName,
}: ContentPlanCardsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeRecommendation = recommendations[activeIndex] ?? recommendations[0];

  function selectTab(index: number, moveFocus = false) {
    setActiveIndex(index);
    if (moveFocus) {
      tabRefs.current[index]?.focus();
    }
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | null = null;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = (index + 1) % recommendations.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      nextIndex = (index - 1 + recommendations.length) % recommendations.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = recommendations.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      selectTab(nextIndex, true);
    }
  }

  return (
    <div className={styles.contentPlanStack}>
      <div className={styles.desktopSurface}>
        <div className={styles.recommendationNavigator} role="tablist" aria-label="Content sprint recommendations">
          {recommendations.map((recommendation, index) => {
            const tabId = `content-sprint-tab-${index}`;
            const panelId = `content-sprint-panel-${index}`;
            const isActive = activeIndex === index;

            return (
              <button
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                id={tabId}
                key={recommendation.id}
                type="button"
                role="tab"
                className={styles.recommendationButton}
                data-active={isActive ? "true" : undefined}
                aria-selected={isActive}
                aria-controls={panelId}
                tabIndex={isActive ? 0 : -1}
                onClick={() => selectTab(index)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
              >
                <RecommendationSummary recommendation={recommendation} index={index} />
              </button>
            );
          })}
        </div>

        <ExpandedContentPlanCard
          key={activeRecommendation.id}
          id={`content-sprint-panel-${activeIndex}`}
          labelledBy={`content-sprint-tab-${activeIndex}`}
          recommendation={activeRecommendation}
          index={activeIndex}
          averageOpportunityScore={averageOpportunityScore}
          companyName={companyName}
          panelRole="tabpanel"
        />
      </div>

      <div className={styles.mobileAccordion}>
        {recommendations.map((recommendation, index) => {
          const isActive = activeIndex === index;
          const triggerId = `mobile-content-sprint-trigger-${index}`;
          const panelId = `mobile-content-sprint-panel-${index}`;

          return (
            <section className={styles.mobileRecommendation} data-active={isActive ? "true" : undefined} key={recommendation.id}>
              <button
                id={triggerId}
                type="button"
                className={styles.mobileRecommendationButton}
                aria-expanded={isActive}
                aria-controls={panelId}
                onClick={() => selectTab(index)}
              >
                <RecommendationSummary recommendation={recommendation} index={index} />
              </button>
              {isActive ? (
                <ExpandedContentPlanCard
                  key={recommendation.id}
                  id={panelId}
                  labelledBy={triggerId}
                  recommendation={recommendation}
                  index={index}
                  averageOpportunityScore={averageOpportunityScore}
                  companyName={companyName}
                  panelRole="region"
                />
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}
