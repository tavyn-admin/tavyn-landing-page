'use client';

import {
    useLayoutEffect,
    useRef,
    useState,
    type CSSProperties,
    type KeyboardEvent,
} from 'react';

import type {
    ContentPlanData,
    ContentPlanRecommendation,
} from '@/lib/serp-report/schema';
import { useSerpTelemetry } from '@/components/serp-report/SerpTelemetryProvider';
import ExpandedContentPlanCard from './ExpandedContentPlanCard';
import styles from './RecommendedContentPlan.module.css';

const numberFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
});
const integerFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
});

type ContentPlanCardsProps = {
    recommendations: ContentPlanData['recommendations'];
    averageOpportunityScore: number;
    companyName: string;
};

function formatNumber(value: number) {
    return numberFormatter.format(value);
}

function formatInteger(value: number) {
    return integerFormatter.format(value);
}

function formatRecommendationNumber(index: number) {
    return String(index + 1).padStart(2, '0');
}

function RecommendationSummary({
    recommendation,
    index,
}: {
    recommendation: ContentPlanRecommendation;
    index: number;
}) {
    const title =
        recommendation.recommendedTitle || recommendation.primaryQuery;

    return (
        <span className={styles.recommendationSummary}>
            <span className={styles.recommendationSequence}>
                <strong>{formatRecommendationNumber(index)}</strong>
            </span>
            <span className={styles.recommendationTitle}>{title}</span>
            <span className={styles.recommendationQuery}>
                Target query: {recommendation.primaryQuery}
            </span>
            <span className={styles.recommendationMetrics}>
                <span>
                    <small>Monthly volume</small>
                    <strong>
                        {formatInteger(recommendation.monthlySearchVolume)}
                    </strong>
                </span>
                <span>
                    <small>Difficulty</small>
                    <strong>
                        {formatNumber(recommendation.keywordDifficulty)}
                    </strong>
                </span>
                <span>
                    <small>Opportunity</small>
                    <strong>
                        {formatNumber(recommendation.opportunityScore)}
                    </strong>
                </span>
            </span>
        </span>
    );
}

export default function RecommendedContentPlanCards({
    recommendations,
    averageOpportunityScore,
    companyName,
}: ContentPlanCardsProps) {
    const { capture } = useSerpTelemetry();
    const [activeIndex, setActiveIndex] = useState(0);
    const [displayedIndex, setDisplayedIndex] = useState(0);
    const [panelPhase, setPanelPhase] = useState<'settled' | 'out' | 'in'>(
        'settled',
    );
    const [hasInteracted, setHasInteracted] = useState(false);
    const [railGeometry, setRailGeometry] = useState({ height: 0, offset: 0 });
    const navigatorRef = useRef<HTMLDivElement | null>(null);
    const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const transitionTimersRef = useRef<Array<ReturnType<typeof setTimeout>>>(
        [],
    );
    const activeRecommendation =
        recommendations[displayedIndex] ?? recommendations[0];

    useLayoutEffect(() => {
        const navigator = navigatorRef.current;
        const selectedRow = tabRefs.current[activeIndex];

        if (!navigator || !selectedRow) {
            return;
        }

        const measureRail = () => {
            setRailGeometry({
                height: selectedRow.offsetHeight,
                offset: selectedRow.offsetTop,
            });
        };

        measureRail();
        const resizeObserver = new ResizeObserver(measureRail);
        resizeObserver.observe(navigator);
        resizeObserver.observe(selectedRow);

        return () => resizeObserver.disconnect();
    }, [activeIndex, recommendations.length]);

    useLayoutEffect(
        () => () => {
            transitionTimersRef.current.forEach(clearTimeout);
        },
        [],
    );

    function selectTab(index: number, moveFocus = false) {
        if (moveFocus) {
            tabRefs.current[index]?.focus();
        }

        if (index === activeIndex) {
            return;
        }

        const recommendation = recommendations[index];
        if (recommendation) {
            capture('serp_recommendation_viewed', {
                recommendation_id: recommendation.id,
                recommendation_rank: recommendation.recommendationRank,
            });
        }

        transitionTimersRef.current.forEach(clearTimeout);
        transitionTimersRef.current = [];
        setActiveIndex(index);
        setHasInteracted(true);

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setDisplayedIndex(index);
            setPanelPhase('settled');
            return;
        }

        setPanelPhase('out');
        transitionTimersRef.current.push(
            setTimeout(() => {
                setDisplayedIndex(index);
                setPanelPhase('in');
                transitionTimersRef.current.push(
                    setTimeout(() => setPanelPhase('settled'), 350),
                );
            }, 110),
        );
    }

    function handleTabKeyDown(
        event: KeyboardEvent<HTMLButtonElement>,
        index: number,
    ) {
        let nextIndex: number | null = null;

        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
            nextIndex = (index + 1) % recommendations.length;
        } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
            nextIndex =
                (index - 1 + recommendations.length) % recommendations.length;
        } else if (event.key === 'Home') {
            nextIndex = 0;
        } else if (event.key === 'End') {
            nextIndex = recommendations.length - 1;
        }

        if (nextIndex !== null) {
            event.preventDefault();
            selectTab(nextIndex, true);
        }
    }

    return (
        <div
            className={styles.contentPlanStack}
            data-interacted={hasInteracted ? 'true' : undefined}
            data-panel-phase={panelPhase}
        >
            <div className={styles.desktopSurface}>
                <div
                    ref={navigatorRef}
                    className={styles.recommendationNavigator}
                    role="tablist"
                    aria-label="Content sprint recommendations"
                >
                    <span
                        className={styles.selectionRail}
                        style={
                            {
                                '--selection-rail-height': `${railGeometry.height}px`,
                                '--selection-rail-offset': `${railGeometry.offset}px`,
                            } as CSSProperties
                        }
                        aria-hidden="true"
                    />
                    {recommendations.map((recommendation, index) => {
                        const tabId = `content-sprint-tab-${index}`;
                        const panelId = `content-sprint-panel-${index}`;
                        const isActive = activeIndex === index;

                        return (
                            <button
                                ref={(element) => {
                                    tabRefs.current[index] = element;
                                }}
                                id={tabId}
                                key={recommendation.id}
                                type="button"
                                role="tab"
                                className={styles.recommendationButton}
                                data-active={isActive ? 'true' : undefined}
                                style={
                                    {
                                        '--recommendation-index': index,
                                    } as CSSProperties
                                }
                                aria-selected={isActive}
                                aria-controls={panelId}
                                tabIndex={isActive ? 0 : -1}
                                onClick={() => selectTab(index)}
                                onKeyDown={(event) =>
                                    handleTabKeyDown(event, index)
                                }
                            >
                                <RecommendationSummary
                                    recommendation={recommendation}
                                    index={index}
                                />
                            </button>
                        );
                    })}
                </div>

                <ExpandedContentPlanCard
                    key={activeRecommendation.id}
                    id={`content-sprint-panel-${activeIndex}`}
                    labelledBy={`content-sprint-tab-${activeIndex}`}
                    recommendation={activeRecommendation}
                    averageOpportunityScore={averageOpportunityScore}
                    companyName={companyName}
                    panelRole="tabpanel"
                />
            </div>

            <div className={styles.mobileAccordion}>
                {recommendations.map((recommendation, index) => {
                    const isActive = activeIndex === index;
                    const triggerId = `mobile-content-sprint-trigger-${index}`;
                    const panelId = `mobile-content-sprint-panel-${index}`;

                    return (
                        <section
                            className={styles.mobileRecommendation}
                            data-active={isActive ? 'true' : undefined}
                            key={recommendation.id}
                            style={
                                {
                                    '--recommendation-index': index,
                                } as CSSProperties
                            }
                        >
                            <button
                                id={triggerId}
                                type="button"
                                className={styles.mobileRecommendationButton}
                                aria-expanded={isActive}
                                aria-controls={panelId}
                                onClick={() => selectTab(index)}
                            >
                                <RecommendationSummary
                                    recommendation={recommendation}
                                    index={index}
                                />
                            </button>
                            {isActive ? (
                                <ExpandedContentPlanCard
                                    key={recommendation.id}
                                    id={panelId}
                                    labelledBy={triggerId}
                                    recommendation={recommendation}
                                    averageOpportunityScore={
                                        averageOpportunityScore
                                    }
                                    companyName={companyName}
                                    panelRole="region"
                                />
                            ) : null}
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
