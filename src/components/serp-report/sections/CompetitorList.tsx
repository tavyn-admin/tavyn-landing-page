"use client";

import { useRef, useState } from "react";

import type { CompetitorLandscapeData } from "@/lib/serp-report/schema";
import styles from "./CompetitorLandscape.module.css";

const columnLabels = ["Domain", "Keywords Ranked", "Query Coverage", "Avg. Position", "Est. Traffic"];

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

type CompetitorRow = CompetitorLandscapeData["competitors"][number];

type CompetitorListProps = {
  competitors: CompetitorRow[];
  leaderDomains: string[];
};

function formatInteger(value: number) {
  return integerFormatter.format(value);
}

function formatCoverage(value: number) {
  return `${oneDecimalFormatter.format(value)}%`;
}

function formatPosition(value: number) {
  return positionFormatter.format(value);
}

function RankingFootprint({ competitor }: { competitor: CompetitorRow }) {
  const { matchedQueries, pageOneQueries, pageTwoQueries, lowerRankingQueries } = competitor.rankingFootprint;
  const queryLabel = matchedQueries === 1 ? "query" : "queries";

  if (matchedQueries === 0) {
    return <p className={styles.unavailableDetail}>Detailed query rankings were not available for this competitor.</p>;
  }

  return (
    <section className={styles.detailsSection}>
      <h4>Ranking Footprint</h4>
      <p className={styles.footprintSummary}>
        {competitor.domain} ranks in positions 1–10 for {formatInteger(pageOneQueries)} of the{" "}
        {formatInteger(matchedQueries)} analyzed {queryLabel} where it appears.
      </p>
      <div className={styles.footprintMetrics}>
        <div className={styles.footprintMetric}>
          <div className={styles.detailLabel}>Positions 1–10</div>
          <div className={styles.detailValue}>{formatInteger(pageOneQueries)}</div>
        </div>
        <div className={styles.footprintMetric}>
          <div className={styles.detailLabel}>Positions 11–20</div>
          <div className={styles.detailValue}>{formatInteger(pageTwoQueries)}</div>
        </div>
        <div className={styles.footprintMetric}>
          <div className={styles.detailLabel}>Positions 21+</div>
          <div className={styles.detailValue}>{formatInteger(lowerRankingQueries)}</div>
        </div>
      </div>
    </section>
  );
}

function StrongestQueryRankings({ competitor }: { competitor: CompetitorRow }) {
  if (competitor.strongestQueryRankings.length === 0) {
    return null;
  }

  return (
    <section className={styles.detailsSection}>
      <h4>Strongest Query Rankings</h4>
      <div className={styles.queryRankingHeader}>
        <span>Query</span>
        <span>Position</span>
      </div>
      <div className={styles.queryRankingList}>
        {competitor.strongestQueryRankings.map((ranking) => (
          <div className={styles.queryRankingRow} key={`${competitor.domain}-${ranking.query}-${ranking.position}`}>
            <span title={ranking.query}>{ranking.query}</span>
            <strong>#{formatInteger(ranking.position)}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function CompetitorDetails({ competitor }: { competitor: CompetitorRow }) {
  const hasDetails = competitor.rankingFootprint.matchedQueries > 0 || competitor.strongestQueryRankings.length > 0;

  return (
    <div className={styles.competitorDetails}>
      <div className={styles.detailsDivider} />
      {hasDetails ? (
        <>
          <RankingFootprint competitor={competitor} />
          <StrongestQueryRankings competitor={competitor} />
        </>
      ) : (
        <p className={styles.unavailableDetail}>Detailed query rankings were not available for this competitor.</p>
      )}
    </div>
  );
}

export default function CompetitorList({ competitors, leaderDomains }: CompetitorListProps) {
  const [openCompetitorId, setOpenCompetitorId] = useState<string | null>(null);
  const competitorRefs = useRef<Record<string, HTMLElement | null>>({});

  function toggleCompetitor(competitorId: string) {
    const isOpen = openCompetitorId === competitorId;
    setOpenCompetitorId(isOpen ? null : competitorId);

    if (!isOpen) {
      window.requestAnimationFrame(() => {
        competitorRefs.current[competitorId]?.scrollIntoView({ block: "nearest" });
      });
    }
  }

  return (
    <div className={styles.competitorList} role="table" aria-label="Competitor visibility across validated queries">
      <div className={styles.tableHeader} role="row">
        {columnLabels.map((label, index) => (
          <div key={label} className={index === 0 ? styles.domainColumn : styles.metricColumn} role="columnheader">
            {label}
          </div>
        ))}
      </div>

      <div
        className={styles.competitorRows}
        role="rowgroup"
        tabIndex={0}
        aria-label={`${competitors.length} competitors`}
        data-competitor-rows
      >
        <span className={styles.rankingIndicator} aria-hidden="true" />
        {competitors.length > 0 ? (
          competitors.map((competitor) => {
            const competitorId = `${competitor.rank}-${competitor.domain}`;
            const isOpen = openCompetitorId === competitorId;
            const detailsId = `competitor-details-${competitor.rank}-${competitor.domain.replace(/[^a-z0-9]+/gi, "-")}`;

            return (
              <article
                className={styles.competitorCard}
                data-open={isOpen ? "true" : undefined}
                data-competitor-card
                data-leader={leaderDomains.includes(competitor.domain) ? "true" : undefined}
                key={`${competitor.rank}-${competitor.domain}`}
                ref={(node) => {
                  competitorRefs.current[competitorId] = node;
                }}
              >
                <button
                  type="button"
                  className={styles.competitorRow}
                  aria-expanded={isOpen}
                  aria-controls={detailsId}
                  onClick={() => toggleCompetitor(competitorId)}
                >
                  <span className={styles.domainCell}>
                    <span className="brand-text-gradient">{competitor.domain}</span>
                    <img
                      className={styles.chevron}
                      src="/serp-report/query-analysis/chevron-down.png"
                      alt=""
                      aria-hidden="true"
                    />
                  </span>
                  <span className={styles.metricCell}>{formatInteger(competitor.keywordsRankedCount)}</span>
                  <span className={styles.metricCell}>{formatCoverage(competitor.queryCoveragePercentage)}</span>
                  <span className={styles.metricCell}>{formatPosition(competitor.averagePosition)}</span>
                  <span className={styles.metricCell}>{formatInteger(Math.round(competitor.estimatedTraffic))}</span>
                </button>
                <div
                  id={detailsId}
                  className={styles.detailsReveal}
                  data-open={isOpen ? "true" : undefined}
                  role="region"
                  aria-label={`${competitor.domain} ranking details`}
                  aria-hidden={!isOpen}
                >
                  <div className={styles.detailsClip}>
                    <CompetitorDetails competitor={competitor} />
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className={styles.emptyMessage}>No competitor domains were available for this report.</div>
        )}
      </div>
    </div>
  );
}
