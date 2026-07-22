import type { CSSProperties } from "react";

import type { ReportOverviewData } from "@/lib/serp-report/schema";
import styles from "./ReportOverview.module.css";

const logoSrc = "/serp-report/overview/logo.svg";
const tagIndicatorSrc = "/serp-report/overview/tag-indicator.svg";

const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const standardNumberFormatter = new Intl.NumberFormat("en-US");
const percentageFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

function clampPercentage(value: number) {
  return Math.min(100, Math.max(0, value));
}

function getOverviewConclusionHeading({
  recommendationsSelected,
  problemRecommendations,
  solutionRecommendations,
}: {
  recommendationsSelected: number;
  problemRecommendations: number;
  solutionRecommendations: number;
}) {
  if (recommendationsSelected === 0) {
    return "The analysis identifies where further validation is needed.";
  }

  if (problemRecommendations > 0 && solutionRecommendations > 0) {
    return "Your customers are already searching. Tavyn found where you can win.";
  }

  if (problemRecommendations > 0) {
    return "The plan prioritizes customer-problem demand.";
  }

  return "The plan prioritizes solution-category demand.";
}

function pluralize(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural;
}

function CardHeader({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className={styles.cardHeader}>
      <div className={styles.cardTitleRow}>
        <span className={styles.cardNumber}>{number}</span>
        <h3>{title}</h3>
      </div>
      <p>{description}</p>
    </div>
  );
}

function MetricPair({ metrics }: { metrics: { label: string; value: string }[] }) {
  return (
    <div className={styles.metricPair}>
      {metrics.map((metric) => (
        <div className={styles.metric} key={metric.label}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
        </div>
      ))}
    </div>
  );
}

function formatCoverageValue(value: number) {
  return `${percentageFormatter.format(value)}%`;
}

export default function ReportOverview({ data }: { data: ReportOverviewData }) {
  const demandSplitStyle = {
    "--overview-problem-width": `${clampPercentage(data.problemDemandPercentage)}%`,
    "--overview-solution-width": `${clampPercentage(data.solutionDemandPercentage)}%`,
  } as CSSProperties;
  const validatedQueryWord = pluralize(data.validatedQueries, "query", "queries");
  const competitorWord = pluralize(data.competitorsProfiled, "competitor", "competitors");
  const recommendationWord = pluralize(data.recommendationsSelected, "recommendation", "recommendations");
  const opportunityWord = pluralize(data.opportunitiesScored, "opportunity", "opportunities");
  const opportunityWasWere = data.opportunitiesScored === 1 ? "was" : "were";
  const recommendationWasWere = data.recommendationsSelected === 1 ? "was" : "were";
  const selectedWasWere = data.recommendationsSelected === 1 ? "was" : "were";
  const scoredOpportunityWord = pluralize(data.opportunitiesScored, "opportunity", "opportunities");
  const broadestCoverageValue = data.broadestCoverage
    ? `${data.broadestCoverage.domain} · ${formatCoverageValue(data.broadestCoverage.percentage)}`
    : "Not available";

  return (
    <div className={styles.root}>
      <nav className={styles.nav} aria-label="Report navigation">
        <a className={styles.brand} href="/" aria-label="Tavyn home">
          <img src={logoSrc} alt="" aria-hidden="true" />
          <span>Tavyn</span>
        </a>
        <a className={styles.waitlistButton} href="/waitlist">
          Join Waitlist
        </a>
      </nav>

      <div className={styles.mainSection}>
        <header className={styles.reportHeader}>
          <h1>Search Landscape Report</h1>
          <dl className={styles.metadata}>
            <div>
              <dt>Company:</dt>
              <dd>
                {data.companyName} · {data.companyDomain}
              </dd>
            </div>
            <div>
              <dt>Search Market:</dt>
              <dd>{data.searchMarket}</dd>
            </div>
            <div>
              <dt>Report Generated:</dt>
              <dd>{data.generatedAt}</dd>
            </div>
          </dl>
        </header>

        <div className={styles.content}>
          <section className={styles.summary} aria-labelledby="report-overview-summary">
            <h2 id="report-overview-summary">Executive Summary</h2>

            <div className={styles.cards}>
              <article className={styles.card}>
                <CardHeader
                  number="01"
                  title="Validated search demand"
                  description={`We validated ${standardNumberFormatter.format(
                    data.validatedQueries
                  )} ${validatedQueryWord} relevant to ${
                    data.companyName
                  } across customer problems and solution-category demand.`}
                />
                <MetricPair
                  metrics={[
                    { label: "Validated Queries", value: standardNumberFormatter.format(data.validatedQueries) },
                    {
                      label: "Combined Monthly Volume",
                      value: compactNumberFormatter.format(data.combinedMonthlyVolume),
                    },
                  ]}
                />
                <div className={styles.demandSplit} style={demandSplitStyle}>
                  <div className={styles.splitLabels}>
                    <span>Problem-Led Demand</span>
                    <span>Solution-Led Demand</span>
                  </div>
                  <div className={styles.splitBar} aria-hidden="true">
                    <span className={styles.problemSegment} />
                    <span className={styles.solutionSegment} />
                  </div>
                  <div className={styles.splitValues}>
                    <strong>{data.problemDemandPercentage}%</strong>
                    <strong>{data.solutionDemandPercentage}%</strong>
                  </div>
                </div>
              </article>

              <article className={styles.card}>
                <CardHeader
                  number="02"
                  title="Competitive landscape"
                  description={`We profiled ${standardNumberFormatter.format(
                    data.competitorsProfiled
                  )} ${competitorWord} competing for visibility across the validated query set.`}
                />
                <div className={styles.competitorSummary}>
                  <MetricPair
                    metrics={[
                      {
                        label: "Competitors Profiled",
                        value: standardNumberFormatter.format(data.competitorsProfiled),
                      },
                      {
                        label: "Page-One Competitors",
                        value: standardNumberFormatter.format(data.pageOneCompetitors),
                      },
                    ]}
                  />
                  <div className={styles.detailRows}>
                    <div className={styles.detailRow}>
                      <span>Visibility Leader</span>
                      <strong>{data.visibilityLeader?.domain ?? "Not available"}</strong>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Broadest Query Coverage</span>
                      <strong>{broadestCoverageValue}</strong>
                    </div>
                  </div>
                </div>
              </article>

              <article className={styles.card}>
                <CardHeader
                  number="03"
                  title="Recommended next moves"
                  description={`${data.opportunitiesScored} ${opportunityWord} ${opportunityWasWere} evaluated in depth, and ${data.recommendationsSelected} ${recommendationWord} ${recommendationWasWere} selected for the content plan.`}
                />
                <div className={styles.actionabilityBody}>
                  <MetricPair
                    metrics={[
                      {
                        label: "Opportunities Scored",
                        value: standardNumberFormatter.format(data.opportunitiesScored),
                      },
                      {
                        label: "Recommendations Selected",
                        value: standardNumberFormatter.format(data.recommendationsSelected),
                      },
                    ]}
                  />
                  <div className={styles.tags} aria-label="Action themes">
                    {data.recommendationPageTypes.map((tag) => (
                      <span className={styles.tag} key={tag}>
                        <img src={tagIndicatorSrc} alt="" aria-hidden="true" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            </div>
          </section>

          <section className={styles.conclusion} aria-labelledby="report-overview-conclusion">
            <h2 id="report-overview-conclusion">
              {getOverviewConclusionHeading({
                recommendationsSelected: data.recommendationsSelected,
                problemRecommendations: data.problemRecommendations,
                solutionRecommendations: data.solutionRecommendations,
              })}
            </h2>
            <p>
              <span>Across </span>
              <strong>{standardNumberFormatter.format(data.validatedQueries)}</strong>
              <span>
                {" "}
                validated {validatedQueryWord}, {data.companyName} found{" "}
              </span>
              <strong>{standardNumberFormatter.format(data.combinedMonthlyVolume)}</strong>
              <span> combined monthly searches, split between </span>
              <strong>{data.problemDemandPercentage}%</strong>
              <span> problem-led and </span>
              <strong>{data.solutionDemandPercentage}%</strong>
              <span> solution-led demand. The analysis profiled </span>
              <strong>{standardNumberFormatter.format(data.competitorsProfiled)}</strong>
              <span> {competitorWord}, with </span>
              <strong>{standardNumberFormatter.format(data.pageOneCompetitors)}</strong>
              <span> achieving a median page-one position. From </span>
              <strong>{standardNumberFormatter.format(data.opportunitiesScored)}</strong>
              <span> scored {scoredOpportunityWord}, </span>
              <strong>{standardNumberFormatter.format(data.recommendationsSelected)}</strong>
              <span>
                {" "}
                {selectedWasWere} selected for content
              </span>
              {data.recommendationsSelected > 0 ? (
                <>
                  <span>: </span>
                  <strong>{standardNumberFormatter.format(data.problemRecommendations)}</strong>
                  <span> problem-led and </span>
                  <strong>{standardNumberFormatter.format(data.solutionRecommendations)}</strong>
                  <span> solution-led.</span>
                </>
              ) : (
                <span>.</span>
              )}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
