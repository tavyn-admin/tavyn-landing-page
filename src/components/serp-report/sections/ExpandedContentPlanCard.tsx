import type { ContentPlanRecommendation } from "@/lib/serp-report/schema";
import styles from "./RecommendedContentPlan.module.css";

const numberFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const integerFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const publishLabels = ["Publish first", "Publish second", "Publish third"] as const;

const publishedDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

type ExpandedContentPlanCardProps = {
  id: string;
  labelledBy: string;
  recommendation: ContentPlanRecommendation;
  index: number;
  averageOpportunityScore: number;
  companyName: string;
  panelRole: "tabpanel" | "region";
};

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function formatInteger(value: number) {
  return integerFormatter.format(value);
}

function formatNullableInteger(value: number | null | undefined) {
  return value === null || value === undefined ? "—" : integerFormatter.format(value);
}

function formatSignedPercentage(value: number | null) {
  if (value === null) {
    return "—";
  }

  return `${value > 0 ? "+" : ""}${formatNumber(value)}%`;
}

function formatPaidCompetition(value: number | null) {
  if (value === null) {
    return "—";
  }

  const displayValue = value >= 0 && value <= 1 ? value * 100 : value;
  return `${formatNumber(displayValue)}%`;
}

function formatPublishedDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : publishedDateFormatter.format(date);
}

function formatRecommendationNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function ExpandedContentPlanCard({
  id,
  labelledBy,
  recommendation,
  index,
  averageOpportunityScore,
  companyName,
  panelRole,
}: ExpandedContentPlanCardProps) {
  const title = recommendation.recommendedTitle || recommendation.primaryQuery;
  const benchmark = recommendation.topTenBenchmark;

  return (
    <section
      id={id}
      className={styles.strategyBrief}
      role={panelRole}
      aria-labelledby={labelledBy}
      tabIndex={0}
    >
      <header className={styles.strategyHeader}>
        <div className={styles.strategyStatusRow}>
          <span className={styles.strategySequence}>
            {formatRecommendationNumber(index)} · {publishLabels[index]}
          </span>
          <span className={styles.readyStatus}>Ready to draft</span>
        </div>
        <h2>{title}</h2>
        <p>
          Target query: <strong>{recommendation.primaryQuery}</strong>
        </p>
      </header>

      <dl className={styles.metricStrip}>
        <Metric label="Monthly searches" value={formatInteger(recommendation.monthlySearchVolume)} />
        <Metric label="Keyword Difficulty" value={formatNumber(recommendation.keywordDifficulty)} />
        <Metric label="Opportunity Score" value={formatNumber(recommendation.opportunityScore)} />
        <Metric label="Search intent" value={recommendation.searchIntent} />
      </dl>

      <div className={styles.editorialNarrative}>
        <section>
          <h3>Why Tavyn chose this</h3>
          <p>{recommendation.selectionReasoning}</p>
        </section>
        <section>
          <h3>Recommended content angle</h3>
          <p>{recommendation.contentAngle}</p>
        </section>
        <section>
          <h3>How {companyName} should be positioned</h3>
          <p>{recommendation.productConnection}</p>
        </section>
      </div>

      <details className={styles.evidenceDisclosure}>
        <summary>View search evidence</summary>
        <div className={styles.evidenceContent}>
          <dl className={styles.evidenceGrid}>
            <Metric label="Demand territory" value={recommendation.demandType} />
            <Metric label="Average candidate score" value={formatNumber(averageOpportunityScore)} />
            <Metric label="Paid competition" value={formatPaidCompetition(recommendation.paidCompetition)} />
            <Metric label="1-month momentum" value={formatSignedPercentage(recommendation.searchMomentum.monthly)} />
            <Metric label="3-month momentum" value={formatSignedPercentage(recommendation.searchMomentum.quarterly)} />
            <Metric label="12-month momentum" value={formatSignedPercentage(recommendation.searchMomentum.yearly)} />
          </dl>

          {benchmark ? (
            <section className={styles.benchmarkSection}>
              <h3>Current top-10 authority benchmark</h3>
              <dl className={styles.benchmarkGrid}>
                <Metric label="Average backlinks" value={formatNullableInteger(benchmark.averageBacklinks)} />
                <Metric label="Average referring domains" value={formatNullableInteger(benchmark.averageReferringDomains)} />
                <Metric label="Average domain rank" value={formatNullableInteger(benchmark.averageDomainRank)} />
              </dl>
            </section>
          ) : null}

          <section className={styles.rankingSection}>
            <h3>
              Ranking pages analyzed <span>{recommendation.rankingPages.length}</span>
            </h3>
            {recommendation.rankingPages.length === 0 ? (
              <p className={styles.rankingEmptyState}>No ranking pages were returned for this query.</p>
            ) : (
              <div className={styles.rankingTableWrap} tabIndex={0}>
                <table className={styles.rankingTable}>
                  <thead>
                    <tr>
                      <th scope="col">Position</th>
                      <th scope="col">Page</th>
                      <th scope="col">Domain</th>
                      <th scope="col">Published</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recommendation.rankingPages.map((page, pageIndex) => (
                      <tr key={`${page.position}-${page.domain}-${page.url}-${pageIndex}`}>
                        <td>{formatInteger(page.position)}</td>
                        <td>
                          <a href={page.url} target="_blank" rel="noopener noreferrer">
                            {page.title}
                          </a>
                          {page.snippet ? <p>{page.snippet}</p> : null}
                        </td>
                        <td>{page.domain}</td>
                        <td>{formatPublishedDate(page.publishedDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </details>
    </section>
  );
}
