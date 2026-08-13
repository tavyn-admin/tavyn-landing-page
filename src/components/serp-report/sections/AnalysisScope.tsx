'use client';

import { useLayoutEffect, useRef, type CSSProperties } from 'react';

import pageStyles from '@/components/serp-report/SerpReportPage.module.css';
import type { AnalysisScopeData } from '@/lib/serp-report/schema';
import MetricTooltip from './MetricTooltip';
import styles from './AnalysisScope.module.css';

const metricDefinitions = [
    {
        label: 'Relevant Queries Validated',
        description:
            'Search terms confirmed to closely match what your ideal customers are looking for.',
    },
    {
        label: 'Ranking Pages Analyzed',
        description:
            'Top-ranking search result pages reviewed to understand what currently performs well.',
    },
    {
        label: 'Competitor Domains Found',
        description:
            'Websites competing for visibility across the search queries included in this analysis.',
    },
    {
        label: 'Median Keyword Difficulty',
        description:
            'The typical ranking difficulty across the validated queries. Higher scores indicate stronger competition.',
    },
    {
        label: 'Problem-Led Demand',
        description:
            'The share of relevant searches focused on a pain point, challenge, or unmet need.',
    },
    {
        label: 'Solution-Led Demand',
        description:
            'The share of relevant searches focused on finding a product, service, or way to solve the problem.',
    },
] as const;

type MetricItemProps = {
    label: string;
    value: string;
    description: string;
    index: number;
    valueRef: (element: HTMLSpanElement | null) => void;
};

function MetricItem({
    label,
    value,
    description,
    index,
    valueRef,
}: MetricItemProps) {
    const tooltipId = `analysis-scope-metric-${index}`;
    const tooltipAlign =
        index === 0
            ? 'start'
            : index === metricDefinitions.length - 1
              ? 'end'
              : 'center';

    return (
        <div className={styles.metric}>
            <div className={styles.metricLabel}>
                <span>{label}</span>
                <MetricTooltip
                    id={tooltipId}
                    label={label}
                    description={description}
                    align={tooltipAlign}
                />
            </div>
            <div className={styles.metricValue}>
                <span ref={valueRef} aria-hidden="true">
                    {value}
                </span>
                <span className={styles.srOnly}>{value}</span>
            </div>
        </div>
    );
}

type AnalysisScopeProps = {
    analysisCoverage: AnalysisScopeData;
};

function formatNumber(value: number) {
    return new Intl.NumberFormat('en-US').format(value);
}

function formatPossessiveName(name: string) {
    return `${name}'s`;
}

function getFunnelStyle(coverage: AnalysisScopeData) {
    if (coverage.queriesDiscovered === 0) {
        return {
            '--removed-width': '0%',
            '--validated-width': '0%',
            '--scored-width': '0%',
            '--selected-width': '0%',
            '--validated-boundary': '0%',
            '--scored-boundary': '0%',
            '--selected-boundary': '0%',
        } as CSSProperties;
    }

    const rejectedOrRemoved =
        coverage.queriesDiscovered - coverage.queriesValidated;
    const validatedButNotScored =
        coverage.queriesValidated - coverage.contentOpportunitiesScored;
    const scoredButNotSelected =
        coverage.contentOpportunitiesScored -
        coverage.contentRecommendationsSelected;
    const selected = coverage.contentRecommendationsSelected;

    return {
        '--removed-width': `${(rejectedOrRemoved / coverage.queriesDiscovered) * 100}%`,
        '--validated-width': `${(validatedButNotScored / coverage.queriesDiscovered) * 100}%`,
        '--scored-width': `${(scoredButNotSelected / coverage.queriesDiscovered) * 100}%`,
        '--selected-width': `${(selected / coverage.queriesDiscovered) * 100}%`,
        '--validated-boundary': `${(rejectedOrRemoved / coverage.queriesDiscovered) * 100}%`,
        '--scored-boundary': `${
            ((coverage.queriesDiscovered -
                coverage.contentOpportunitiesScored) /
                coverage.queriesDiscovered) *
            100
        }%`,
        '--selected-boundary': `${
            ((coverage.queriesDiscovered -
                coverage.contentRecommendationsSelected) /
                coverage.queriesDiscovered) *
            100
        }%`,
    } as CSSProperties;
}

export default function AnalysisScope({
    analysisCoverage,
}: AnalysisScopeProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const metricValueRefs = useRef<Array<HTMLSpanElement | null>>([]);
    const milestoneValueRefs = useRef<Array<HTMLSpanElement | null>>([]);
    const funnelStyle = getFunnelStyle(analysisCoverage);
    const possessiveCompanyName = formatPossessiveName(
        analysisCoverage.companyName,
    );
    const hasDiscoveredQueries = analysisCoverage.queriesDiscovered > 0;
    const problemLedDemand =
        analysisCoverage.queriesValidated > 0
            ? Math.round(
                  (analysisCoverage.problemQueriesValidated /
                      analysisCoverage.queriesValidated) *
                      100,
              )
            : 0;
    const solutionLedDemand =
        analysisCoverage.queriesValidated > 0
            ? Math.round(
                  (analysisCoverage.solutionQueriesValidated /
                      analysisCoverage.queriesValidated) *
                      100,
              )
            : 0;
    const metrics = [
        {
            ...metricDefinitions[0],
            target: analysisCoverage.queriesValidated,
            suffix: '',
            value: formatNumber(analysisCoverage.queriesValidated),
        },
        {
            ...metricDefinitions[1],
            target: analysisCoverage.rankingPagesAnalyzed,
            suffix: '',
            value: formatNumber(analysisCoverage.rankingPagesAnalyzed),
        },
        {
            ...metricDefinitions[2],
            target: analysisCoverage.competitorDomainsFound,
            suffix: '',
            value: formatNumber(analysisCoverage.competitorDomainsFound),
        },
        {
            ...metricDefinitions[3],
            target: analysisCoverage.medianKeywordDifficulty,
            suffix: '',
            value: formatNumber(analysisCoverage.medianKeywordDifficulty),
        },
        {
            ...metricDefinitions[4],
            target: problemLedDemand,
            suffix: '%',
            value: `${problemLedDemand}%`,
        },
        {
            ...metricDefinitions[5],
            target: solutionLedDemand,
            suffix: '%',
            value: `${solutionLedDemand}%`,
        },
    ];
    const milestoneValues = [
        analysisCoverage.queriesDiscovered,
        analysisCoverage.contentOpportunitiesScored,
        analysisCoverage.contentRecommendationsSelected,
    ];

    useLayoutEffect(() => {
        const root = rootRef.current;

        if (
            !root ||
            !window.IntersectionObserver ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ) {
            return;
        }

        root.dataset.motion = 'pending';
        let animationFrame = 0;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry?.isIntersecting) return;

                root.dataset.motion = 'active';
                observer.disconnect();

                const counters = [
                    ...metrics.map((metric, index) => ({
                        element: metricValueRefs.current[index],
                        target: metric.target,
                        suffix: metric.suffix,
                        delay: 500 + index * 80,
                        duration: 1500,
                    })),
                    ...milestoneValues.map((target, index) => ({
                        element: milestoneValueRefs.current[index],
                        target,
                        suffix: '',
                        delay: [550, 1750, 3350][index],
                        duration: [700, 800, 400][index],
                    })),
                ];
                const startedAt = performance.now();

                const tick = (timestamp: number) => {
                    let complete = true;

                    counters.forEach(
                        ({ element, target, suffix, delay, duration }) => {
                            if (!element) return;

                            const progress = Math.min(
                                1,
                                Math.max(
                                    0,
                                    (timestamp - startedAt - delay) / duration,
                                ),
                            );
                            const easedProgress = 1 - Math.pow(1 - progress, 3);
                            const displayedValue =
                                progress === 1
                                    ? target
                                    : Math.round(target * easedProgress);
                            element.textContent = `${formatNumber(displayedValue)}${suffix}`;
                            if (progress < 1) complete = false;
                        },
                    );

                    if (!complete) animationFrame = requestAnimationFrame(tick);
                };

                animationFrame = requestAnimationFrame(tick);
            },
            { threshold: 0.25 },
        );

        observer.observe(root);
        return () => {
            observer.disconnect();
            cancelAnimationFrame(animationFrame);
        };
    }, [
        analysisCoverage.competitorDomainsFound,
        analysisCoverage.contentOpportunitiesScored,
        analysisCoverage.contentRecommendationsSelected,
        analysisCoverage.medianKeywordDifficulty,
        analysisCoverage.queriesDiscovered,
        analysisCoverage.queriesValidated,
        analysisCoverage.rankingPagesAnalyzed,
        problemLedDemand,
        solutionLedDemand,
    ]);

    return (
        <div ref={rootRef} className={`${pageStyles.page} ${styles.root}`}>
            <header className={pageStyles.header}>
                <h1 className={`${pageStyles.title} ${styles.sectionTitle}`}>
                    {possessiveCompanyName} Analysis Scope
                </h1>
                <p
                    className={`${pageStyles.subtitle} ${styles.sectionDescription}`}
                >
                    We evaluated{' '}
                    {formatNumber(analysisCoverage.queriesEvaluated)} search
                    queries across {analysisCoverage.companyName}&rsquo;s
                    problem and solution space to identify the strongest organic
                    search opportunities.
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
                            valueRef={(element) => {
                                metricValueRefs.current[index] = element;
                            }}
                        />
                    ))}
                </div>

                <div
                    className={styles.visualization}
                    aria-label="Analysis scope funnel visualization"
                    style={funnelStyle}
                >
                    {hasDiscoveredQueries ? (
                        <div className={styles.graph}>
                            <div className={styles.discoveredBar} />
                            <div className={styles.validatedBar} />
                            <div className={styles.scoredBar} />
                            <div className={styles.selectedBar} />
                        </div>
                    ) : (
                        <div className={styles.emptyFunnel}>
                            No discovered queries to visualize.
                        </div>
                    )}

                    <div
                        className={`${styles.callout} ${styles.discoveredCallout}`}
                    >
                        <div className={styles.calloutLabel}>
                            Queries discovered
                        </div>
                        <div className={styles.calloutValue}>
                            <span
                                ref={(element) => {
                                    milestoneValueRefs.current[0] = element;
                                }}
                                aria-hidden="true"
                            >
                                {formatNumber(
                                    analysisCoverage.queriesDiscovered,
                                )}
                            </span>
                            <span className={styles.srOnly}>
                                {formatNumber(
                                    analysisCoverage.queriesDiscovered,
                                )}
                            </span>
                        </div>
                    </div>
                    <div
                        className={`${styles.callout} ${styles.scoredCallout}`}
                    >
                        <div className={styles.calloutLabel}>
                            Content opportunities scored
                        </div>
                        <div className={styles.calloutValue}>
                            <span
                                ref={(element) => {
                                    milestoneValueRefs.current[1] = element;
                                }}
                                aria-hidden="true"
                            >
                                {formatNumber(
                                    analysisCoverage.contentOpportunitiesScored,
                                )}
                            </span>
                            <span className={styles.srOnly}>
                                {formatNumber(
                                    analysisCoverage.contentOpportunitiesScored,
                                )}
                            </span>
                        </div>
                    </div>
                    <div
                        className={`${styles.callout} ${styles.selectedCallout}`}
                    >
                        <div className={styles.calloutLabel}>
                            Priority opportunities selected
                        </div>
                        <div className={styles.calloutValue}>
                            <span
                                ref={(element) => {
                                    milestoneValueRefs.current[2] = element;
                                }}
                                aria-hidden="true"
                            >
                                {formatNumber(
                                    analysisCoverage.contentRecommendationsSelected,
                                )}
                            </span>
                            <span className={styles.srOnly}>
                                {formatNumber(
                                    analysisCoverage.contentRecommendationsSelected,
                                )}
                            </span>
                        </div>
                    </div>

                    <div
                        className={`${styles.connector} ${styles.discoveredConnector}`}
                    >
                        <img
                            src="/serp-report/analysis-scope/discovered-connector.svg"
                            alt=""
                        />
                    </div>
                    <div
                        className={`${styles.connector} ${styles.scoredConnector}`}
                    >
                        <img
                            src="/serp-report/analysis-scope/scored-connector.svg"
                            alt=""
                        />
                    </div>
                    <div
                        className={`${styles.connector} ${styles.selectedConnector}`}
                    >
                        <img
                            src="/serp-report/analysis-scope/selected-connector.svg"
                            alt=""
                        />
                        <span
                            className={styles.selectedLeadIn}
                            aria-hidden="true"
                        />
                        <span
                            className={styles.finalPointPulse}
                            aria-hidden="true"
                        />
                    </div>
                </div>

                <section
                    className={`${pageStyles.keySummary} ${styles.conclusion}`}
                >
                    <h2 className={styles.conclusionTitle}>
                        Tavyn examines {possessiveCompanyName} full search
                        landscape.
                    </h2>
                    <p className={styles.conclusionDescription}>
                        We evaluated{' '}
                        {formatNumber(analysisCoverage.queriesEvaluated)} search
                        queries and identified{' '}
                        {formatNumber(analysisCoverage.queriesValidated)} that
                        were directly relevant to {analysisCoverage.companyName}
                        &rsquo;s market. Of those,{' '}
                        {formatNumber(
                            analysisCoverage.problemQueriesValidated,
                        )}{' '}
                        focused on customer problems and{' '}
                        {formatNumber(
                            analysisCoverage.solutionQueriesValidated,
                        )}{' '}
                        focused on potential solutions. We then scored the top{' '}
                        {formatNumber(
                            analysisCoverage.contentOpportunitiesScored,
                        )}{' '}
                        content opportunities and selected the{' '}
                        {formatNumber(
                            analysisCoverage.contentRecommendationsSelected,
                        )}{' '}
                        strongest for deeper analysis.
                    </p>
                </section>
            </div>
        </div>
    );
}
