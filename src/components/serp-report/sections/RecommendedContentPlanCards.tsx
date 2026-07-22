"use client";

import type { CSSProperties, KeyboardEvent } from "react";
import { useMemo, useState } from "react";

import type { ContentPlanData, ContentPlanRecommendation } from "@/lib/serp-report/schema";
import styles from "./RecommendedContentPlan.module.css";

const chevronDownSrc = "/serp-report/query-analysis/chevron-down.png";
const ACRONYMS = new Set(["ai", "api", "crm", "cto", "roi", "saas", "seo", "serp", "url"]);
const SIMULATED_RECOMMENDATION_COUNT: number | null = 4;

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const integerFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

type ContentPlanCarouselProps = {
  recommendations: ContentPlanData["recommendations"];
};

type CarouselPosition = "active" | "previous" | "next" | "far";

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function formatInteger(value: number) {
  return integerFormatter.format(value);
}

function formatRecommendationNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}

function clampScore(value: number) {
  return Math.min(100, Math.max(0, value));
}

function formatConfidence(value: ContentPlanRecommendation["confidence"]) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function formatQueryTitle(value: string) {
  return value
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      const normalized = word.toLowerCase();

      if (ACRONYMS.has(normalized)) {
        return normalized.toUpperCase();
      }

      return `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`;
    })
    .join(" ");
}

function getVisibleRecommendations(recommendations: ContentPlanData["recommendations"]) {
  if (SIMULATED_RECOMMENDATION_COUNT === null) {
    return recommendations;
  }

  const visibleRecommendations = recommendations.slice(0, SIMULATED_RECOMMENDATION_COUNT);

  if (visibleRecommendations.length === 0) {
    return visibleRecommendations;
  }

  while (visibleRecommendations.length < SIMULATED_RECOMMENDATION_COUNT) {
    const sourceRecommendation = visibleRecommendations[visibleRecommendations.length % recommendations.length];

    visibleRecommendations.push({
      ...sourceRecommendation,
      id: `${sourceRecommendation.id}-simulated-${visibleRecommendations.length + 1}`,
    });
  }

  return visibleRecommendations;
}

function ContentPlanCard({
  recommendation,
  index,
  averageOpportunityScore,
}: {
  recommendation: ContentPlanRecommendation;
  index: number;
  averageOpportunityScore: number;
}) {
  const opportunityScoreHeight = `${clampScore(recommendation.opportunityScore)}%`;
  const averageScoreHeight = `${clampScore(averageOpportunityScore)}%`;

  return (
    <article className={styles.card}>
      <header className={styles.cardHeader}>
        <h2>{formatQueryTitle(recommendation.primaryQuery)}</h2>
        <span>{formatRecommendationNumber(index)}</span>
      </header>

      <div className={styles.cardBody}>
        <div className={styles.graphColumn}>
          <div className={styles.metricHeader}>
            <span>Opportunity Score</span>
            <strong>{formatNumber(recommendation.opportunityScore)}</strong>
          </div>

          <div className={styles.scoreGraph} aria-hidden="true">
            <div className={styles.scoreBarSlot}>
              <div className={styles.scoreBar} style={{ height: opportunityScoreHeight }} />
            </div>
            <div className={styles.avgBarSlot} style={{ "--avg-label-y": averageScoreHeight } as CSSProperties}>
              <div className={styles.avgBar} style={{ height: averageScoreHeight }} />
              <span>Avg</span>
            </div>
          </div>
        </div>

        <dl className={styles.metricsColumn}>
          <div>
            <dt>Monthly Search Volume</dt>
            <dd>{formatInteger(recommendation.monthlySearchVolume)}</dd>
          </div>
          <div>
            <dt>Difficulty</dt>
            <dd>{formatNumber(recommendation.keywordDifficulty)}</dd>
          </div>
          <div>
            <dt>Confidence</dt>
            <dd>{formatConfidence(recommendation.confidence)}</dd>
          </div>
        </dl>
      </div>

      <img className={styles.cardChevron} src={chevronDownSrc} alt="" aria-hidden="true" />
    </article>
  );
}

function getCarouselPosition(index: number, activeIndex: number): CarouselPosition {
  const relativeIndex = (index - activeIndex + 4) % 4;

  if (relativeIndex === 0) {
    return "active";
  }

  if (relativeIndex === 1) {
    return "next";
  }

  if (relativeIndex === 3) {
    return "previous";
  }

  return "far";
}

function getCarouselPositionClass(position: CarouselPosition) {
  if (position === "active") {
    return styles.cardPositionActive;
  }

  if (position === "next") {
    return styles.cardPositionNext;
  }

  if (position === "previous") {
    return styles.cardPositionPrevious;
  }

  return styles.cardPositionFar;
}

function StaticContentPlanCards({
  recommendations,
  averageOpportunityScore,
}: {
  recommendations: ContentPlanData["recommendations"];
  averageOpportunityScore: number;
}) {
  return (
    <div className={styles.staticCardRow} data-count={recommendations.length}>
      {recommendations.map((recommendation, index) => (
        <div className={styles.staticCardItem} key={recommendation.id}>
          <ContentPlanCard
            recommendation={recommendation}
            index={index}
            averageOpportunityScore={averageOpportunityScore}
          />
        </div>
      ))}
    </div>
  );
}

function FourCardContentPlanCarousel({
  recommendations,
  averageOpportunityScore,
}: {
  recommendations: ContentPlanData["recommendations"];
  averageOpportunityScore: number;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  function showRecommendation(nextIndex: number) {
    setActiveIndex((nextIndex + recommendations.length) % recommendations.length);
  }

  function handleCarouselKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showRecommendation(activeIndex - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showRecommendation(activeIndex + 1);
    }
  }

  return (
    <div
      className={styles.carouselStage}
      aria-label="Content recommendations carousel"
      aria-live="polite"
      tabIndex={0}
      onKeyDown={handleCarouselKeyDown}
    >
      {recommendations.map((recommendation, index) => {
        const position = getCarouselPosition(index, activeIndex);
        const isClickable = position === "previous" || position === "next";
        const title = formatQueryTitle(recommendation.primaryQuery);

        return (
          <div
            className={`${styles.cardLayer} ${getCarouselPositionClass(position)} ${
              isClickable ? styles.cardLayerClickable : ""
            }`}
            aria-hidden={position === "far"}
            aria-label={isClickable ? `Show recommendation ${index + 1}: ${title}` : undefined}
            key={recommendation.id}
            onClick={isClickable ? () => showRecommendation(index) : undefined}
            onKeyDown={
              isClickable
                ? (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      showRecommendation(index);
                    }
                  }
                : undefined
            }
            role={isClickable ? "button" : undefined}
            tabIndex={isClickable ? 0 : undefined}
          >
            <ContentPlanCard
              recommendation={recommendation}
              index={index}
              averageOpportunityScore={averageOpportunityScore}
            />
          </div>
        );
      })}
    </div>
  );
}

export default function ContentPlanCarousel({ recommendations }: ContentPlanCarouselProps) {
  const visibleRecommendations = getVisibleRecommendations(recommendations);
  const shouldUseCarousel = visibleRecommendations.length === 4;
  const averageOpportunityScore = useMemo(() => {
    if (visibleRecommendations.length === 0) {
      return 0;
    }

    return (
      visibleRecommendations.reduce((sum, recommendation) => sum + recommendation.opportunityScore, 0) /
      visibleRecommendations.length
    );
  }, [visibleRecommendations]);

  if (visibleRecommendations.length === 0) {
    return <div className={styles.emptyState}>No content recommendations are available for this report.</div>;
  }

  if (!shouldUseCarousel) {
    return (
      <StaticContentPlanCards
        recommendations={visibleRecommendations}
        averageOpportunityScore={averageOpportunityScore}
      />
    );
  }

  return (
    <FourCardContentPlanCarousel
      recommendations={visibleRecommendations}
      averageOpportunityScore={averageOpportunityScore}
    />
  );
}
