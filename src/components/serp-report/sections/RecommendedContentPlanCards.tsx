"use client";

import type { CSSProperties, KeyboardEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import type { ContentPlanData, ContentPlanRecommendation } from "@/lib/serp-report/schema";
import styles from "./RecommendedContentPlan.module.css";

const chevronDownSrc = "/serp-report/query-analysis/chevron-down.png";
const DESKTOP_PAGE_SIZE = 2;
const MOBILE_PAGE_SIZE = 1;
const ACRONYMS = new Set(["ai", "api", "crm", "cto", "roi", "saas", "seo", "serp", "url"]);

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const integerFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

type ContentPlanCarouselProps = {
  recommendations: ContentPlanData["recommendations"];
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

function getVisibleCount(pageIndex: number, pageSize: number, recommendationCount: number) {
  return Math.max(0, Math.min(pageSize, recommendationCount - pageIndex * pageSize));
}

function getCardState({
  index,
  currentPageIndex,
  pageSize,
  visibleCount,
}: {
  index: number;
  currentPageIndex: number;
  pageSize: number;
  visibleCount: number;
}) {
  const pageStartIndex = currentPageIndex * pageSize;
  const relativeIndex = index - pageStartIndex;

  if (relativeIndex < 0) {
    return {
      ariaHidden: true,
      className: styles.cardLayerHidden,
      style: {
        "--card-x": "-24%",
        "--card-y": "0px",
        "--card-scale": 0.86,
        "--card-opacity": 0,
        "--card-z": 0,
        "--card-brightness": 0.6,
      } as CSSProperties,
    };
  }

  if (relativeIndex < pageSize) {
    const isSingleFinalDesktopCard = pageSize === DESKTOP_PAGE_SIZE && visibleCount === 1;
    const x = isSingleFinalDesktopCard ? "50%" : relativeIndex === 0 ? "0px" : "calc(var(--content-plan-card-width) + 18px)";

    return {
      ariaHidden: false,
      className: `${styles.cardLayerForeground} ${isSingleFinalDesktopCard ? styles.cardLayerSingle : ""}`,
      style: {
        "--card-x": x,
        "--card-y": "0px",
        "--card-scale": 1,
        "--card-opacity": 1,
        "--card-z": 10 - relativeIndex,
        "--card-brightness": 1,
      } as CSSProperties,
    };
  }

  const previewIndex = relativeIndex - pageSize;
  const previewX =
    pageSize === MOBILE_PAGE_SIZE
      ? `calc(var(--content-plan-card-width) + 18px + ${previewIndex * 36}px)`
      : `calc(var(--content-plan-card-width) + var(--content-plan-card-width) + 36px + ${previewIndex * 44}px)`;

  return {
    ariaHidden: true,
    className: styles.cardLayerPreview,
    style: {
      "--card-x": previewX,
      "--card-y": `${18 + previewIndex * 10}px`,
      "--card-scale": 0.72 - previewIndex * 0.06,
      "--card-opacity": Math.max(0.18, 0.42 - previewIndex * 0.12),
      "--card-z": 4 - previewIndex,
      "--card-brightness": Math.max(0.42, 0.62 - previewIndex * 0.08),
    } as CSSProperties,
  };
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

export default function ContentPlanCarousel({ recommendations }: ContentPlanCarouselProps) {
  const [isMobileCarousel, setIsMobileCarousel] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const pageSize = isMobileCarousel ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE;
  const averageOpportunityScore = useMemo(() => {
    if (recommendations.length === 0) {
      return 0;
    }

    return recommendations.reduce((sum, recommendation) => sum + recommendation.opportunityScore, 0) / recommendations.length;
  }, [recommendations]);
  const pageCount = Math.ceil(recommendations.length / pageSize);
  const canGoPrevious = currentPageIndex > 0;
  const canGoNext = currentPageIndex < pageCount - 1;
  const visibleCount = getVisibleCount(currentPageIndex, pageSize, recommendations.length);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const updateCarouselMode = () => setIsMobileCarousel(mediaQuery.matches);

    updateCarouselMode();
    mediaQuery.addEventListener("change", updateCarouselMode);

    return () => mediaQuery.removeEventListener("change", updateCarouselMode);
  }, []);

  useEffect(() => {
    setCurrentPageIndex((index) => Math.min(index, Math.max(0, pageCount - 1)));
  }, [pageCount]);

  function goToPage(nextPageIndex: number) {
    setCurrentPageIndex(Math.min(Math.max(nextPageIndex, 0), Math.max(0, pageCount - 1)));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft" && canGoPrevious) {
      event.preventDefault();
      goToPage(currentPageIndex - 1);
    }

    if (event.key === "ArrowRight" && canGoNext) {
      event.preventDefault();
      goToPage(currentPageIndex + 1);
    }
  }

  if (recommendations.length === 0) {
    return <div className={styles.emptyState}>No content recommendations are available for this report.</div>;
  }

  return (
    <div className={styles.carousel} onKeyDown={handleKeyDown}>
      <button
        type="button"
        className={`${styles.carouselArrow} ${styles.previousArrow}`}
        aria-label="Show previous recommendations"
        disabled={!canGoPrevious}
        onClick={() => goToPage(currentPageIndex - 1)}
      >
        <img src={chevronDownSrc} alt="" aria-hidden="true" />
      </button>

      <div className={styles.carouselStage} aria-label="Content recommendations carousel" aria-live="polite" tabIndex={0}>
        {recommendations.map((recommendation, index) => {
          const cardState = getCardState({
            index,
            currentPageIndex,
            pageSize,
            visibleCount,
          });

          return (
            <div
              className={`${styles.cardLayer} ${cardState.className}`}
              style={cardState.style}
              aria-hidden={cardState.ariaHidden}
              key={recommendation.id}
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

      <button
        type="button"
        className={`${styles.carouselArrow} ${styles.nextArrow}`}
        aria-label="Show next recommendations"
        disabled={!canGoNext}
        onClick={() => goToPage(currentPageIndex + 1)}
      >
        <img src={chevronDownSrc} alt="" aria-hidden="true" />
      </button>
    </div>
  );
}
