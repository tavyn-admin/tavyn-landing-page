'use client';

import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type CSSProperties,
    type RefObject,
} from 'react';
import { createPortal } from 'react-dom';

import type { SearchOpportunityPoint } from '@/lib/serp-report/schema';
import MetricTooltip from './MetricTooltip';
import {
    clusterOpportunityPoints,
    type OpportunityCluster,
} from './searchOpportunityClusters';
import styles from './SearchOpportunityMap.module.css';

const VIEWBOX_WIDTH = 1140;
const VIEWBOX_HEIGHT = 460;
const PLOT = {
    left: 72,
    right: 44,
    top: 44,
    bottom: 72,
};
const PLOT_WIDTH = VIEWBOX_WIDTH - PLOT.left - PLOT.right;
const PLOT_HEIGHT = VIEWBOX_HEIGHT - PLOT.top - PLOT.bottom;
const TICKS = [0, 20, 40, 60, 80, 100] as const;

const rankingAttainabilityDescription =
    'How achievable it may be to rank organically. It is calculated as 100 minus Keyword Difficulty, so a higher value means the query should be easier to rank for.';
const relativeDemandDescription =
    'How much search demand a query has relative to the typical high-demand queries in the same territory. It uses a logarithmic scale and the territory’s 95th-percentile search-volume benchmark, capped at 100, so one unusually large query does not overwhelm the graph.';
const attainabilityBandDescription =
    'Many queries have very low Keyword Difficulty. Because Ranking Attainability equals 100 − Keyword Difficulty, they naturally appear near the right edge. Their height shows their relative search demand.';

const numberFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
});
const scoreFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
});

type SearchOpportunityMapProps = {
    companyName: string;
    points: SearchOpportunityPoint[];
    totalQueries: number;
};

type PlottedCluster = OpportunityCluster & {
    x: number;
    y: number;
};

type PointStyle = CSSProperties & {
    '--point-fill': string;
    '--priority-delay': string;
};

type CanvasStyle = CSSProperties & {
    '--visual-scale': number;
};

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
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

function formatStatus(status: SearchOpportunityPoint['status']) {
    if (status === 'selected') {
        return 'Selected for content';
    }

    if (status === 'scored') {
        return 'Top 20 opportunity';
    }

    return 'Validated query';
}

function getRawDifficultyLabel(point: SearchOpportunityPoint) {
    if (point.keywordDifficulty === null) {
        return point.keywordDifficultyWasImputed
            ? `Not observed (imputed as ${scoreFormatter.format(point.keywordDifficultyUsed)})`
            : 'Not observed';
    }

    if (point.keywordDifficultyWasImputed) {
        return `${scoreFormatter.format(point.keywordDifficulty)} (score uses ${scoreFormatter.format(
            point.keywordDifficultyUsed,
        )})`;
    }

    return scoreFormatter.format(point.keywordDifficulty);
}

function getPointFill(cluster: OpportunityCluster) {
    if (cluster.hasMixedTerritories) {
        return 'var(--serp-color-text-secondary)';
    }

    if (!cluster.hasSelected && cluster.hasTopTwenty) {
        return 'var(--serp-brand-mid)';
    }

    const score = clamp(cluster.opportunityScore, 0, 100);

    if (score < 45) {
        const mix = (score / 45) * 100;
        return `color-mix(in srgb, var(--serp-opportunity-low) ${100 - mix}%, var(--serp-opportunity-neutral) ${mix}%)`;
    }

    if (score < 70) {
        const mix = ((score - 45) / 25) * 100;
        return `color-mix(in srgb, var(--serp-opportunity-neutral) ${100 - mix}%, var(--serp-opportunity-medium) ${mix}%)`;
    }

    const mix = ((score - 70) / 30) * 100;
    return `color-mix(in srgb, var(--serp-opportunity-medium) ${100 - mix}%, var(--serp-opportunity-high) ${mix}%)`;
}

function ClusterDetails({
    cluster,
    anchorRect,
    pinned,
    panelRef,
    onClose,
}: {
    cluster: OpportunityCluster;
    anchorRect: DOMRect;
    pinned: boolean;
    panelRef: RefObject<HTMLDivElement>;
    onClose: () => void;
}) {
    const [position, setPosition] = useState({ left: -9999, top: -9999 });

    const updatePosition = useCallback(() => {
        const panel = panelRef.current;

        if (!panel) {
            return;
        }

        const gutter = 8;
        const gap = 10;
        const { width, height } = panel.getBoundingClientRect();
        let left = anchorRect.right + gap;
        let top = anchorRect.top - Math.min(height / 2, 110);

        if (left + width > window.innerWidth - gutter) {
            left = anchorRect.left - width - gap;
        }

        setPosition({
            left: clamp(
                left,
                gutter,
                Math.max(gutter, window.innerWidth - width - gutter),
            ),
            top: clamp(
                top,
                gutter,
                Math.max(gutter, window.innerHeight - height - gutter),
            ),
        });
    }, [anchorRect, panelRef]);

    useLayoutEffect(() => {
        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [updatePosition]);

    return createPortal(
        <div
            ref={panelRef}
            id={`cluster-details-${cluster.id}`}
            className={styles.clusterPanel}
            style={position}
            role={pinned ? 'dialog' : 'tooltip'}
            aria-label={
                cluster.points.length > 1
                    ? `${cluster.points.length} grouped queries`
                    : cluster.points[0].query
            }
        >
            <header className={styles.clusterPanelHeader}>
                <div>
                    <strong>
                        {cluster.points.length > 1
                            ? `${cluster.points.length} queries at this position`
                            : cluster.points[0].query}
                    </strong>
                    <span>
                        {pinned
                            ? 'Details pinned'
                            : 'Click the marker to keep this open'}
                    </span>
                </div>
                {pinned ? (
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close query details"
                    >
                        ×
                    </button>
                ) : null}
            </header>
            <div
                className={styles.clusterQueryList}
                tabIndex={cluster.points.length > 2 ? 0 : undefined}
            >
                {cluster.points.map((point) => (
                    <article
                        className={styles.clusterQuery}
                        key={point.queryId}
                    >
                        <div className={styles.clusterQueryHeading}>
                            <strong>{point.query}</strong>
                            <span data-status={point.status}>
                                {formatStatus(point.status)}
                            </span>
                        </div>
                        <p>{`${point.demandType} Demand · ${formatDisplayLabel(point.searchIntent)} intent`}</p>
                        <dl>
                            <div>
                                <dt>Monthly volume</dt>
                                <dd>
                                    {point.searchVolume === null
                                        ? 'Not observed'
                                        : numberFormatter.format(
                                              point.searchVolume,
                                          )}
                                </dd>
                            </div>
                            <div>
                                <dt>Keyword Difficulty</dt>
                                <dd>{getRawDifficultyLabel(point)}</dd>
                            </div>
                            <div>
                                <dt>Relative demand</dt>
                                <dd>
                                    {scoreFormatter.format(
                                        point.relativeSearchDemand,
                                    )}{' '}
                                    / 100
                                </dd>
                            </div>
                            <div>
                                <dt>Attainability</dt>
                                <dd>
                                    {scoreFormatter.format(
                                        point.rankingAttainability,
                                    )}{' '}
                                    / 100
                                </dd>
                            </div>
                            <div>
                                <dt>Opportunity Score</dt>
                                <dd>
                                    {scoreFormatter.format(
                                        point.opportunityScore,
                                    )}{' '}
                                    / 100
                                </dd>
                            </div>
                            <div>
                                <dt>Recommendation</dt>
                                <dd>
                                    {point.recommendationRank === null
                                        ? '—'
                                        : `#${numberFormatter.format(point.recommendationRank)}`}
                                </dd>
                            </div>
                        </dl>
                        {point.keywordDifficultyWasImputed ? (
                            <p className={styles.imputationNote}>
                                Keyword Difficulty was imputed for scoring.
                            </p>
                        ) : null}
                    </article>
                ))}
            </div>
        </div>,
        document.body,
    );
}

function BandExplanation({
    anchorRef,
    tooltipRef,
}: {
    anchorRef: RefObject<SVGRectElement | null>;
    tooltipRef: RefObject<HTMLDivElement>;
}) {
    const [position, setPosition] = useState({ left: -9999, top: -9999 });

    const updatePosition = useCallback(() => {
        const anchor = anchorRef.current;
        const tooltip = tooltipRef.current;

        if (!anchor || !tooltip) {
            return;
        }

        const gutter = 8;
        const gap = 10;
        const anchorRect = anchor.getBoundingClientRect();
        const { width, height } = tooltip.getBoundingClientRect();
        let left = anchorRect.left - width - gap;

        if (left < gutter) {
            left = anchorRect.right + gap;
        }

        setPosition({
            left: clamp(
                left,
                gutter,
                Math.max(gutter, window.innerWidth - width - gutter),
            ),
            top: clamp(
                anchorRect.top + 12,
                gutter,
                Math.max(gutter, window.innerHeight - height - gutter),
            ),
        });
    }, [anchorRef, tooltipRef]);

    useLayoutEffect(() => {
        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [updatePosition]);

    return createPortal(
        <div
            ref={tooltipRef}
            id="attainability-band-tooltip"
            className={styles.bandTooltip}
            style={position}
            role="tooltip"
        >
            <strong>Why do queries gather here?</strong>
            <p>{attainabilityBandDescription}</p>
        </div>,
        document.body,
    );
}

export default function SearchOpportunityMap({
    companyName,
    points,
    totalQueries,
}: SearchOpportunityMapProps) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLDivElement | null>(null);
    const panelRef = useRef<HTMLDivElement | null>(null);
    const bandRef = useRef<SVGRectElement | null>(null);
    const bandTooltipRef = useRef<HTMLDivElement | null>(null);
    const markerRefs = useRef(new Map<string, SVGCircleElement>());
    const [canvasSize, setCanvasSize] = useState({
        width: VIEWBOX_WIDTH,
        height: VIEWBOX_HEIGHT,
    });
    const [transientClusterId, setTransientClusterId] = useState<string | null>(
        null,
    );
    const [pinnedClusterId, setPinnedClusterId] = useState<string | null>(null);
    const [activeAnchorRect, setActiveAnchorRect] = useState<DOMRect | null>(
        null,
    );
    const [bandTransient, setBandTransient] = useState(false);
    const [bandPinned, setBandPinned] = useState(false);
    const bandOpen = bandTransient || bandPinned;
    const visualScale = 1;
    const isCompact = false;
    const clusters = useMemo(() => {
        const renderedPlotWidth =
            (canvasSize.width / VIEWBOX_WIDTH) * PLOT_WIDTH;
        const renderedPlotHeight =
            (canvasSize.height / VIEWBOX_HEIGHT) * PLOT_HEIGHT;

        return clusterOpportunityPoints(
            points,
            renderedPlotWidth,
            renderedPlotHeight,
        ).map((cluster): PlottedCluster => ({
            ...cluster,
            x:
                PLOT.left +
                (clamp(cluster.rankingAttainability, 0, 100) / 100) *
                    PLOT_WIDTH,
            y:
                PLOT.top +
                (1 - clamp(cluster.relativeSearchDemand, 0, 100) / 100) *
                    PLOT_HEIGHT,
        }));
    }, [canvasSize.height, canvasSize.width, points]);
    const activeClusterId = pinnedClusterId ?? transientClusterId;
    const activeCluster =
        clusters.find((cluster) => cluster.id === activeClusterId) ?? null;
    const selectedPriorities = useMemo(
        () =>
            points
                .filter((point) => point.status === 'selected')
                .toSorted(
                    (a, b) =>
                        (a.recommendationRank ?? Number.POSITIVE_INFINITY) -
                        (b.recommendationRank ?? Number.POSITIVE_INFINITY),
                )
                .map((point, index) => ({
                    point,
                    priority: index + 1,
                    clusterId: clusters.find((cluster) =>
                        cluster.points.some(
                            (member) => member.queryId === point.queryId,
                        ),
                    )?.id,
                })),
        [clusters, points],
    );

    useLayoutEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        let animationFrame = 0;
        const updateSize = () => {
            cancelAnimationFrame(animationFrame);
            animationFrame = requestAnimationFrame(() => {
                animationFrame = requestAnimationFrame(() => {
                    const rect = canvas.getBoundingClientRect();
                    setCanvasSize((current) =>
                        current.width === rect.width &&
                        current.height === rect.height
                            ? current
                            : { width: rect.width, height: rect.height },
                    );
                });
            });
        };
        const resizeObserver = new ResizeObserver(updateSize);

        updateSize();
        resizeObserver.observe(canvas);
        window.addEventListener('resize', updateSize);

        return () => {
            cancelAnimationFrame(animationFrame);
            resizeObserver.disconnect();
            window.removeEventListener('resize', updateSize);
        };
    }, []);

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
        let activationFrame = 0;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry?.isIntersecting) return;

                activationFrame = requestAnimationFrame(() => {
                    root.dataset.motion = 'active';
                });
                observer.disconnect();
            },
            { threshold: 0.25 },
        );

        observer.observe(root);
        return () => {
            cancelAnimationFrame(activationFrame);
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!pinnedClusterId) {
            return;
        }

        const closeOnOutsidePointer = (event: PointerEvent) => {
            const marker = markerRefs.current.get(pinnedClusterId);

            if (
                !marker?.contains(event.target as Node) &&
                !panelRef.current?.contains(event.target as Node)
            ) {
                setPinnedClusterId(null);
                setTransientClusterId(null);
                setActiveAnchorRect(null);
            }
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setPinnedClusterId(null);
                setTransientClusterId(null);
                setActiveAnchorRect(null);
                markerRefs.current.get(pinnedClusterId)?.focus();
            }
        };

        document.addEventListener('pointerdown', closeOnOutsidePointer);
        document.addEventListener('keydown', closeOnEscape);

        return () => {
            document.removeEventListener('pointerdown', closeOnOutsidePointer);
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, [pinnedClusterId]);

    useEffect(() => {
        if (!bandPinned) {
            return;
        }

        const closeOnOutsidePointer = (event: PointerEvent) => {
            const target = event.target as Node;

            if (
                !bandRef.current?.contains(target) &&
                !bandTooltipRef.current?.contains(target)
            ) {
                setBandPinned(false);
                setBandTransient(false);
            }
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setBandPinned(false);
                setBandTransient(false);
                bandRef.current?.focus();
            }
        };

        document.addEventListener('pointerdown', closeOnOutsidePointer);
        document.addEventListener('keydown', closeOnEscape);

        return () => {
            document.removeEventListener('pointerdown', closeOnOutsidePointer);
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, [bandPinned]);

    useLayoutEffect(() => {
        if (!activeClusterId) {
            return;
        }

        const updateAnchor = () => {
            const marker = markerRefs.current.get(activeClusterId);

            if (marker) {
                setActiveAnchorRect(marker.getBoundingClientRect());
            }
        };

        updateAnchor();
        window.addEventListener('resize', updateAnchor);
        window.addEventListener('scroll', updateAnchor, true);

        return () => {
            window.removeEventListener('resize', updateAnchor);
            window.removeEventListener('scroll', updateAnchor, true);
        };
    }, [activeClusterId]);

    const activateCluster = useCallback(
        (clusterId: string, element: SVGCircleElement) => {
            setTransientClusterId(clusterId);
            setActiveAnchorRect(element.getBoundingClientRect());
        },
        [],
    );

    const activateClusterById = useCallback((clusterId: string) => {
        const marker = markerRefs.current.get(clusterId);

        setTransientClusterId(clusterId);
        setActiveAnchorRect(marker?.getBoundingClientRect() ?? null);
    }, []);

    const clearTransientCluster = useCallback(() => {
        if (!pinnedClusterId) {
            setTransientClusterId(null);
            setActiveAnchorRect(null);
        }
    }, [pinnedClusterId]);

    const closeDetails = useCallback(() => {
        setPinnedClusterId(null);
        setTransientClusterId(null);
        setActiveAnchorRect(null);
    }, []);

    const canvasStyle = { '--visual-scale': visualScale } as CanvasStyle;

    return (
        <div
            ref={rootRef}
            id="search-opportunity-map"
            className={styles.root}
            data-compact={isCompact ? 'true' : undefined}
            data-interacting={activeClusterId ? 'true' : undefined}
            style={canvasStyle}
        >
            <header className={styles.chartHeader}>
                <h1>{companyName}&rsquo;s Query Analysis</h1>
                <p>
                    Each point represents a potential search query.
                    Opportunities become stronger toward the upper-right.
                </p>
            </header>

            {selectedPriorities.length > 0 ? (
                <div
                    className={styles.priorityRow}
                    aria-label="Selected priorities"
                >
                    <span className={styles.priorityLabel}>
                        Selected priorities
                    </span>
                    <div className={styles.priorityChips}>
                        {selectedPriorities.map(
                            ({ point, priority, clusterId }) => (
                                <button
                                    key={point.queryId}
                                    type="button"
                                    className={styles.priorityChip}
                                    data-active={
                                        clusterId === activeClusterId
                                            ? 'true'
                                            : undefined
                                    }
                                    style={
                                        {
                                            '--priority-delay': `${2200 + (priority - 1) * 180}ms`,
                                        } as PointStyle
                                    }
                                    aria-label={`Priority ${priority}: ${point.query}`}
                                    aria-pressed={clusterId === pinnedClusterId}
                                    aria-controls={
                                        clusterId
                                            ? `cluster-details-${clusterId}`
                                            : undefined
                                    }
                                    disabled={!clusterId}
                                    onMouseEnter={() =>
                                        clusterId &&
                                        activateClusterById(clusterId)
                                    }
                                    onMouseLeave={clearTransientCluster}
                                    onFocus={() =>
                                        clusterId &&
                                        activateClusterById(clusterId)
                                    }
                                    onBlur={clearTransientCluster}
                                    onClick={() => {
                                        if (!clusterId) return;
                                        const shouldPin =
                                            pinnedClusterId !== clusterId;
                                        setPinnedClusterId(
                                            shouldPin ? clusterId : null,
                                        );
                                        setTransientClusterId(
                                            shouldPin ? clusterId : null,
                                        );
                                        setActiveAnchorRect(
                                            shouldPin
                                                ? (markerRefs.current
                                                      .get(clusterId)
                                                      ?.getBoundingClientRect() ??
                                                      null)
                                                : null,
                                        );
                                    }}
                                >
                                    <span aria-hidden="true">{priority}</span>
                                    {point.query}
                                </button>
                            ),
                        )}
                    </div>
                </div>
            ) : null}

            <div className={styles.chartScroll}>
                <div ref={canvasRef} className={styles.chartCanvas}>
                    <div className={styles.legendRow}>
                        <div
                            className={styles.legend}
                            aria-label="Search Opportunity Map legend"
                            role="list"
                        >
                            <span className={styles.legendItem} role="listitem">
                                <span
                                    className={styles.queryShape}
                                    aria-hidden="true"
                                />
                                Query
                            </span>
                            <span className={styles.legendItem} role="listitem">
                                <span
                                    className={styles.selectedShape}
                                    aria-hidden="true"
                                />
                                Selected
                            </span>
                            <span
                                className={`${styles.legendItem} ${styles.scoreLegendItem}`}
                                role="listitem"
                            >
                                <span
                                    className={styles.scoreLegend}
                                    aria-hidden="true"
                                >
                                    <span className={styles.scoreRamp} />
                                    <span className={styles.scoreTicks}>
                                        <span>0</span>
                                        <span>50</span>
                                        <span>100</span>
                                    </span>
                                </span>
                                <span className={styles.scoreLabel}>
                                    Opportunity Score
                                </span>
                            </span>
                        </div>
                    </div>

                    <p
                        id="search-opportunity-map-description"
                        className={styles.srOnly}
                    >
                        Search Opportunity Map for{' '}
                        {numberFormatter.format(totalQueries)} validated
                        queries. Ranking Attainability runs from harder to rank
                        on the left to easier to rank on the right. Relative
                        Search Demand runs from lower demand at the bottom to
                        higher demand at the top. Higher values and points
                        farther toward the upper-right represent stronger
                        opportunities. Point color indicates backend Opportunity
                        Score. Every marker is circular; territory remains
                        available in query details. The shaded 94 to 100 Ranking
                        Attainability band explains why low-difficulty queries
                        gather near the right edge.
                    </p>
                    <svg
                        className={styles.svg}
                        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
                        role="group"
                        aria-labelledby="search-opportunity-map-title search-opportunity-map-description"
                    >
                        <title id="search-opportunity-map-title">
                            Search Opportunity Map
                        </title>
                        <desc id="attainability-band-description">
                            {attainabilityBandDescription}
                        </desc>
                        <rect
                            className={styles.plotBackground}
                            x={PLOT.left}
                            y={PLOT.top}
                            width={PLOT_WIDTH}
                            height={PLOT_HEIGHT}
                        />
                        <rect
                            className={styles.attainabilityBand}
                            data-active={bandOpen ? 'true' : undefined}
                            x={PLOT.left + PLOT_WIDTH * 0.94}
                            y={PLOT.top}
                            width={PLOT_WIDTH * 0.06}
                            height={PLOT_HEIGHT}
                        />
                        <rect
                            ref={bandRef}
                            className={styles.attainabilityBandTrigger}
                            x={PLOT.left + PLOT_WIDTH * 0.94}
                            y={PLOT.top}
                            width={PLOT_WIDTH * 0.06}
                            height={PLOT_HEIGHT}
                            tabIndex={0}
                            role="button"
                            aria-label="Explain why queries cluster near 100 Ranking Attainability"
                            aria-describedby="attainability-band-description"
                            aria-controls="attainability-band-tooltip"
                            aria-expanded={bandOpen}
                            onMouseEnter={() => setBandTransient(true)}
                            onMouseLeave={() => setBandTransient(false)}
                            onFocus={() => setBandTransient(true)}
                            onBlur={() => {
                                if (!bandPinned) {
                                    setBandTransient(false);
                                }
                            }}
                            onClick={() => {
                                const next = !bandPinned;
                                setBandPinned(next);
                                setBandTransient(next);
                            }}
                            onKeyDown={(event) => {
                                if (event.key === 'Escape') {
                                    setBandPinned(false);
                                    setBandTransient(false);
                                } else if (
                                    event.key === 'Enter' ||
                                    event.key === ' '
                                ) {
                                    event.preventDefault();
                                    const next = !bandPinned;
                                    setBandPinned(next);
                                    setBandTransient(next);
                                }
                            }}
                        />

                        {TICKS.map((tick) => {
                            const x = PLOT.left + (tick / 100) * PLOT_WIDTH;
                            const y = PLOT.top + (1 - tick / 100) * PLOT_HEIGHT;
                            const tickFontSize = 9 * visualScale;

                            return (
                                <g key={tick}>
                                    <line
                                        className={styles.gridLine}
                                        x1={x}
                                        y1={PLOT.top}
                                        x2={x}
                                        y2={PLOT.top + PLOT_HEIGHT}
                                    />
                                    <line
                                        className={styles.gridLine}
                                        x1={PLOT.left}
                                        y1={y}
                                        x2={PLOT.left + PLOT_WIDTH}
                                        y2={y}
                                    />
                                    <text
                                        className={styles.tickLabel}
                                        x={x}
                                        y={
                                            PLOT.top +
                                            PLOT_HEIGHT +
                                            (isCompact ? 12 : 18) * visualScale
                                        }
                                        textAnchor="middle"
                                        style={{ fontSize: tickFontSize }}
                                    >
                                        {tick}
                                    </text>
                                    <text
                                        className={styles.tickLabel}
                                        x={PLOT.left - 12 * visualScale}
                                        y={y + 4 * visualScale}
                                        textAnchor="end"
                                        style={{ fontSize: tickFontSize }}
                                    >
                                        {tick}
                                    </text>
                                </g>
                            );
                        })}

                        <line
                            className={styles.axisLine}
                            x1={PLOT.left}
                            y1={PLOT.top}
                            x2={PLOT.left}
                            y2={PLOT.top + PLOT_HEIGHT}
                        />
                        <line
                            className={styles.axisLine}
                            x1={PLOT.left}
                            y1={PLOT.top + PLOT_HEIGHT}
                            x2={PLOT.left + PLOT_WIDTH}
                            y2={PLOT.top + PLOT_HEIGHT}
                        />

                        {activeCluster ? (
                            <g className={styles.guideLines} aria-hidden="true">
                                <line
                                    x1={PLOT.left}
                                    y1={activeCluster.y}
                                    x2={PLOT.left + PLOT_WIDTH}
                                    y2={activeCluster.y}
                                />
                                <line
                                    x1={activeCluster.x}
                                    y1={PLOT.top}
                                    x2={activeCluster.x}
                                    y2={PLOT.top + PLOT_HEIGHT}
                                />
                            </g>
                        ) : null}

                        <g className={styles.pointsLayer}>
                            {clusters.map((cluster) => {
                                const isGroup = cluster.points.length > 1;
                                const priority = selectedPriorities
                                    .filter(
                                        (selectedPriority) =>
                                            selectedPriority.clusterId ===
                                            cluster.id,
                                    )
                                    .map(
                                        (selectedPriority) =>
                                            selectedPriority.priority,
                                    )
                                    .toSorted((a, b) => a - b)[0];
                                const baseRadius =
                                    (cluster.hasSelected
                                        ? isGroup
                                            ? 8.5
                                            : 6
                                        : isGroup
                                          ? 7.5
                                          : 3) * visualScale;
                                const pointStyle = {
                                    '--point-fill': getPointFill(cluster),
                                    '--priority-delay': `${2000 + Math.max(0, (priority ?? 1) - 1) * 180}ms`,
                                } as PointStyle;
                                const label =
                                    cluster.points.length > 1
                                        ? `${cluster.points.length} grouped queries. ${cluster.hasSelected ? 'Contains a selected recommendation. ' : ''}${
                                              cluster.hasTopTwenty
                                                  ? 'Contains a Top 20 opportunity. '
                                                  : ''
                                          }Ranking Attainability ${scoreFormatter.format(
                                              cluster.rankingAttainability,
                                          )}. Relative Search Demand ${scoreFormatter.format(cluster.relativeSearchDemand)}.`
                                        : `${cluster.points[0].query}. ${cluster.points[0].demandType} Demand. ${formatStatus(
                                              cluster.points[0].status,
                                          )}. Opportunity Score ${scoreFormatter.format(cluster.points[0].opportunityScore)}.`;

                                return (
                                    <g
                                        className={styles.pointGroup}
                                        key={cluster.id}
                                        style={pointStyle}
                                        data-active={
                                            activeClusterId === cluster.id
                                                ? 'true'
                                                : undefined
                                        }
                                        data-selected={
                                            cluster.hasSelected
                                                ? 'true'
                                                : undefined
                                        }
                                    >
                                        {cluster.hasSelected ? (
                                            <>
                                                <circle
                                                    className={
                                                        styles.selectedHalo
                                                    }
                                                    cx={cluster.x}
                                                    cy={cluster.y}
                                                    r={
                                                        baseRadius +
                                                        4 * visualScale
                                                    }
                                                    aria-hidden="true"
                                                />
                                                <circle
                                                    className={
                                                        styles.selectedRing
                                                    }
                                                    cx={cluster.x}
                                                    cy={cluster.y}
                                                    r={
                                                        baseRadius +
                                                        2 * visualScale
                                                    }
                                                    style={{
                                                        strokeWidth:
                                                            0.9 * visualScale,
                                                    }}
                                                    aria-hidden="true"
                                                />
                                            </>
                                        ) : null}
                                        {isGroup ? (
                                            <circle
                                                className={`${styles.point} ${styles.clusterPoint}`}
                                                data-priority={
                                                    cluster.hasSelected
                                                        ? 'selected'
                                                        : cluster.hasTopTwenty
                                                          ? 'top-twenty'
                                                          : 'validated'
                                                }
                                                data-mixed={
                                                    cluster.hasMixedTerritories
                                                        ? 'true'
                                                        : undefined
                                                }
                                                cx={cluster.x}
                                                cy={cluster.y}
                                                r={baseRadius}
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <circle
                                                className={styles.point}
                                                data-priority={
                                                    cluster.hasSelected
                                                        ? 'selected'
                                                        : cluster.hasTopTwenty
                                                          ? 'top-twenty'
                                                          : 'validated'
                                                }
                                                cx={cluster.x}
                                                cy={cluster.y}
                                                r={baseRadius}
                                                aria-hidden="true"
                                            />
                                        )}
                                        {cluster.hasSelected && priority ? (
                                            <text
                                                className={
                                                    styles.priorityNumber
                                                }
                                                x={cluster.x}
                                                y={cluster.y + 3 * visualScale}
                                                textAnchor="middle"
                                                style={{
                                                    fontSize: 8 * visualScale,
                                                }}
                                                aria-hidden="true"
                                            >
                                                {priority}
                                            </text>
                                        ) : isGroup &&
                                          cluster.points.length >= 4 ? (
                                            <text
                                                className={styles.clusterCount}
                                                x={cluster.x}
                                                y={cluster.y + 3 * visualScale}
                                                textAnchor="middle"
                                                style={{
                                                    fontSize: 8 * visualScale,
                                                }}
                                                aria-hidden="true"
                                            >
                                                {cluster.points.length}
                                            </text>
                                        ) : null}
                                        <circle
                                            ref={(element) => {
                                                if (element) {
                                                    markerRefs.current.set(
                                                        cluster.id,
                                                        element,
                                                    );
                                                } else {
                                                    markerRefs.current.delete(
                                                        cluster.id,
                                                    );
                                                }
                                            }}
                                            className={styles.hitPoint}
                                            cx={cluster.x}
                                            cy={cluster.y}
                                            r={Math.max(
                                                baseRadius + 4 * visualScale,
                                                10 * visualScale,
                                            )}
                                            tabIndex={0}
                                            role="button"
                                            aria-label={label}
                                            aria-expanded={
                                                activeClusterId === cluster.id
                                            }
                                            aria-controls={`cluster-details-${cluster.id}`}
                                            onMouseEnter={(event) =>
                                                activateCluster(
                                                    cluster.id,
                                                    event.currentTarget,
                                                )
                                            }
                                            onMouseLeave={() => {
                                                if (!pinnedClusterId) {
                                                    setTransientClusterId(null);
                                                    setActiveAnchorRect(null);
                                                }
                                            }}
                                            onFocus={(event) =>
                                                activateCluster(
                                                    cluster.id,
                                                    event.currentTarget,
                                                )
                                            }
                                            onBlur={() => {
                                                if (!pinnedClusterId) {
                                                    setTransientClusterId(null);
                                                    setActiveAnchorRect(null);
                                                }
                                            }}
                                            onClick={(event) => {
                                                const shouldPin =
                                                    pinnedClusterId !==
                                                    cluster.id;
                                                setPinnedClusterId(
                                                    shouldPin
                                                        ? cluster.id
                                                        : null,
                                                );
                                                setTransientClusterId(
                                                    shouldPin
                                                        ? cluster.id
                                                        : null,
                                                );
                                                setActiveAnchorRect(
                                                    shouldPin
                                                        ? event.currentTarget.getBoundingClientRect()
                                                        : null,
                                                );
                                            }}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Escape') {
                                                    closeDetails();
                                                } else if (
                                                    event.key === 'Enter' ||
                                                    event.key === ' '
                                                ) {
                                                    event.preventDefault();
                                                    const shouldPin =
                                                        pinnedClusterId !==
                                                        cluster.id;
                                                    setPinnedClusterId(
                                                        shouldPin
                                                            ? cluster.id
                                                            : null,
                                                    );
                                                    setTransientClusterId(
                                                        shouldPin
                                                            ? cluster.id
                                                            : null,
                                                    );
                                                    setActiveAnchorRect(
                                                        shouldPin
                                                            ? event.currentTarget.getBoundingClientRect()
                                                            : null,
                                                    );
                                                }
                                            }}
                                        />
                                    </g>
                                );
                            })}
                        </g>
                    </svg>

                    <div className={`${styles.axisTitle} ${styles.xAxisTitle}`}>
                        <strong>Ranking Attainability</strong>
                        <span className={styles.axisHelp}>
                            <MetricTooltip
                                id="ranking-attainability-explanation"
                                label="Ranking Attainability"
                                description={rankingAttainabilityDescription}
                                side="top"
                            />
                        </span>
                    </div>

                    <div className={`${styles.axisTitle} ${styles.yAxisTitle}`}>
                        <span className={styles.verticalAxisText}>
                            Relative Search Demand
                        </span>
                        <span className={styles.axisHelp}>
                            <MetricTooltip
                                id="relative-search-demand-explanation"
                                label="Relative Search Demand"
                                description={relativeDemandDescription}
                                align="start"
                            />
                        </span>
                    </div>
                </div>
            </div>

            {activeCluster && activeAnchorRect ? (
                <ClusterDetails
                    cluster={activeCluster}
                    anchorRect={activeAnchorRect}
                    pinned={pinnedClusterId === activeCluster.id}
                    panelRef={panelRef}
                    onClose={closeDetails}
                />
            ) : null}
            {bandOpen ? (
                <BandExplanation
                    anchorRef={bandRef}
                    tooltipRef={bandTooltipRef}
                />
            ) : null}
        </div>
    );
}
