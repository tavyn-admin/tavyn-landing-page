"use client";

import { useState } from "react";
import type { ContentPlanRecommendation } from "@/lib/serp-report/schema";
import styles from "./RecommendedContentPlan.module.css";

const backArrowSrc = "/figma/email-back.svg";
const chevronDownSrc = "/serp-report/query-analysis/chevron-down.png";
const expandedCardDisplayTitle = "Content Brief";

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const integerFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

type ExpandedContentPlanCardProps = {
  id: string;
  recommendation: ContentPlanRecommendation;
  index: number;
  averageOpportunityScore: number;
  onClose: () => void;
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

function formatRecommendationNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}

function clampScore(value: number) {
  return Math.min(100, Math.max(0, value));
}

function formatSignedPercentage(value: number | null) {
  if (value === null) {
    return "—";
  }

  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatNumber(value)}%`;
}

function formatPaidCompetition(value: number | null) {
  if (value === null) {
    return "—";
  }

  const displayValue = value >= 0 && value <= 1 ? value * 100 : value;
  return formatSignedPercentage(displayValue);
}

const publishedDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function formatPublishedDate(value: string | null) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return publishedDateFormatter.format(date);
}

function formatRankingPageCount(count: number) {
  return `${formatInteger(count)} Ranking ${count === 1 ? "Page" : "Pages"} Analyzed`;
}

function MomentumValue({ value }: { value: string }) {
  if (value === "—") {
    return <span className={styles.expandedValue}>{value}</span>;
  }

  const isNegative = value.trim().startsWith("-");

  return <span className={isNegative ? styles.negativeSignal : styles.positiveSignal}>{value}</span>;
}

function SignalValue({
  label,
  value,
  signal = true,
}: {
  label: string;
  value: string;
  signal?: boolean;
}) {
  return (
    <div className={styles.signalValue}>
      <span>{label}</span>
      {signal ? <MomentumValue value={value} /> : <span className={styles.expandedValue}>{value}</span>}
    </div>
  );
}

function DetailBlock({ label, children }: { label: string; children: string }) {
  return (
    <div className={styles.expandedDetailBlock}>
      <div className={styles.expandedLabel}>{label}</div>
      <p>{children}</p>
    </div>
  );
}

function HeaderMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.expandedHeaderMetric}>
      <div className={styles.expandedLabel}>{label}</div>
      <div className={styles.expandedValue}>{value}</div>
    </div>
  );
}

function RankingPageLink({ href, title }: { href: string; title: string }) {
  return (
    <a className={styles.rankingPageLink} href={href} target="_blank" rel="noopener noreferrer" title={title}>
      {title}
    </a>
  );
}

function VisitLink({ href }: { href: string }) {
  return (
    <a className={styles.rankingVisit} href={href} target="_blank" rel="noopener noreferrer">
      <span>Visit</span>
      <img src={backArrowSrc} alt="" aria-hidden="true" />
    </a>
  );
}

export default function ExpandedContentPlanCard({
  id,
  recommendation,
  index,
  averageOpportunityScore,
  onClose,
}: ExpandedContentPlanCardProps) {
  const [expandedRankingPageKey, setExpandedRankingPageKey] = useState<string | null>(null);
  const targetScoreHeight = `${clampScore(recommendation.opportunityScore)}%`;
  const averageScoreHeight = `${clampScore(averageOpportunityScore)}%`;
  const titleId = `${id}-title`;
  const rankingPageCount = recommendation.rankingPages.length;
  const benchmark = recommendation.topTenBenchmark;

  return (
    <section id={id} className={styles.expandedCard} aria-labelledby={titleId}>
      <button type="button" className={styles.expandedBackButton} aria-label="Close expanded content brief" onClick={onClose}>
        <img src={backArrowSrc} alt="" aria-hidden="true" />
      </button>

      <header className={styles.expandedHeader}>
        <h2 id={titleId} title={expandedCardDisplayTitle}>
          {expandedCardDisplayTitle}
        </h2>

        <div className={styles.expandedHeaderData}>
          <HeaderMetric label="Monthly Search Volume" value={formatInteger(recommendation.monthlySearchVolume)} />
          <div className={styles.expandedMomentumGroup}>
            <div className={styles.expandedLabel}>Search Momentum</div>
            <div className={styles.expandedMomentumValues}>
              <SignalValue label="1 month:" value={formatSignedPercentage(recommendation.searchMomentum.monthly)} />
              <SignalValue label="3 month:" value={formatSignedPercentage(recommendation.searchMomentum.quarterly)} />
              <SignalValue label="12 month:" value={formatSignedPercentage(recommendation.searchMomentum.yearly)} />
            </div>
          </div>
        </div>

        <div className={styles.expandedNumber}>{formatRecommendationNumber(index)}</div>
      </header>

      <div className={styles.expandedBody}>
        <div className={styles.expandedNarrative}>
          <DetailBlock label="Content Angle">{recommendation.contentAngle}</DetailBlock>
          <DetailBlock label="Selection Reasoning">{recommendation.selectionReasoning}</DetailBlock>
          <DetailBlock label="Product Connection">{recommendation.productConnection}</DetailBlock>

          <div className={styles.expandedBenchmark}>
            <div className={styles.expandedLabel}>Current Top-10 Benchmark</div>
            <div className={styles.benchmarkMetrics}>
              <span>
                Average Backlinks: <strong>{formatNullableInteger(benchmark?.averageBacklinks)}</strong>
              </span>
              <span>
                Average Referring Domains: <strong>{formatNullableInteger(benchmark?.averageReferringDomains)}</strong>
              </span>
              <span>
                Average Domain Rank: <strong>{formatNullableInteger(benchmark?.averageDomainRank)}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className={styles.expandedAnalysis}>
          <div className={styles.expandedMetricsRow}>
            <HeaderMetric label="Keyword Difficulty" value={formatNumber(recommendation.keywordDifficulty)} />
            <HeaderMetric label="Demand Type" value={recommendation.demandType} />
            <HeaderMetric label="Search Intent" value={recommendation.searchIntent} />
            <div className={styles.expandedSearchSignalsGroup}>
              <div className={styles.expandedLabel}>Additional Search Signals</div>
              <div className={styles.expandedSearchSignalValues}>
                <SignalValue label="Paid Competition:" value={formatPaidCompetition(recommendation.paidCompetition)} />
              </div>
            </div>
          </div>

          <div className={styles.expandedLower}>
            <div className={styles.expandedGraphFrame}>
              <div className={styles.expandedGraphHeader}>
                <div className={styles.expandedLabel}>Opportunity Score</div>
                <div className={styles.expandedGraphValue}>{formatNumber(recommendation.opportunityScore)}</div>
              </div>
              <div className={styles.expandedGraph} aria-label={`Opportunity score ${formatNumber(recommendation.opportunityScore)} compared to average ${formatNumber(averageOpportunityScore)}.`} role="group">
                <div className={styles.expandedGraphBarSlot}>
                  <div className={styles.expandedTargetBar} style={{ height: targetScoreHeight }} />
                </div>
                <div className={styles.expandedGraphBarSlot}>
                  <div className={styles.expandedAverageBar} style={{ height: averageScoreHeight }} />
                  <span>Avg {formatNumber(averageOpportunityScore)}</span>
                </div>
              </div>
            </div>

            <div className={styles.rankingPages}>
              <div className={styles.rankingTitle}>{formatRankingPageCount(rankingPageCount)}</div>
              <div className={styles.rankingHeader}>
                <span>Title</span>
                <span>Position</span>
                <span>Domain</span>
              </div>
              <div className={styles.rankingRows}>
                {recommendation.rankingPages.length === 0 ? (
                  <div className={styles.rankingEmptyState}>No ranking pages were returned for this query.</div>
                ) : (
                  recommendation.rankingPages.map((page, pageIndex) => {
                    const rowKey = `${page.position}-${page.domain}-${page.url}-${pageIndex}`;
                    const panelId = `${id}-ranking-page-${index}-${pageIndex}`;
                    const isExpanded = expandedRankingPageKey === rowKey;
                    const toggleExpanded = () => {
                      setExpandedRankingPageKey(isExpanded ? null : rowKey);
                    };

                    return isExpanded ? (
                      <article className={styles.rankingExpandedPanel} key={rowKey} id={panelId}>
                        <div className={styles.rankingExpandedTop}>
                          <RankingPageLink href={page.url} title={page.title} />
                          <button
                            type="button"
                            className={`${styles.rankingChevronButton} ${styles.rankingChevronButtonOpen}`}
                            aria-expanded="true"
                            aria-controls={panelId}
                            aria-label={`Hide ranking details for ${page.title}`}
                            onClick={toggleExpanded}
                          >
                            <img src={chevronDownSrc} alt="" aria-hidden="true" />
                          </button>
                        </div>
                        <div className={styles.rankingExpandedMeta}>
                          <div className={styles.rankingExpandedMetaItem}>
                            <span>Position</span>
                            <strong>{formatInteger(page.position)}</strong>
                          </div>
                          <div className={styles.rankingExpandedMetaItem}>
                            <span>Domain</span>
                            <strong>{page.domain}</strong>
                          </div>
                          <div className={styles.rankingExpandedMetaItem}>
                            <span>Publish Date</span>
                            <strong>{formatPublishedDate(page.publishedDate)}</strong>
                          </div>
                        </div>
                        <VisitLink href={page.url} />
                      </article>
                    ) : (
                      <div className={styles.rankingRow} key={rowKey}>
                        <span className={styles.rankingPageTitle}>
                          <RankingPageLink href={page.url} title={page.title} />
                          <button
                            type="button"
                            className={styles.rankingChevronButton}
                            aria-expanded="false"
                            aria-controls={panelId}
                            aria-label={`Show ranking details for ${page.title}`}
                            onClick={toggleExpanded}
                          >
                            <img src={chevronDownSrc} alt="" aria-hidden="true" />
                          </button>
                        </span>
                        <span className={styles.rankingPosition}>{formatInteger(page.position)}</span>
                        <VisitLink href={page.url} />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
