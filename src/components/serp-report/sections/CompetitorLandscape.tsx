'use client';

import { useLayoutEffect, useRef } from 'react';

import type { CompetitorLandscapeData } from '@/lib/serp-report/schema';
import CompetitorList from './CompetitorList';
import MetricTooltip from './MetricTooltip';
import styles from './CompetitorLandscape.module.css';

const summaryMetricDefinitions = [
    {
        label: 'Domains Identified',
        description:
            'All unique domains that appeared in organic results across the analyzed search market.',
    },
    {
        label: 'Competitors Profiled',
        description:
            "The highest-visibility domains retained for detailed comparison after excluding the company's own domain.",
    },
    {
        label: 'Page-One Competitors',
        description:
            'Competitors whose median ranking across their matched queries is position 10 or better.',
    },
    {
        label: 'Visibility Leader',
        description:
            'The domain with the strongest overall visibility across the analyzed query set.',
    },
    {
        label: 'Broadest Query Coverage',
        description:
            'The domain appearing in organic results for the largest percentage of analyzed queries.',
    },
] as const;

const integerFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
});

const oneDecimalFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
});

const positionFormatter = new Intl.NumberFormat('en-US', {
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
        return 'No competitor data was available to evaluate the competitive structure of this search market.';
    }

    const pageOneShare =
        (data.pageOneCompetitors / data.competitorsProfiled) * 100;
    const maximumCoverage = data.broadestCoverage.queryCoveragePercentage;
    const competitiveDepth =
        pageOneShare < 10
            ? 'relatively shallow'
            : pageOneShare < 30
              ? 'moderate'
              : 'deep';
    const marketConcentration =
        maximumCoverage < 50
            ? 'highly fragmented'
            : maximumCoverage <= 70
              ? 'not controlled by a single domain'
              : 'concentrated around a leading domain';
    const strategicImplication =
        maximumCoverage < 50
            ? 'target focused query clusters where competitor visibility is fragmented'
            : maximumCoverage <= 70
              ? 'focus on narrower query groups where even the strongest competitors have coverage gaps'
              : 'prioritize underserved queries instead of challenging the market leader across the entire category';

    return `Competition is ${competitiveDepth} but ${marketConcentration}. ${formatInteger(
        data.pageOneCompetitors,
    )} of ${formatInteger(
        data.competitorsProfiled,
    )} profiled competitors consistently reach page one, while the broadest competitor appears across ${formatMaximumCoverage(
        maximumCoverage,
    )} of the analyzed search market. This means ${data.companyName} should ${strategicImplication}.`;
}

export default function CompetitorLandscape({
    data,
}: CompetitorLandscapeProps) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const summaryValueRefs = useRef<Array<HTMLSpanElement | null>>([]);
    const hasActivatedRef = useRef(false);
    const possessiveCompanyName = formatPossessiveName(data.companyName);
    const summaryMetrics = [
        {
            ...summaryMetricDefinitions[0],
            value: formatInteger(data.totalDomainsFound),
            numericValue: data.totalDomainsFound,
        },
        {
            ...summaryMetricDefinitions[1],
            value: formatInteger(data.competitorsProfiled),
            numericValue: data.competitorsProfiled,
        },
        {
            ...summaryMetricDefinitions[2],
            value: formatInteger(data.pageOneCompetitors),
            numericValue: data.pageOneCompetitors,
        },
        {
            ...summaryMetricDefinitions[3],
            value: data.visibilityLeader?.domain ?? 'None',
            numericValue: null,
        },
        {
            ...summaryMetricDefinitions[4],
            value: data.broadestCoverage
                ? `${data.broadestCoverage.domain} · ${formatCoverage(data.broadestCoverage.queryCoveragePercentage)}`
                : 'None',
            numericValue: null,
        },
    ];
    const leaderDomains = [
        data.visibilityLeader?.domain,
        data.broadestCoverage?.domain,
    ].filter((domain): domain is string => Boolean(domain));

    useLayoutEffect(() => {
        const root = rootRef.current;

        if (
            !root ||
            !window.IntersectionObserver ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ) {
            return;
        }

        hasActivatedRef.current = false;
        let activationFrame = 0;
        let counterFrame = 0;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry?.isIntersecting || hasActivatedRef.current) {
                    return;
                }

                hasActivatedRef.current = true;
                observer.disconnect();

                const rowViewport = root.querySelector<HTMLElement>(
                    '[data-competitor-rows]',
                );
                const rowElements = Array.from(
                    root.querySelectorAll<HTMLElement>(
                        '[data-competitor-card]',
                    ),
                );
                const viewportRect = rowViewport?.getBoundingClientRect();
                const visibleRows = viewportRect
                    ? rowElements.filter((row) => {
                          const rowRect = row.getBoundingClientRect();
                          return (
                              rowRect.top < viewportRect.bottom &&
                              rowRect.bottom > viewportRect.top
                          );
                      })
                    : [];

                visibleRows.forEach((row, index) => {
                    row.dataset.entranceRow = 'true';
                    row.style.setProperty(
                        '--competitor-row-index',
                        String(index),
                    );
                    row.style.setProperty(
                        '--competitor-row-delay',
                        `${1000 + index * 135}ms`,
                    );
                });

                if (rowViewport && visibleRows.length > 0) {
                    const viewportTop = rowViewport.getBoundingClientRect().top;
                    const firstRect = visibleRows[0].getBoundingClientRect();
                    const lastRect =
                        visibleRows[
                            visibleRows.length - 1
                        ].getBoundingClientRect();
                    const rankingStart =
                        firstRect.top -
                        viewportTop +
                        rowViewport.scrollTop +
                        firstRect.height / 2 -
                        8;
                    const rankingEnd =
                        lastRect.top -
                        viewportTop +
                        rowViewport.scrollTop +
                        lastRect.height / 2 -
                        8;
                    const rowSequenceDuration =
                        (visibleRows.length - 1) * 135 + 650;
                    const leaderStart = Math.max(
                        2700,
                        1000 + rowSequenceDuration + 350,
                    );
                    const summaryStart = 1000;
                    const conclusionStart = 1000;

                    root.style.setProperty(
                        '--ranking-start',
                        `${rankingStart}px`,
                    );
                    root.style.setProperty(
                        '--ranking-distance',
                        `${Math.max(0, rankingEnd - rankingStart)}px`,
                    );
                    root.style.setProperty(
                        '--row-sequence-duration',
                        `${rowSequenceDuration}ms`,
                    );
                    root.style.setProperty(
                        '--leader-start',
                        `${leaderStart}ms`,
                    );
                    root.style.setProperty(
                        '--summary-start',
                        `${summaryStart}ms`,
                    );
                    root.style.setProperty(
                        '--conclusion-start',
                        `${conclusionStart}ms`,
                    );
                    root.dataset.initialAnimatedRows = String(
                        visibleRows.length,
                    );

                    summaryValueRefs.current.forEach((element) => {
                        if (element) {
                            element.textContent = '0';
                        }
                    });

                    activationFrame = requestAnimationFrame(() => {
                        root.dataset.motion = 'active';
                        const counterTargets = [
                            data.totalDomainsFound,
                            data.competitorsProfiled,
                            data.pageOneCompetitors,
                        ];
                        const counterStart = performance.now();

                        const tick = (now: number) => {
                            let complete = true;

                            counterTargets.forEach((target, index) => {
                                const element = summaryValueRefs.current[index];
                                const delay = summaryStart + index * 100;
                                const progress = Math.min(
                                    1,
                                    Math.max(
                                        0,
                                        (now - counterStart - delay) / 650,
                                    ),
                                );
                                const easedProgress =
                                    1 - Math.pow(1 - progress, 3);

                                if (element) {
                                    element.textContent = formatInteger(
                                        Math.round(target * easedProgress),
                                    );
                                }

                                if (progress < 1) {
                                    complete = false;
                                }
                            });

                            if (!complete) {
                                counterFrame = requestAnimationFrame(tick);
                            }
                        };

                        counterFrame = requestAnimationFrame(tick);
                    });
                } else {
                    root.dataset.motion = 'active';
                }
            },
            { threshold: 0.25 },
        );

        root.dataset.motion = 'pending';
        observer.observe(root);

        return () => {
            observer.disconnect();
            cancelAnimationFrame(activationFrame);
            cancelAnimationFrame(counterFrame);
        };
    }, [
        data.competitorsProfiled,
        data.pageOneCompetitors,
        data.totalDomainsFound,
    ]);

    return (
        <div ref={rootRef} className={styles.root}>
            <header className={styles.header}>
                <h1 className={styles.title}>
                    {possessiveCompanyName} Competitor Landscape
                </h1>
                <p className={styles.subtitle}>
                    We profiled the {formatInteger(data.competitorsProfiled)}{' '}
                    domains with the strongest visibility across the validated
                    search market for {data.companyName}.
                </p>
            </header>

            <div className={styles.content}>
                <CompetitorList
                    competitors={data.competitors}
                    leaderDomains={leaderDomains}
                />

                <div
                    className={styles.summaryMetrics}
                    aria-label="Competitor landscape summary metrics"
                >
                    {summaryMetrics.map((metric, index) => (
                        <div
                            className={styles.summaryMetric}
                            key={metric.label}
                        >
                            <div className={styles.summaryLabel}>
                                <span>{metric.label}</span>
                                <MetricTooltip
                                    id={`competitor-landscape-metric-${index}`}
                                    label={metric.label}
                                    description={metric.description}
                                    align={
                                        index === 0
                                            ? 'start'
                                            : index ===
                                                summaryMetrics.length - 1
                                              ? 'end'
                                              : 'center'
                                    }
                                    side="top"
                                />
                            </div>
                            <div className={styles.summaryValue}>
                                {metric.numericValue === null ? (
                                    metric.value
                                ) : (
                                    <>
                                        <span
                                            ref={(element) => {
                                                summaryValueRefs.current[
                                                    index
                                                ] = element;
                                            }}
                                            aria-hidden="true"
                                        >
                                            {metric.value}
                                        </span>
                                        <span className={styles.srOnly}>
                                            {metric.value}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <section className={styles.keySummary}>
                <h2>
                    Tavyn identifies the competitors that dominate{' '}
                    {possessiveCompanyName} search landscape today.
                </h2>
                <p>{getKeySummary(data)}</p>
            </section>
        </div>
    );
}
