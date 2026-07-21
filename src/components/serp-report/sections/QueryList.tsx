"use client";

import { useState } from "react";

import type { QueryOverviewItem } from "@/lib/serp-report/schema";
import MetricTooltip from "./MetricTooltip";
import styles from "./QueryAnalysis.module.css";

const queryHeaderDefinitions = {
  demandType: {
    label: "Demand Type",
    description: "Shows whether the query reflects a customer problem or a search for a potential solution.",
  },
  searchIntent: {
    label: "Search Intent",
    description:
      "Describes what the searcher is trying to accomplish, such as learning about a topic or comparing possible solutions.",
  },
  searchVolume: {
    label: "Search Volume",
    description: "The estimated number of times this query is searched each month in the selected market.",
  },
  difficulty: {
    label: "Difficulty",
    description:
      "An estimated 0–100 score of how competitive it may be to rank organically for this query. Higher scores indicate stronger competition.",
  },
} as const;

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

type QueryListProps = {
  queries: QueryOverviewItem[];
};

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function formatOptionalNumber(value: number | null) {
  return value === null ? "—" : formatNumber(value);
}

function formatUnavailableNumber(value: number | null) {
  return value === null ? "Not available" : formatNumber(value);
}

function formatCurrency(value: number | null) {
  return value === null ? "Not available" : currencyFormatter.format(value);
}

function formatDisplayLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function formatSecondaryIntents(values: string[]) {
  return values.length > 0 ? values.map(formatDisplayLabel).join(", ") : "None identified";
}

function formatTrend(value: number | null) {
  if (value === null) {
    return {
      text: "Not available",
      tone: "muted",
    } as const;
  }

  if (value > 0) {
    return {
      text: `↑ +${formatNumber(value)}%`,
      tone: "positive",
    } as const;
  }

  if (value < 0) {
    return {
      text: `↓ ${formatNumber(value)}%`,
      tone: "negative",
    } as const;
  }

  return {
    text: "— 0%",
    tone: "muted",
  } as const;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.detailItem}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function TrendItem({ label, value }: { label: string; value: number | null }) {
  const trend = formatTrend(value);
  const toneClass =
    trend.tone === "positive"
      ? styles.positiveTrend
      : trend.tone === "negative"
        ? styles.negativeTrend
        : styles.mutedTrend;

  return (
    <div className={styles.detailItem}>
      <dt>{label}</dt>
      <dd className={toneClass}>{trend.text}</dd>
    </div>
  );
}

function QueryDetails({ query }: { query: QueryOverviewItem }) {
  const hasCommercialSignals = query.cpc !== null || query.paidCompetitionLevel !== null;
  const hasTopTenBenchmark = query.averageBacklinks !== null || query.averageReferringDomains !== null;

  return (
    <div className={styles.queryDetails}>
      <div className={styles.detailsDivider} />
      <section className={styles.reasonSection}>
        <h4>Why this query matters</h4>
        <p>{query.validationReasoning}</p>
      </section>
      <div className={styles.detailsGrid}>
        <section className={styles.detailGroup}>
          <h4>Search Context</h4>
          <dl>
            <DetailItem label="Secondary intent" value={formatSecondaryIntents(query.secondaryIntents)} />
            <DetailItem label="Core topic" value={query.coreKeyword ?? "Not identified"} />
          </dl>
        </section>

        <section className={styles.detailGroup}>
          <h4>Search Momentum</h4>
          <dl>
            <TrendItem label="1 month" value={query.monthlyTrend} />
            <TrendItem label="3 months" value={query.quarterlyTrend} />
            <TrendItem label="12 months" value={query.yearlyTrend} />
          </dl>
        </section>

        {hasCommercialSignals ? (
          <section className={styles.detailGroup}>
            <h4>Commercial Signals</h4>
            <dl>
              <DetailItem label="Estimated CPC" value={formatCurrency(query.cpc)} />
              <DetailItem
                label="Paid-ad competition"
                value={query.paidCompetitionLevel === null ? "Not available" : formatDisplayLabel(query.paidCompetitionLevel)}
              />
            </dl>
          </section>
        ) : null}

        <section className={styles.detailGroup}>
          <h4>Current Top-10 Benchmark</h4>
          {hasTopTenBenchmark ? (
            <dl>
              <DetailItem label="Average backlinks" value={formatUnavailableNumber(query.averageBacklinks)} />
              <DetailItem
                label="Average referring domains"
                value={formatUnavailableNumber(query.averageReferringDomains)}
              />
            </dl>
          ) : (
            <p className={styles.unavailableDetail}>SERP competition data unavailable</p>
          )}
        </section>
      </div>
    </div>
  );
}

export default function QueryList({ queries }: QueryListProps) {
  const [openQueryId, setOpenQueryId] = useState<string | null>(null);

  return (
    <section className={styles.queryList} aria-label="Validated query list">
      <div className={styles.queryHeader}>
        <span className={styles.queryColumn}>Query ({formatNumber(queries.length)} found)</span>
        <span className={`${styles.headerMetric} ${styles.centerColumn}`}>
          <span>{queryHeaderDefinitions.demandType.label}</span>
          <MetricTooltip
            id="query-analysis-demand-type-tooltip"
            label={queryHeaderDefinitions.demandType.label}
            description={queryHeaderDefinitions.demandType.description}
            align="center"
          />
        </span>
        <span className={`${styles.headerMetric} ${styles.centerColumn}`}>
          <span>{queryHeaderDefinitions.searchIntent.label}</span>
          <MetricTooltip
            id="query-analysis-search-intent-tooltip"
            label={queryHeaderDefinitions.searchIntent.label}
            description={queryHeaderDefinitions.searchIntent.description}
            align="center"
          />
        </span>
        <span className={`${styles.headerMetric} ${styles.centerColumn}`}>
          <span>{queryHeaderDefinitions.searchVolume.label}</span>
          <MetricTooltip
            id="query-analysis-search-volume-tooltip"
            label={queryHeaderDefinitions.searchVolume.label}
            description={queryHeaderDefinitions.searchVolume.description}
            align="end"
          />
        </span>
        <span className={`${styles.headerMetric} ${styles.centerColumn}`}>
          <span>{queryHeaderDefinitions.difficulty.label}</span>
          <MetricTooltip
            id="query-analysis-difficulty-tooltip"
            label={queryHeaderDefinitions.difficulty.label}
            description={queryHeaderDefinitions.difficulty.description}
            align="end"
          />
        </span>
      </div>

      <div className={styles.queryRows} role="list" tabIndex={0} aria-label={`${queries.length} validated queries`}>
        {queries.length > 0 ? (
          queries.map((query) => {
            const isOpen = openQueryId === query.id;

            return (
              <article className={styles.queryCard} data-open={isOpen ? "true" : undefined} key={query.id} role="listitem">
                <button
                  type="button"
                  className={styles.queryRowButton}
                  id={`query-trigger-${query.id}`}
                  aria-expanded={isOpen}
                  aria-controls={`query-details-${query.id}`}
                  onClick={() => setOpenQueryId(isOpen ? null : query.id)}
                >
                  <span className={styles.queryCell}>
                    <span>{query.query}</span>
                    <img
                      className={styles.chevron}
                      src="/serp-report/query-analysis/chevron-down.png"
                      alt=""
                      aria-hidden="true"
                    />
                  </span>
                  <span className={styles.centerCell}>{query.demandType}</span>
                  <span className={styles.centerCell}>{formatDisplayLabel(query.searchIntent)}</span>
                  <span className={styles.centerCell}>{formatOptionalNumber(query.searchVolume)}</span>
                  <span className={styles.centerCell}>{formatOptionalNumber(query.keywordDifficulty)}</span>
                </button>
                <div
                  id={`query-details-${query.id}`}
                  className={styles.detailsReveal}
                  data-open={isOpen ? "true" : undefined}
                  role="region"
                  aria-labelledby={`query-trigger-${query.id}`}
                  aria-hidden={!isOpen}
                >
                  <div className={styles.detailsClip}>
                    <QueryDetails query={query} />
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className={styles.emptyQueries}>No validated queries are available.</div>
        )}
      </div>
    </section>
  );
}
