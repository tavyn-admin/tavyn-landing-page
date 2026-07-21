import type { CSSProperties } from "react";

import { COLORS } from "@/components/tokens";
import type { QueryAnalysisSummaryData, QueryOverviewItem, SearchOpportunityPoint } from "@/lib/serp-report/schema";
import QueryList from "./QueryList";
import SearchOpportunityMap from "./SearchOpportunityMap";
import styles from "./QueryAnalysis.module.css";

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

type QueryAnalysisProps = {
  summary: QueryAnalysisSummaryData;
  queries: QueryOverviewItem[];
  opportunityPoints: SearchOpportunityPoint[];
};

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

// Demand concentration thresholds: no demand, zero-median skew, 3x+, 1.5x-3x, then even distribution.
function getDemandConcentrationPhrase(summary: QueryAnalysisSummaryData) {
  if (summary.averageMonthlySearchVolume === 0 && summary.medianMonthlySearchVolume === 0) {
    return "shows no measurable monthly search demand";
  }

  if (summary.medianMonthlySearchVolume === 0) {
    return "is concentrated among a smaller group of high-volume terms";
  }

  const volumeRatio = summary.averageMonthlySearchVolume / summary.medianMonthlySearchVolume;

  if (volumeRatio >= 3) {
    return "is concentrated among a smaller group of high-volume terms";
  }

  if (volumeRatio >= 1.5) {
    return "is somewhat concentrated among higher-volume terms";
  }

  return "is distributed relatively evenly across the validated queries";
}

// Intent thresholds compare the leading share to a 50/50 split: 0-5 balanced, >5-15 slight, >15 strong.
function getIntentSentence(summary: QueryAnalysisSummaryData) {
  const intentTotal = summary.problemDemand + summary.solutionDemand;

  if (intentTotal === 0) {
    return "Intent could not be classified because no problem- or solution-focused queries were available.";
  }

  const solutionShare = (summary.solutionDemand / intentTotal) * 100;
  const distanceFromEven = Math.abs(solutionShare - 50);

  if (distanceFromEven <= 5) {
    return `Intent is evenly balanced, with ${formatNumber(
      summary.problemDemand
    )} problem-focused queries and ${formatNumber(summary.solutionDemand)} solution-focused queries.`;
  }

  const leadingStrength = distanceFromEven <= 15 ? "slightly" : "strongly";

  if (summary.solutionDemand > summary.problemDemand) {
    return `Intent leans ${leadingStrength} solution-led, with ${formatNumber(
      summary.solutionDemand
    )} solution-focused queries compared with ${formatNumber(summary.problemDemand)} problem-focused queries.`;
  }

  return `Intent leans ${leadingStrength} problem-led, with ${formatNumber(
    summary.problemDemand
  )} problem-focused queries compared with ${formatNumber(summary.solutionDemand)} solution-focused queries.`;
}

// Keyword difficulty thresholds: 0-29 lower, 30-49 moderate, 50-69 high, 70-100 very high.
function getDifficultyClassification(score: number) {
  if (score < 30) {
    return "lower competition";
  }

  if (score < 50) {
    return "moderate competition";
  }

  if (score < 70) {
    return "high competition";
  }

  return "very high competition";
}

export default function QueryAnalysis({ summary, queries, opportunityPoints }: QueryAnalysisProps) {
  const tokenVars = {
    "--query-bg": COLORS.bg,
    "--query-card": COLORS.card,
    "--query-muted": COLORS.textMuted,
  } as CSSProperties;
  const concentrationPhrase = getDemandConcentrationPhrase(summary);
  const intentSentence = getIntentSentence(summary);
  const difficultyClassification = getDifficultyClassification(summary.medianKeywordDifficulty);

  return (
    <div className={styles.root} style={tokenVars}>
      <header className={styles.header}>
        <h1 className={styles.title}>Query Analysis</h1>
        <p className={styles.subtitle}>
          We analyzed {formatNumber(summary.total)} validated queries to understand where search demand is strongest and
          how difficult those opportunities may be to rank for.
        </p>
      </header>

      <div className={styles.content}>
        <section className={styles.scatterPlot} aria-label="Search Opportunity Map">
          <SearchOpportunityMap
            points={opportunityPoints}
            medianKeywordDifficulty={summary.medianKeywordDifficulty}
            medianMonthlySearchVolume={summary.medianMonthlySearchVolume}
            totalQueries={summary.total}
          />
        </section>

        <QueryList queries={queries} />
      </div>

      <section className={styles.keySummary}>
        <h2>Key Summary</h2>
        <p>
          Across {formatNumber(summary.total)} validated queries, search demand {concentrationPhrase}. {intentSentence}{" "}
          A median difficulty score of {formatNumber(summary.medianKeywordDifficulty)} indicates{" "}
          {difficultyClassification}.
        </p>
      </section>
    </div>
  );
}
