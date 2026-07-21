import type { CSSProperties } from "react";

import { COLORS } from "@/components/tokens";
import type { QueryAnalysisSummaryData } from "@/lib/serp-report/schema";
import styles from "./QueryAnalysis.module.css";

const placeholderQueries = [
  {
    query: "SEO automation platform",
    demandType: "Solution",
    monthlyVolume: "390",
    trend: "-19%",
    difficulty: "13",
    hasChevron: true,
  },
  {
    query: "SEO content brief",
    demandType: "Problem",
    monthlyVolume: "140",
    trend: "+29%",
    difficulty: "2",
    hasChevron: true,
  },
  {
    query: "SEO content plan",
    demandType: "Problem",
    monthlyVolume: "90",
    trend: "-60%",
    difficulty: "0",
    hasChevron: false,
  },
  {
    query: "SEO automation platform",
    demandType: "Solution",
    monthlyVolume: "390",
    trend: "-19%",
    difficulty: "13",
    hasChevron: false,
  },
  {
    query: "SEO automation platform",
    demandType: "Solution",
    monthlyVolume: "390",
    trend: "-19%",
    difficulty: "13",
    hasChevron: false,
  },
  {
    query: "SEO automation platform",
    demandType: "Solution",
    monthlyVolume: "390",
    trend: "-19%",
    difficulty: "13",
    hasChevron: false,
  },
] as const;

const axisDetails = [
  { label: "X-Axis:", value: "Keyword Difficulty" },
  { label: "Y-Axis:", value: "Monthly Search Volume" },
  { label: "Type:", value: "Scatter Plot" },
] as const;

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

type QueryAnalysisProps = {
  summary: QueryAnalysisSummaryData;
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

export default function QueryAnalysis({ summary }: QueryAnalysisProps) {
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
        <section className={styles.scatterPlot} aria-label="Static query analysis scatter plot">
          <div className={styles.backgroundGrid} aria-hidden="true">
            <img className={styles.xAxisLines} src="/serp-report/query-analysis/x-axis-lines.svg" alt="" />
            <div className={styles.yAxisLinesWrap}>
              <img className={styles.yAxisLines} src="/serp-report/query-analysis/y-axis-lines.svg" alt="" />
            </div>
          </div>

          <dl className={styles.axisInfo}>
            {axisDetails.map((detail) => (
              <div className={styles.axisInfoItem} key={detail.label}>
                <dt>{detail.label}</dt>
                <dd>{detail.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={styles.queryList} aria-label="Static validated query list">
          <div className={styles.queryHeader} aria-hidden="true">
            <span className={styles.queryColumn}>Query (110 found)</span>
            <span className={styles.demandColumn}>Demand Type</span>
            <span className={styles.volumeColumn}>Monthly Volume</span>
            <span className={styles.trendColumn}>Trend</span>
            <span className={styles.difficultyColumn}>Difficulty</span>
          </div>

          <div className={styles.queryRows}>
            {placeholderQueries.map((query, index) => (
              <article className={styles.queryRow} key={`${query.query}-${index}`}>
                <div className={`${styles.queryCell} ${styles.queryColumn}`}>
                  <span>{query.query}</span>
                  {query.hasChevron ? (
                    <img
                      className={styles.chevron}
                      src="/serp-report/query-analysis/chevron-down.png"
                      alt=""
                      aria-hidden="true"
                    />
                  ) : null}
                </div>
                <div className={`${styles.centerCell} ${styles.demandColumn}`}>{query.demandType}</div>
                <div className={`${styles.centerCell} ${styles.volumeColumn}`}>{query.monthlyVolume}</div>
                <div className={`${styles.centerCell} ${styles.trendColumn}`}>{query.trend}</div>
                <div className={`${styles.centerCell} ${styles.difficultyColumn}`}>{query.difficulty}</div>
              </article>
            ))}
          </div>
        </section>
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
