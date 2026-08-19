'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type {
    QueryOverviewItem,
    SearchOpportunityPoint,
} from '@/lib/serp-report/schema';
import { useSerpTelemetry } from '@/components/serp-report/SerpTelemetryProvider';
import themeStyles from '../SerpReportTheme.module.css';
import MetricTooltip from './MetricTooltip';
import styles from './QueryAnalysis.module.css';

const queryHeaderDefinitions = {
    demandType: {
        label: 'Demand Type',
        description:
            'Shows whether the query reflects a customer problem or a search for a potential solution.',
    },
    searchIntent: {
        label: 'Search Intent',
        description:
            'Describes what the searcher is trying to accomplish, such as learning about a topic or comparing possible solutions.',
    },
    searchVolume: {
        label: 'Search Volume',
        description:
            'The estimated number of times this query is searched each month in the selected market.',
    },
    difficulty: {
        label: 'Difficulty',
        description:
            'An estimated 0–100 score of how competitive it may be to rank organically for this query. Higher scores indicate stronger competition.',
    },
} as const;

const numberFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
});

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

type QueryListProps = {
    queries: QueryOverviewItem[];
    opportunityPoints: SearchOpportunityPoint[];
};

function formatNumber(value: number) {
    return numberFormatter.format(value);
}

function formatOptionalNumber(value: number | null) {
    return value === null ? '—' : formatNumber(value);
}

function formatUnavailableNumber(value: number | null) {
    return value === null ? 'Not available' : formatNumber(value);
}

function formatCurrency(value: number | null) {
    return value === null ? 'Not available' : currencyFormatter.format(value);
}

function formatDisplayLabel(value: string) {
    return value
        .replace(/_/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map(
            (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(' ');
}

function formatSecondaryIntents(values: string[]) {
    return values.length > 0
        ? values.map(formatDisplayLabel).join(', ')
        : 'None identified';
}

function formatTrend(value: number | null) {
    if (value === null) {
        return {
            text: 'Not available',
            tone: 'muted',
        } as const;
    }

    if (value > 0) {
        return {
            text: `+${formatNumber(value)}%`,
            tone: 'positive',
        } as const;
    }

    if (value < 0) {
        return {
            text: `${formatNumber(value)}%`,
            tone: 'negative',
        } as const;
    }

    return {
        text: '0%',
        tone: 'muted',
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
        trend.tone === 'positive'
            ? styles.positiveTrend
            : trend.tone === 'negative'
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
    const hasCommercialSignals =
        query.cpc !== null || query.paidCompetitionLevel !== null;
    const hasTopTenBenchmark =
        query.averageBacklinks !== null ||
        query.averageReferringDomains !== null;

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
                        <DetailItem
                            label="Secondary intent"
                            value={formatSecondaryIntents(
                                query.secondaryIntents,
                            )}
                        />
                        <DetailItem
                            label="Core topic"
                            value={query.coreKeyword ?? 'Not identified'}
                        />
                    </dl>
                </section>

                <section className={styles.detailGroup}>
                    <h4>Search Momentum</h4>
                    <dl>
                        <TrendItem label="1 month" value={query.monthlyTrend} />
                        <TrendItem
                            label="3 months"
                            value={query.quarterlyTrend}
                        />
                        <TrendItem
                            label="12 months"
                            value={query.yearlyTrend}
                        />
                    </dl>
                </section>

                {hasCommercialSignals ? (
                    <section className={styles.detailGroup}>
                        <h4>Commercial Signals</h4>
                        <dl>
                            <DetailItem
                                label="Estimated CPC"
                                value={formatCurrency(query.cpc)}
                            />
                            <DetailItem
                                label="Paid-ad competition"
                                value={
                                    query.paidCompetitionLevel === null
                                        ? 'Not available'
                                        : formatDisplayLabel(
                                              query.paidCompetitionLevel,
                                          )
                                }
                            />
                        </dl>
                    </section>
                ) : null}

                <section className={styles.detailGroup}>
                    <h4>Current Top-10 Benchmark</h4>
                    {hasTopTenBenchmark ? (
                        <dl>
                            <DetailItem
                                label="Average backlinks"
                                value={formatUnavailableNumber(
                                    query.averageBacklinks,
                                )}
                            />
                            <DetailItem
                                label="Average referring domains"
                                value={formatUnavailableNumber(
                                    query.averageReferringDomains,
                                )}
                            />
                        </dl>
                    ) : (
                        <p className={styles.unavailableDetail}>
                            SERP competition data unavailable
                        </p>
                    )}
                </section>
            </div>
        </div>
    );
}

export default function QueryList({
    queries,
    opportunityPoints,
}: QueryListProps) {
    const { capture } = useSerpTelemetry();
    const [openQueryId, setOpenQueryId] = useState<string | null>(null);
    const [showAll, setShowAll] = useState(false);
    const [isExplorerOpen, setIsExplorerOpen] = useState(false);
    const explorerRef = useRef<HTMLDivElement | null>(null);
    const explorerCloseRef = useRef<HTMLButtonElement | null>(null);
    const explorerTriggerRef = useRef<HTMLButtonElement | null>(null);
    const orderedQueries = useMemo(() => {
        const pointByQueryId = new Map(
            opportunityPoints.map((point) => [point.queryId, point]),
        );
        const statusPriority = {
            selected: 0,
            scored: 1,
            validated: 2,
        } as const;

        return queries
            .map((query, sourceIndex) => ({
                query,
                point: pointByQueryId.get(query.id),
                sourceIndex,
            }))
            .toSorted((a, b) => {
                const priorityDifference =
                    statusPriority[a.point?.status ?? 'validated'] -
                    statusPriority[b.point?.status ?? 'validated'];

                if (priorityDifference !== 0) {
                    return priorityDifference;
                }

                if (
                    a.point?.status === 'selected' &&
                    b.point?.status === 'selected'
                ) {
                    const rankDifference =
                        (a.point.recommendationRank ??
                            Number.POSITIVE_INFINITY) -
                        (b.point.recommendationRank ??
                            Number.POSITIVE_INFINITY);

                    if (rankDifference !== 0) {
                        return rankDifference;
                    }
                }

                if (
                    a.point?.status === 'scored' &&
                    b.point?.status === 'scored'
                ) {
                    const scoreDifference =
                        b.point.opportunityScore - a.point.opportunityScore;

                    if (scoreDifference !== 0) {
                        return scoreDifference;
                    }
                }

                return a.sourceIndex - b.sourceIndex;
            });
    }, [opportunityPoints, queries]);
    const priorityQueries = orderedQueries.filter(
        ({ point }) =>
            point?.status === 'selected' || point?.status === 'scored',
    );
    const visibleQueries = showAll ? orderedQueries : priorityQueries;

    useEffect(() => {
        const mobileQuery = window.matchMedia('(max-width: 1100px)');
        const closeExplorerOutsideMobile = (event: MediaQueryListEvent) => {
            if (event.matches) {
                setShowAll(false);
            } else {
                setIsExplorerOpen(false);
            }
        };

        mobileQuery.addEventListener('change', closeExplorerOutsideMobile);
        return () =>
            mobileQuery.removeEventListener(
                'change',
                closeExplorerOutsideMobile,
            );
    }, []);

    useEffect(() => {
        if (!isExplorerOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        const explorerTrigger = explorerTriggerRef.current;
        document.body.style.overflow = 'hidden';
        explorerCloseRef.current?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsExplorerOpen(false);
                return;
            }

            if (event.key !== 'Tab' || !explorerRef.current) {
                return;
            }

            const focusableElements = Array.from(
                explorerRef.current.querySelectorAll<HTMLElement>(
                    'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
                ),
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements.at(-1);

            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement?.focus();
            } else if (
                !event.shiftKey &&
                document.activeElement === lastElement
            ) {
                event.preventDefault();
                firstElement?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', handleKeyDown);
            explorerTrigger?.focus();
        };
    }, [isExplorerOpen]);

    const renderQueries = (
        queryItems: typeof orderedQueries,
        idPrefix: string,
    ) =>
        queryItems.length > 0 ? (
            queryItems.map(({ query, point }) => {
                const isOpen = openQueryId === query.id;
                const triggerId = `${idPrefix}-query-trigger-${query.id}`;
                const detailsId = `${idPrefix}-query-details-${query.id}`;

                return (
                    <article
                        className={styles.queryCard}
                        data-open={isOpen ? 'true' : undefined}
                        key={query.id}
                        role="listitem"
                    >
                        <button
                            type="button"
                            className={styles.queryRowButton}
                            id={triggerId}
                            aria-expanded={isOpen}
                            aria-controls={detailsId}
                            onClick={() => {
                                setOpenQueryId(isOpen ? null : query.id);
                                if (!isOpen) {
                                    capture('serp_query_opened', {
                                        query_id: query.id,
                                        query_status:
                                            point?.status ?? 'validated',
                                        demand_type: query.demandType,
                                    });
                                }
                            }}
                        >
                            <span className={styles.queryCell}>
                                <span>{query.query}</span>
                                {point?.status === 'selected' ? (
                                    <span
                                        className={`${styles.statusBadge} ${styles.selectedBadge}`}
                                    >
                                        Selected
                                    </span>
                                ) : point?.status === 'scored' ? (
                                    <span
                                        className={`${styles.statusBadge} ${styles.topTwentyBadge}`}
                                    >
                                        Top 20
                                    </span>
                                ) : null}
                                <img
                                    className={styles.chevron}
                                    src="/serp-report/query-analysis/chevron-down.png"
                                    alt=""
                                    aria-hidden="true"
                                />
                            </span>
                            <span className={styles.centerCell}>
                                {query.demandType}
                            </span>
                            <span className={styles.centerCell}>
                                {formatDisplayLabel(query.searchIntent)}
                            </span>
                            <span className={styles.centerCell}>
                                {formatOptionalNumber(query.searchVolume)}
                            </span>
                            <span className={styles.centerCell}>
                                {formatOptionalNumber(query.keywordDifficulty)}
                            </span>
                        </button>
                        <div
                            id={detailsId}
                            className={styles.detailsReveal}
                            data-open={isOpen ? 'true' : undefined}
                            role="region"
                            aria-labelledby={triggerId}
                            aria-hidden={!isOpen}
                        >
                            <div className={styles.detailsClip}>
                                {isOpen ? <QueryDetails query={query} /> : null}
                            </div>
                        </div>
                    </article>
                );
            })
        ) : (
            <div className={styles.emptyQueries}>
                No validated queries are available.
            </div>
        );

    return (
        <section className={styles.queryList} aria-label="Validated query list">
            <div className={styles.queryHeader}>
                <span className={styles.queryColumn}>
                    Query ({formatNumber(visibleQueries.length)} of{' '}
                    {formatNumber(queries.length)} shown)
                </span>
                <span
                    className={`${styles.headerMetric} ${styles.centerColumn}`}
                >
                    <span>{queryHeaderDefinitions.demandType.label}</span>
                    <MetricTooltip
                        id="query-analysis-demand-type-tooltip"
                        label={queryHeaderDefinitions.demandType.label}
                        description={
                            queryHeaderDefinitions.demandType.description
                        }
                        align="center"
                    />
                </span>
                <span
                    className={`${styles.headerMetric} ${styles.centerColumn}`}
                >
                    <span>{queryHeaderDefinitions.searchIntent.label}</span>
                    <MetricTooltip
                        id="query-analysis-search-intent-tooltip"
                        label={queryHeaderDefinitions.searchIntent.label}
                        description={
                            queryHeaderDefinitions.searchIntent.description
                        }
                        align="center"
                    />
                </span>
                <span
                    className={`${styles.headerMetric} ${styles.centerColumn}`}
                >
                    <span>{queryHeaderDefinitions.searchVolume.label}</span>
                    <MetricTooltip
                        id="query-analysis-search-volume-tooltip"
                        label={queryHeaderDefinitions.searchVolume.label}
                        description={
                            queryHeaderDefinitions.searchVolume.description
                        }
                        align="end"
                    />
                </span>
                <span
                    className={`${styles.headerMetric} ${styles.centerColumn}`}
                >
                    <span>{queryHeaderDefinitions.difficulty.label}</span>
                    <MetricTooltip
                        id="query-analysis-difficulty-tooltip"
                        label={queryHeaderDefinitions.difficulty.label}
                        description={
                            queryHeaderDefinitions.difficulty.description
                        }
                        align="end"
                    />
                </span>
            </div>

            <div
                className={styles.queryRows}
                data-expanded={showAll ? 'true' : undefined}
                role="list"
                tabIndex={0}
                aria-label={`${visibleQueries.length} visible queries out of ${queries.length}`}
            >
                {renderQueries(visibleQueries, 'report')}
            </div>

            {queries.length > priorityQueries.length ? (
                <button
                    type="button"
                    className={`${styles.queryListToggle} ${styles.desktopQueryToggle}`}
                    aria-expanded={showAll}
                    onClick={() => {
                        if (!showAll) {
                            capture('serp_query_list_expanded', {
                                surface: 'desktop',
                            });
                        }
                        setShowAll((current) => !current);
                        setOpenQueryId(null);
                    }}
                >
                    {showAll
                        ? 'Show top opportunities'
                        : `View all ${formatNumber(queries.length)} queries`}
                </button>
            ) : null}

            {queries.length > priorityQueries.length ? (
                <button
                    ref={explorerTriggerRef}
                    type="button"
                    className={`${styles.queryListToggle} ${styles.mobileQueryToggle}`}
                    aria-haspopup="dialog"
                    onClick={() => {
                        setOpenQueryId(null);
                        setIsExplorerOpen(true);
                        capture('serp_query_list_expanded', {
                            surface: 'mobile',
                        });
                    }}
                >
                    View all {formatNumber(queries.length)} queries
                </button>
            ) : null}

            {isExplorerOpen &&
                createPortal(
                    <div
                        ref={explorerRef}
                        className={`${themeStyles.theme} ${styles.queryExplorer}`}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="query-explorer-title"
                    >
                        <header className={styles.queryExplorerHeader}>
                            <div>
                                <span className={styles.queryExplorerEyebrow}>
                                    {formatNumber(queries.length)} validated
                                    queries
                                </span>
                                <h2 id="query-explorer-title">
                                    Query analysis
                                </h2>
                            </div>
                            <button
                                ref={explorerCloseRef}
                                type="button"
                                className={styles.queryExplorerClose}
                                aria-label="Close query analysis"
                                onClick={() => setIsExplorerOpen(false)}
                            >
                                <span aria-hidden="true">×</span>
                            </button>
                        </header>
                        <div className={styles.queryExplorerBody}>
                            <p className={styles.queryExplorerInstructions}>
                                Tap a query to inspect its search context,
                                momentum, and competitive benchmarks.
                            </p>
                            <div
                                className={styles.queryExplorerRows}
                                role="list"
                                aria-label={`${queries.length} validated queries`}
                            >
                                {renderQueries(orderedQueries, 'explorer')}
                            </div>
                        </div>
                        <footer className={styles.queryExplorerFooter}>
                            <button
                                type="button"
                                onClick={() => setIsExplorerOpen(false)}
                            >
                                Back to report
                            </button>
                        </footer>
                    </div>,
                    document.body,
                )}
        </section>
    );
}
