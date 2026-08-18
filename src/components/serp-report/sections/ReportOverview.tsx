'use client';

import {
    useLayoutEffect,
    useRef,
    type CSSProperties,
    type RefObject,
} from 'react';
import Link from 'next/link';

import type { ReportOverviewData } from '@/lib/serp-report/schema';
import styles from './ReportOverview.module.css';

const logoSrc = '/serp-report/overview/logo.svg';
const tagIndicatorSrc = '/serp-report/overview/tag-indicator.svg';

const compactNumberFormatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
});
const standardNumberFormatter = new Intl.NumberFormat('en-US');
const percentageFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
});

function clampPercentage(value: number) {
    return Math.min(100, Math.max(0, value));
}

function formatPossessiveName(name: string) {
    return `${name}'s`;
}

function getOverviewConclusionHeading({
    companyName,
    recommendationsSelected,
    problemRecommendations,
    solutionRecommendations,
}: {
    companyName: string;
    recommendationsSelected: number;
    problemRecommendations: number;
    solutionRecommendations: number;
}) {
    if (recommendationsSelected === 0) {
        return 'The analysis identifies where further validation is needed.';
    }

    if (problemRecommendations > 0 && solutionRecommendations > 0) {
        return `${formatPossessiveName(companyName)} customers are already searching. Tavyn found where ${companyName} can win.`;
    }

    if (problemRecommendations > 0) {
        return 'The plan prioritizes customer-problem demand.';
    }

    return 'The plan prioritizes solution-category demand.';
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

function MetricPair({
    metrics,
    className,
}: {
    metrics: { label: string; value: string }[];
    className?: string;
}) {
    return (
        <div className={`${styles.metricPair} ${className ?? ''}`}>
            {metrics.map((metric) => (
                <div className={styles.metric} key={metric.label}>
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                </div>
            ))}
        </div>
    );
}

function AnimatedMetric({
    label,
    value,
    formatter,
    visualRef,
}: {
    label: string;
    value: number;
    formatter: Intl.NumberFormat;
    visualRef: RefObject<HTMLElement>;
}) {
    const formattedValue = formatter.format(value);

    return (
        <div className={styles.metric}>
            <span>{label}</span>
            <strong className={styles.srOnly}>{formattedValue}</strong>
            <strong ref={visualRef} aria-hidden="true">
                {formattedValue}
            </strong>
        </div>
    );
}

function FittedDetailValue({ children }: { children: string }) {
    const valueRef = useRef<HTMLElement>(null);

    useLayoutEffect(() => {
        const element = valueRef.current;
        const row = element?.parentElement;

        if (!element || !row) return;

        let animationFrame = 0;
        const fitValue = () => {
            cancelAnimationFrame(animationFrame);
            animationFrame = requestAnimationFrame(() => {
                element.style.removeProperty('--detail-value-size');
                let minimum = 8;
                let maximum = Number.parseFloat(
                    getComputedStyle(element).fontSize,
                );
                let fittedSize = minimum;

                for (let step = 0; step < 7; step += 1) {
                    const candidate = (minimum + maximum) / 2;
                    element.style.setProperty(
                        '--detail-value-size',
                        `${candidate}px`,
                    );

                    if (element.scrollWidth <= element.clientWidth) {
                        fittedSize = candidate;
                        minimum = candidate;
                    } else {
                        maximum = candidate;
                    }
                }

                element.style.setProperty(
                    '--detail-value-size',
                    `${fittedSize}px`,
                );
            });
        };

        const resizeObserver = new ResizeObserver(fitValue);
        resizeObserver.observe(row);
        fitValue();

        return () => {
            cancelAnimationFrame(animationFrame);
            resizeObserver.disconnect();
        };
    }, [children]);

    return (
        <strong ref={valueRef} className={styles.detailValue}>
            {children}
        </strong>
    );
}

function formatCoverageValue(value: number) {
    return `${percentageFormatter.format(value)}%`;
}

export default function ReportOverview({ data }: { data: ReportOverviewData }) {
    const validatedQueriesRef = useRef<HTMLElement>(null);
    const monthlyVolumeRef = useRef<HTMLElement>(null);
    const demandSplitStyle = {
        '--overview-problem-width': `${clampPercentage(data.problemDemandPercentage)}%`,
        '--overview-solution-width': `${clampPercentage(data.solutionDemandPercentage)}%`,
    } as CSSProperties;
    const validatedQueryWord = pluralize(
        data.validatedQueries,
        'query',
        'queries',
    );
    const competitorWord = pluralize(
        data.competitorsProfiled,
        'competitor',
        'competitors',
    );
    const recommendationWord = pluralize(
        data.recommendationsSelected,
        'recommendation',
        'recommendations',
    );
    const opportunityWord = pluralize(
        data.opportunitiesScored,
        'opportunity',
        'opportunities',
    );
    const opportunityWasWere = data.opportunitiesScored === 1 ? 'was' : 'were';
    const recommendationWasWere =
        data.recommendationsSelected === 1 ? 'was' : 'were';
    const selectedWasWere = data.recommendationsSelected === 1 ? 'was' : 'were';
    const scoredOpportunityWord = pluralize(
        data.opportunitiesScored,
        'opportunity',
        'opportunities',
    );
    const possessiveCompanyName = formatPossessiveName(data.companyName);
    const broadestCoverageValue = data.broadestCoverage
        ? `${data.broadestCoverage.domain} · ${formatCoverageValue(data.broadestCoverage.percentage)}`
        : 'Not available';

    useLayoutEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const animationFrames = new Set<number>();

        const animateNumber = (
            element: HTMLElement | null,
            target: number,
            formatter: Intl.NumberFormat,
            delay: number,
            duration: number,
        ) => {
            if (!element) return;

            element.textContent = formatter.format(0);
            let startedAt: number | null = null;
            const tick = (timestamp: number) => {
                if (startedAt === null) startedAt = timestamp;
                const elapsed = timestamp - startedAt;
                const progress = Math.min(
                    1,
                    Math.max(0, (elapsed - delay) / duration),
                );
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                element.textContent = formatter.format(
                    progress === 1 ? target : target * easedProgress,
                );

                if (progress < 1) {
                    const frame = requestAnimationFrame(tick);
                    animationFrames.add(frame);
                }
            };

            const frame = requestAnimationFrame(tick);
            animationFrames.add(frame);
        };

        animateNumber(
            validatedQueriesRef.current,
            data.validatedQueries,
            standardNumberFormatter,
            1150,
            1600,
        );
        animateNumber(
            monthlyVolumeRef.current,
            data.combinedMonthlyVolume,
            compactNumberFormatter,
            1250,
            1600,
        );

        return () => {
            animationFrames.forEach((frame) => cancelAnimationFrame(frame));
        };
    }, [data.combinedMonthlyVolume, data.validatedQueries]);

    return (
        <div className={styles.root}>
            <nav className={styles.nav} aria-label="Report navigation">
                <Link className={styles.brand} href="/" aria-label="Tavyn home">
                    <img src={logoSrc} alt="" aria-hidden="true" />
                    <span>Tavyn</span>
                </Link>
                <Link
                    className={styles.waitlistButton}
                    href="/waitlist?source=serp_report"
                >
                    Join Waitlist
                </Link>
            </nav>

            <div className={styles.mainSection}>
                <header className={styles.reportHeader}>
                    <h1>{possessiveCompanyName} Search Landscape Report</h1>
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
                    <section
                        className={styles.summary}
                        aria-labelledby="report-overview-summary"
                    >
                        <h2 id="report-overview-summary">Executive Summary</h2>

                        <div className={styles.cards}>
                            <article
                                className={styles.card}
                                style={
                                    {
                                        '--overview-card-index': 0,
                                    } as CSSProperties
                                }
                            >
                                <CardHeader
                                    number="01"
                                    title="Validated search demand"
                                    description={`We validated ${standardNumberFormatter.format(
                                        data.validatedQueries,
                                    )} ${validatedQueryWord} relevant to ${
                                        data.companyName
                                    } across customer problems and solution-category demand.`}
                                />
                                <div className={styles.metricPair}>
                                    <AnimatedMetric
                                        label="Validated Queries"
                                        value={data.validatedQueries}
                                        formatter={standardNumberFormatter}
                                        visualRef={validatedQueriesRef}
                                    />
                                    <AnimatedMetric
                                        label="Combined Monthly Volume"
                                        value={data.combinedMonthlyVolume}
                                        formatter={compactNumberFormatter}
                                        visualRef={monthlyVolumeRef}
                                    />
                                </div>
                                <div
                                    className={styles.demandSplit}
                                    style={demandSplitStyle}
                                >
                                    <div className={styles.splitLabels}>
                                        <span>Problem-Led Demand</span>
                                        <span>Solution-Led Demand</span>
                                    </div>
                                    <div
                                        className={styles.splitBar}
                                        aria-hidden="true"
                                    >
                                        <span
                                            className={styles.problemSegment}
                                        />
                                        <span
                                            className={styles.solutionSegment}
                                        />
                                    </div>
                                    <div className={styles.splitValues}>
                                        <strong>
                                            {data.problemDemandPercentage}%
                                        </strong>
                                        <strong>
                                            {data.solutionDemandPercentage}%
                                        </strong>
                                    </div>
                                </div>
                            </article>

                            <article
                                className={styles.card}
                                style={
                                    {
                                        '--overview-card-index': 1,
                                    } as CSSProperties
                                }
                            >
                                <CardHeader
                                    number="02"
                                    title="Competitive landscape"
                                    description={`We profiled ${standardNumberFormatter.format(
                                        data.competitorsProfiled,
                                    )} ${competitorWord} competing for visibility across the validated query set.`}
                                />
                                <div className={styles.competitorSummary}>
                                    <MetricPair
                                        className={styles.competitiveMetrics}
                                        metrics={[
                                            {
                                                label: 'Competitors Profiled',
                                                value: standardNumberFormatter.format(
                                                    data.competitorsProfiled,
                                                ),
                                            },
                                            {
                                                label: 'Page-One Competitors',
                                                value: standardNumberFormatter.format(
                                                    data.pageOneCompetitors,
                                                ),
                                            },
                                        ]}
                                    />
                                    <div className={styles.detailRows}>
                                        <div className={styles.detailRow}>
                                            <span>Visibility Leader</span>
                                            <FittedDetailValue>
                                                {data.visibilityLeader
                                                    ?.domain ?? 'Not available'}
                                            </FittedDetailValue>
                                        </div>
                                        <div className={styles.detailRow}>
                                            <span>Broadest Query Coverage</span>
                                            <FittedDetailValue>
                                                {broadestCoverageValue}
                                            </FittedDetailValue>
                                        </div>
                                    </div>
                                </div>
                            </article>

                            <article
                                className={styles.card}
                                style={
                                    {
                                        '--overview-card-index': 2,
                                    } as CSSProperties
                                }
                            >
                                <CardHeader
                                    number="03"
                                    title="Recommended next moves"
                                    description={`${data.opportunitiesScored} ${opportunityWord} ${opportunityWasWere} evaluated in depth, and ${data.recommendationsSelected} ${recommendationWord} ${recommendationWasWere} selected for the content plan.`}
                                />
                                <div className={styles.actionabilityBody}>
                                    <MetricPair
                                        metrics={[
                                            {
                                                label: 'Opportunities Scored',
                                                value: standardNumberFormatter.format(
                                                    data.opportunitiesScored,
                                                ),
                                            },
                                            {
                                                label: 'Recommendations Selected',
                                                value: standardNumberFormatter.format(
                                                    data.recommendationsSelected,
                                                ),
                                            },
                                        ]}
                                    />
                                    <div
                                        className={styles.tags}
                                        aria-label="Action themes"
                                    >
                                        {data.recommendationPageTypes.map(
                                            (tag) => (
                                                <span
                                                    className={styles.tag}
                                                    key={tag}
                                                >
                                                    <img
                                                        src={tagIndicatorSrc}
                                                        alt=""
                                                        aria-hidden="true"
                                                    />
                                                    {tag}
                                                </span>
                                            ),
                                        )}
                                    </div>
                                </div>
                            </article>
                        </div>
                    </section>

                    <section
                        className={styles.conclusion}
                        aria-labelledby="report-overview-conclusion"
                    >
                        <h2 id="report-overview-conclusion">
                            {getOverviewConclusionHeading({
                                companyName: data.companyName,
                                recommendationsSelected:
                                    data.recommendationsSelected,
                                problemRecommendations:
                                    data.problemRecommendations,
                                solutionRecommendations:
                                    data.solutionRecommendations,
                            })}
                        </h2>
                        <p>
                            <span>Across </span>
                            <strong>
                                {standardNumberFormatter.format(
                                    data.validatedQueries,
                                )}
                            </strong>
                            <span>
                                {' '}
                                validated {validatedQueryWord},{' '}
                                {data.companyName} found{' '}
                            </span>
                            <strong>
                                {standardNumberFormatter.format(
                                    data.combinedMonthlyVolume,
                                )}
                            </strong>
                            <span>
                                {' '}
                                combined monthly searches, split between{' '}
                            </span>
                            <strong>{data.problemDemandPercentage}%</strong>
                            <span> problem-led and </span>
                            <strong>{data.solutionDemandPercentage}%</strong>
                            <span>
                                {' '}
                                solution-led demand. The analysis profiled{' '}
                            </span>
                            <strong>
                                {standardNumberFormatter.format(
                                    data.competitorsProfiled,
                                )}
                            </strong>
                            <span> {competitorWord}, with </span>
                            <strong>
                                {standardNumberFormatter.format(
                                    data.pageOneCompetitors,
                                )}
                            </strong>
                            <span>
                                {' '}
                                achieving a median page-one position. From{' '}
                            </span>
                            <strong>
                                {standardNumberFormatter.format(
                                    data.opportunitiesScored,
                                )}
                            </strong>
                            <span> scored {scoredOpportunityWord}, </span>
                            <strong>
                                {standardNumberFormatter.format(
                                    data.recommendationsSelected,
                                )}
                            </strong>
                            <span> {selectedWasWere} selected for content</span>
                            {data.recommendationsSelected > 0 ? (
                                <>
                                    <span>: </span>
                                    <strong>
                                        {standardNumberFormatter.format(
                                            data.problemRecommendations,
                                        )}
                                    </strong>
                                    <span> problem-led and </span>
                                    <strong>
                                        {standardNumberFormatter.format(
                                            data.solutionRecommendations,
                                        )}
                                    </strong>
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
