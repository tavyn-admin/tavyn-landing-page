import type { CompetitorLandscapeData } from "@/lib/serp-report/schema";
import CompetitorList from "./CompetitorList";
import MetricTooltip from "./MetricTooltip";
import styles from "./CompetitorLandscape.module.css";

const summaryMetricDefinitions = [
  {
    label: "Domains Identified",
    description: "All unique domains that appeared in organic results across the analyzed search market.",
  },
  {
    label: "Competitors Profiled",
    description:
      "The highest-visibility domains retained for detailed comparison after excluding the company's own domain.",
  },
  {
    label: "Page-One Competitors",
    description: "Competitors whose median ranking across their matched queries is position 10 or better.",
  },
  {
    label: "Visibility Leader",
    description: "The domain with the strongest overall visibility across the analyzed query set.",
  },
  {
    label: "Broadest Query Coverage",
    description: "The domain appearing in organic results for the largest percentage of analyzed queries.",
  },
] as const;

const integerFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const oneDecimalFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const positionFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

type CompetitorLandscapeProps = {
  data: CompetitorLandscapeData;
};

function formatInteger(value: number) {
  return integerFormatter.format(value);
}

function formatCoverage(value: number) {
  return `${oneDecimalFormatter.format(value)}%`;
}

function formatMaximumCoverage(value: number) {
  return `${positionFormatter.format(value)}%`;
}

function formatPosition(value: number) {
  return positionFormatter.format(value);
}

function formatPossessiveName(name: string) {
  return `${name}'s`;
}

function getKeySummary(data: CompetitorLandscapeData) {
  if (data.competitorsProfiled === 0 || !data.broadestCoverage) {
    return "No competitor data was available to evaluate the competitive structure of this search market.";
  }

  const pageOneShare = (data.pageOneCompetitors / data.competitorsProfiled) * 100;
  const maximumCoverage = data.broadestCoverage.queryCoveragePercentage;
  const competitiveDepth =
    pageOneShare < 10 ? "relatively shallow" : pageOneShare < 30 ? "moderate" : "deep";
  const marketConcentration =
    maximumCoverage < 50
      ? "highly fragmented"
      : maximumCoverage <= 70
        ? "not controlled by a single domain"
        : "concentrated around a leading domain";
  const strategicImplication =
    maximumCoverage < 50
      ? "target focused query clusters where competitor visibility is fragmented"
      : maximumCoverage <= 70
        ? "focus on narrower query groups where even the strongest competitors have coverage gaps"
        : "prioritize underserved queries instead of challenging the market leader across the entire category";

  return `Competition is ${competitiveDepth} but ${marketConcentration}. ${formatInteger(
    data.pageOneCompetitors
  )} of ${formatInteger(
    data.competitorsProfiled
  )} profiled competitors consistently reach page one, while the broadest competitor appears across ${formatMaximumCoverage(
    maximumCoverage
  )} of the analyzed search market. This means ${data.companyName} should ${strategicImplication}.`;
}

export default function CompetitorLandscape({ data }: CompetitorLandscapeProps) {
  const possessiveCompanyName = formatPossessiveName(data.companyName);
  const summaryMetrics = [
    {
      ...summaryMetricDefinitions[0],
      value: formatInteger(data.totalDomainsFound),
    },
    {
      ...summaryMetricDefinitions[1],
      value: formatInteger(data.competitorsProfiled),
    },
    {
      ...summaryMetricDefinitions[2],
      value: formatInteger(data.pageOneCompetitors),
    },
    {
      ...summaryMetricDefinitions[3],
      value: data.visibilityLeader?.domain ?? "None",
    },
    {
      ...summaryMetricDefinitions[4],
      value: data.broadestCoverage
        ? `${data.broadestCoverage.domain} · ${formatCoverage(data.broadestCoverage.queryCoveragePercentage)}`
        : "None",
    },
  ];

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.title}>{possessiveCompanyName} Competitor Landscape</h1>
        <p className={styles.subtitle}>
          We profiled the {formatInteger(data.competitorsProfiled)} domains with the strongest visibility across the
          validated search market for {data.companyName}.
        </p>
      </header>

      <div className={styles.content}>
        <CompetitorList competitors={data.competitors} />

        <div className={styles.summaryMetrics} aria-label="Competitor landscape summary metrics">
          {summaryMetrics.map((metric, index) => (
            <div className={styles.summaryMetric} key={metric.label}>
              <div className={styles.summaryLabel}>
                <span>{metric.label}</span>
                <MetricTooltip
                  id={`competitor-landscape-metric-${index}`}
                  label={metric.label}
                  description={metric.description}
                  align={index === 0 ? "start" : index === summaryMetrics.length - 1 ? "end" : "center"}
                  side="top"
                />
              </div>
              <div className={styles.summaryValue}>{metric.value}</div>
            </div>
          ))}
        </div>
      </div>

      <section className={styles.keySummary}>
        <h2>Tavyn identifies the competitors that dominate {possessiveCompanyName} search landscape today.</h2>
        <p>{getKeySummary(data)}</p>
      </section>
    </div>
  );
}
