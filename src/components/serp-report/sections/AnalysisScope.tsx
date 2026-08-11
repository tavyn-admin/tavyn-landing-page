import type { CSSProperties } from "react";

import pageStyles from "@/components/serp-report/SerpReportPage.module.css";
import type { AnalysisScopeData } from "@/lib/serp-report/schema";
import MetricTooltip from "./MetricTooltip";
import styles from "./AnalysisScope.module.css";

const metricDefinitions = [
  {
    label: "Relevant Queries Validated",
    description: "Search terms confirmed to closely match what your ideal customers are looking for.",
  },
  {
    label: "Ranking Pages Analyzed",
    description: "Top-ranking search result pages reviewed to understand what currently performs well.",
  },
  {
    label: "Competitor Domains Found",
    description: "Websites competing for visibility across the search queries included in this analysis.",
  },
  {
    label: "Median Keyword Difficulty",
    description:
      "The typical ranking difficulty across the validated queries. Higher scores indicate stronger competition.",
  },
  {
    label: "Problem-Led Demand",
    description: "The share of relevant searches focused on a pain point, challenge, or unmet need.",
  },
  {
    label: "Solution-Led Demand",
    description: "The share of relevant searches focused on finding a product, service, or way to solve the problem.",
  },
] as const;

type MetricItemProps = {
  label: string;
  value: string;
  description: string;
  index: number;
};

function MetricItem({ label, value, description, index }: MetricItemProps) {
  const tooltipId = `analysis-scope-metric-${index}`;
  const tooltipAlign = index === 0 ? "start" : index === metricDefinitions.length - 1 ? "end" : "center";

  return (
    <div className={styles.metric}>
      <div className={styles.metricLabel}>
        <span>{label}</span>
        <MetricTooltip id={tooltipId} label={label} description={description} align={tooltipAlign} />
      </div>
      <div className={styles.metricValue}>{value}</div>
    </div>
  );
}

type AnalysisScopeProps = {
  analysisCoverage: AnalysisScopeData;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatPossessiveName(name: string) {
  return `${name}'s`;
}

function getFunnelStyle(coverage: AnalysisScopeData) {
  if (coverage.queriesDiscovered === 0) {
    return {
      "--removed-width": "0%",
      "--validated-width": "0%",
      "--scored-width": "0%",
      "--selected-width": "0%",
      "--validated-boundary": "0%",
      "--scored-boundary": "0%",
      "--selected-boundary": "0%",
    } as CSSProperties;
  }

  const rejectedOrRemoved = coverage.queriesDiscovered - coverage.queriesValidated;
  const validatedButNotScored = coverage.queriesValidated - coverage.contentOpportunitiesScored;
  const scoredButNotSelected = coverage.contentOpportunitiesScored - coverage.contentRecommendationsSelected;
  const selected = coverage.contentRecommendationsSelected;

  return {
    "--removed-width": `${(rejectedOrRemoved / coverage.queriesDiscovered) * 100}%`,
    "--validated-width": `${(validatedButNotScored / coverage.queriesDiscovered) * 100}%`,
    "--scored-width": `${(scoredButNotSelected / coverage.queriesDiscovered) * 100}%`,
    "--selected-width": `${(selected / coverage.queriesDiscovered) * 100}%`,
    "--validated-boundary": `${(rejectedOrRemoved / coverage.queriesDiscovered) * 100}%`,
    "--scored-boundary": `${
      ((coverage.queriesDiscovered - coverage.contentOpportunitiesScored) / coverage.queriesDiscovered) * 100
    }%`,
    "--selected-boundary": `${
      ((coverage.queriesDiscovered - coverage.contentRecommendationsSelected) / coverage.queriesDiscovered) * 100
    }%`,
  } as CSSProperties;
}

export default function AnalysisScope({ analysisCoverage }: AnalysisScopeProps) {
  const funnelStyle = getFunnelStyle(analysisCoverage);
  const possessiveCompanyName = formatPossessiveName(analysisCoverage.companyName);
  const hasDiscoveredQueries = analysisCoverage.queriesDiscovered > 0;
  const problemLedDemand =
    analysisCoverage.queriesValidated > 0
      ? Math.round((analysisCoverage.problemQueriesValidated / analysisCoverage.queriesValidated) * 100)
      : 0;
  const solutionLedDemand =
    analysisCoverage.queriesValidated > 0
      ? Math.round((analysisCoverage.solutionQueriesValidated / analysisCoverage.queriesValidated) * 100)
      : 0;
  const metrics = [
    {
      ...metricDefinitions[0],
      value: formatNumber(analysisCoverage.queriesValidated),
    },
    {
      ...metricDefinitions[1],
      value: formatNumber(analysisCoverage.rankingPagesAnalyzed),
    },
    {
      ...metricDefinitions[2],
      value: formatNumber(analysisCoverage.competitorDomainsFound),
    },
    {
      ...metricDefinitions[3],
      value: formatNumber(analysisCoverage.medianKeywordDifficulty),
    },
    {
      ...metricDefinitions[4],
      value: `${problemLedDemand}%`,
    },
    {
      ...metricDefinitions[5],
      value: `${solutionLedDemand}%`,
    },
  ];

  return (
    <div className={pageStyles.page}>
      <header className={pageStyles.header}>
        <h1 className={pageStyles.title}>{possessiveCompanyName} Analysis Scope</h1>
        <p className={pageStyles.subtitle}>
          We evaluated {formatNumber(analysisCoverage.queriesEvaluated)} search queries across{" "}
          {analysisCoverage.companyName}&rsquo;s problem and solution space to identify the strongest organic search
          opportunities.
        </p>
      </header>

      <div className={pageStyles.primaryContent}>
        <div className={styles.metrics}>
          {metrics.map((metric, index) => (
            <MetricItem
              key={metric.label}
              label={metric.label}
              value={metric.value}
              description={metric.description}
              index={index}
            />
          ))}
        </div>

        <div
          className={styles.visualization}
          aria-label="Analysis scope funnel visualization"
          style={funnelStyle}
        >
          <div className={styles.graph}>
            <div className={styles.discoveredBar} />
            <div className={styles.validatedBar} />
            <div className={styles.scoredBar} />
            <div className={styles.selectedBar} />
          </div>

          {!hasDiscoveredQueries ? <div className={styles.emptyFunnel}>No discovered queries to visualize.</div> : null}

          <div className={`${styles.callout} ${styles.discoveredCallout}`}>
            <div className={styles.calloutLabel}>Queries discovered</div>
            <div className={styles.calloutValue}>{formatNumber(analysisCoverage.queriesDiscovered)}</div>
          </div>
          <div className={`${styles.callout} ${styles.validatedCallout}`}>
            <div className={styles.calloutLabel}>Relevant queries validated</div>
            <div className={styles.calloutValue}>{formatNumber(analysisCoverage.queriesValidated)}</div>
          </div>
          <div className={`${styles.callout} ${styles.scoredCallout}`}>
            <div className={styles.calloutLabel}>Content opportunities scored</div>
            <div className={styles.calloutValue}>{formatNumber(analysisCoverage.contentOpportunitiesScored)}</div>
          </div>
          <div className={`${styles.callout} ${styles.selectedCallout}`}>
            <div className={styles.calloutLabel}>Priority opportunities selected</div>
            <div className={styles.calloutValue}>
              {formatNumber(analysisCoverage.contentRecommendationsSelected)}
            </div>
          </div>

          <div className={`${styles.connector} ${styles.discoveredConnector}`}>
            <img src="/serp-report/analysis-scope/discovered-connector.svg" alt="" />
          </div>
          <div className={`${styles.connector} ${styles.validatedConnector}`}>
            <img src="/serp-report/analysis-scope/validated-connector.svg" alt="" />
          </div>
          <div className={`${styles.connector} ${styles.scoredConnector}`}>
            <img src="/serp-report/analysis-scope/scored-connector.svg" alt="" />
          </div>
          <div className={`${styles.connector} ${styles.selectedConnector}`}>
            <img src="/serp-report/analysis-scope/selected-connector.svg" alt="" />
          </div>
        </div>

        <section className={pageStyles.keySummary}>
          <h2>Tavyn examines {possessiveCompanyName} full search landscape.</h2>
          <p>
            We evaluated {formatNumber(analysisCoverage.queriesEvaluated)} search queries and identified{" "}
            {formatNumber(analysisCoverage.queriesValidated)} that were directly relevant to{" "}
            {analysisCoverage.companyName}&rsquo;s market. Of those,{" "}
            {formatNumber(analysisCoverage.problemQueriesValidated)} focused on customer problems and{" "}
            {formatNumber(analysisCoverage.solutionQueriesValidated)} focused on potential solutions. We then scored the
            top {formatNumber(analysisCoverage.contentOpportunitiesScored)} content opportunities and selected the{" "}
            {formatNumber(analysisCoverage.contentRecommendationsSelected)} strongest for deeper analysis.
          </p>
        </section>
      </div>
    </div>
  );
}
