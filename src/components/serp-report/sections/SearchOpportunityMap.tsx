"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { SearchOpportunityPoint } from "@/lib/serp-report/schema";
import styles from "./SearchOpportunityMap.module.css";

const VIEWBOX_WIDTH = 560;
const VIEWBOX_HEIGHT = 378;
const PLOT = {
  left: 48,
  right: 18,
  top: 50,
  bottom: 42,
};
const PLOT_WIDTH = VIEWBOX_WIDTH - PLOT.left - PLOT.right;
const PLOT_HEIGHT = VIEWBOX_HEIGHT - PLOT.top - PLOT.bottom;
const POINT_RADIUS = 3;
const POINT_COLLISION_PADDING = 10;
const LABEL_HEIGHT = 18;
const LABEL_PADDING = 8;
const LEGEND_BOTTOM = 35;
const xTicks = [0, 20, 40, 60, 80, 100];
const yTickCandidates = [0, 10, 100, 1000, 10000, 100000];

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const scoreFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

type SearchOpportunityMapProps = {
  points: SearchOpportunityPoint[];
  medianKeywordDifficulty: number;
  medianMonthlySearchVolume: number;
  totalQueries: number;
};

type PlottedPoint = SearchOpportunityPoint & {
  x: number;
  y: number;
};

type LabelPlacement = {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatDisplayLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function formatCompactVolume(value: number) {
  if (value >= 1000) {
    return `${numberFormatter.format(value / 1000)}K`;
  }

  return numberFormatter.format(value);
}

function formatStatus(status: SearchOpportunityPoint["status"]) {
  if (status === "selected") {
    return "Selected for content";
  }

  if (status === "scored") {
    return "Top 20 opportunity";
  }

  return "Validated query";
}

function getLogVolume(value: number) {
  return Math.log10(value + 1);
}

function getLabelWidth(label: string) {
  return Math.max(88, Math.min(132, label.length * 5.7 + 12));
}

function rectCollidesWithPoint(rect: LabelPlacement, point: PlottedPoint) {
  const padding = POINT_RADIUS + POINT_COLLISION_PADDING;

  return (
    point.x >= rect.x - padding &&
    point.x <= rect.x + rect.width + padding &&
    point.y >= rect.y - padding &&
    point.y <= rect.y + rect.height + padding
  );
}

function scoreLabelCandidate(candidate: LabelPlacement, plottedPoints: PlottedPoint[]) {
  return plottedPoints.reduce((collisions, point) => collisions + (rectCollidesWithPoint(candidate, point) ? 1 : 0), 0);
}

function fitLabelCandidate(candidate: LabelPlacement, bounds: { minX: number; maxX: number; minY: number; maxY: number }) {
  return {
    ...candidate,
    x: clamp(candidate.x, bounds.minX, Math.max(bounds.minX, bounds.maxX - candidate.width)),
    y: clamp(candidate.y, bounds.minY, Math.max(bounds.minY, bounds.maxY - candidate.height)),
  };
}

function chooseLabelPlacement(
  label: string,
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
  candidates: Array<{ x: number; y: number }>,
  plottedPoints: PlottedPoint[]
) {
  const width = getLabelWidth(label);
  const scored = candidates.map((candidate) => {
    const placement = fitLabelCandidate(
      {
        label,
        x: candidate.x,
        y: candidate.y,
        width,
        height: LABEL_HEIGHT,
      },
      bounds
    );

    return {
      placement,
      score: scoreLabelCandidate(placement, plottedPoints),
    };
  });

  return [...scored].sort((a, b) => a.score - b.score)[0].placement;
}

function buildQuadrantLabels({
  plottedPoints,
  medianX,
  medianY,
}: {
  plottedPoints: PlottedPoint[];
  medianX: number;
  medianY: number;
}) {
  const leftBounds = {
    minX: PLOT.left + LABEL_PADDING,
    maxX: Math.max(PLOT.left + LABEL_PADDING + 92, medianX - LABEL_PADDING),
  };
  const rightBounds = {
    minX: Math.min(PLOT.left + PLOT_WIDTH - LABEL_PADDING - 92, medianX + LABEL_PADDING),
    maxX: PLOT.left + PLOT_WIDTH - LABEL_PADDING,
  };
  const upperBounds = {
    minY: Math.max(PLOT.top + LABEL_PADDING, LEGEND_BOTTOM + LABEL_PADDING),
    maxY: Math.max(PLOT.top + LABEL_PADDING + LABEL_HEIGHT, medianY - LABEL_PADDING),
  };
  const lowerBounds = {
    minY: Math.min(PLOT.top + PLOT_HEIGHT - LABEL_PADDING - LABEL_HEIGHT, medianY + LABEL_PADDING),
    maxY: PLOT.top + PLOT_HEIGHT - LABEL_PADDING,
  };
  const quadrants = {
    upperLeft: { ...leftBounds, ...upperBounds },
    upperRight: { ...rightBounds, ...upperBounds },
    lowerLeft: { ...leftBounds, ...lowerBounds },
    lowerRight: { ...rightBounds, ...lowerBounds },
  };

  return [
    chooseLabelPlacement(
      "Strong opportunities",
      quadrants.upperLeft,
      [
        { x: quadrants.upperLeft.minX, y: quadrants.upperLeft.minY },
        { x: (quadrants.upperLeft.minX + quadrants.upperLeft.maxX) / 2 - 54, y: quadrants.upperLeft.minY },
        { x: quadrants.upperLeft.minX, y: (quadrants.upperLeft.minY + quadrants.upperLeft.maxY) / 2 - 9 },
        { x: quadrants.upperLeft.maxX - 118, y: quadrants.upperLeft.maxY - LABEL_HEIGHT },
        { x: quadrants.upperLeft.minX, y: quadrants.upperLeft.maxY - LABEL_HEIGHT },
      ],
      plottedPoints
    ),
    chooseLabelPlacement(
      "Competitive demand",
      quadrants.upperRight,
      [
        { x: quadrants.upperRight.maxX - 118, y: quadrants.upperRight.minY },
        { x: (quadrants.upperRight.minX + quadrants.upperRight.maxX) / 2 - 54, y: quadrants.upperRight.minY },
        { x: quadrants.upperRight.maxX - 118, y: (quadrants.upperRight.minY + quadrants.upperRight.maxY) / 2 - 9 },
        { x: quadrants.upperRight.minX, y: quadrants.upperRight.maxY - LABEL_HEIGHT },
        { x: quadrants.upperRight.maxX - 118, y: quadrants.upperRight.maxY - LABEL_HEIGHT },
      ],
      plottedPoints
    ),
    chooseLabelPlacement(
      "Niche opportunities",
      quadrants.lowerLeft,
      [
        { x: quadrants.lowerLeft.minX, y: (quadrants.lowerLeft.minY + quadrants.lowerLeft.maxY) / 2 - 9 },
        { x: quadrants.lowerLeft.minX, y: quadrants.lowerLeft.maxY - LABEL_HEIGHT },
        { x: (quadrants.lowerLeft.minX + quadrants.lowerLeft.maxX) / 2 - 54, y: quadrants.lowerLeft.maxY - LABEL_HEIGHT },
        { x: quadrants.lowerLeft.maxX - 118, y: quadrants.lowerLeft.minY },
        { x: quadrants.lowerLeft.minX, y: quadrants.lowerLeft.minY },
      ],
      plottedPoints
    ),
    chooseLabelPlacement(
      "Lower priority",
      quadrants.lowerRight,
      [
        { x: quadrants.lowerRight.maxX - 100, y: (quadrants.lowerRight.minY + quadrants.lowerRight.maxY) / 2 - 9 },
        { x: quadrants.lowerRight.maxX - 100, y: quadrants.lowerRight.maxY - LABEL_HEIGHT },
        { x: (quadrants.lowerRight.minX + quadrants.lowerRight.maxX) / 2 - 48, y: quadrants.lowerRight.maxY - LABEL_HEIGHT },
        { x: quadrants.lowerRight.minX, y: quadrants.lowerRight.minY },
        { x: quadrants.lowerRight.maxX - 100, y: quadrants.lowerRight.minY },
      ],
      plottedPoints
    ),
  ];
}

function getStatusLine(point: SearchOpportunityPoint) {
  const parts = [formatStatus(point.status)];

  if (point.recommendationRank !== null) {
    parts.push(`#${numberFormatter.format(point.recommendationRank)}`);
  }

  if (point.opportunityScore !== null) {
    parts.push(`Score ${scoreFormatter.format(point.opportunityScore)}`);
  }

  return parts.join(" · ");
}

function getQuadrantLabel(
  point: SearchOpportunityPoint,
  medianKeywordDifficulty: number,
  medianMonthlySearchVolume: number
) {
  const isHigherVolume = point.searchVolume >= medianMonthlySearchVolume;
  const isLowerDifficulty = point.keywordDifficulty <= medianKeywordDifficulty;

  if (isHigherVolume && isLowerDifficulty) {
    return "Strong opportunities";
  }

  if (isHigherVolume) {
    return "Competitive demand";
  }

  if (isLowerDifficulty) {
    return "Niche opportunities";
  }

  return "Lower priority";
}

function PointTooltip({ point, anchorRect }: { point: SearchOpportunityPoint; anchorRect: DOMRect }) {
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState({ left: -9999, top: -9999 });

  const updatePosition = useCallback(() => {
    const tooltip = tooltipRef.current;

    if (!tooltip) {
      return;
    }

    const gutter = 8;
    const gap = 10;
    const { width, height } = tooltip.getBoundingClientRect();
    let left = anchorRect.right + gap;
    let top = anchorRect.top - height - gap;

    if (top < gutter) {
      top = anchorRect.bottom + gap;
    }

    if (left + width > window.innerWidth - gutter) {
      left = anchorRect.left - width - gap;
    }

    setPosition({
      left: clamp(left, gutter, Math.max(gutter, window.innerWidth - width - gutter)),
      top: clamp(top, gutter, Math.max(gutter, window.innerHeight - height - gutter)),
    });
  }, [anchorRect]);

  useLayoutEffect(() => {
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [updatePosition]);

  return createPortal(
    <div ref={tooltipRef} className={styles.tooltip} style={position}>
      <strong>{point.query}</strong>
      <p>{`${point.demandType} · ${formatDisplayLabel(point.searchIntent)}`}</p>
      <p>{`Volume: ${numberFormatter.format(point.searchVolume)} · Difficulty: ${scoreFormatter.format(
        point.keywordDifficulty
      )}`}</p>
      <p>{getStatusLine(point)}</p>
    </div>,
    document.body
  );
}

export default function SearchOpportunityMap({
  points,
  medianKeywordDifficulty,
  medianMonthlySearchVolume,
  totalQueries,
}: SearchOpportunityMapProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const [activePointId, setActivePointId] = useState<string | null>(null);
  const [activeAnchorRect, setActiveAnchorRect] = useState<DOMRect | null>(null);
  const pointRefs = useRef(new Map<string, SVGCircleElement>());
  const { plottedPoints, yTicks, maxLogVolume, medianX, medianY, hasScoredPoints, quadrantLabels } = useMemo(() => {
    const maxSearchVolume = Math.max(1, medianMonthlySearchVolume, ...points.map((point) => point.searchVolume));
    const nextMaxLogVolume = getLogVolume(maxSearchVolume);
    const nextPlottedPoints = points.map((point) => ({
      ...point,
      x: PLOT.left + (clamp(point.keywordDifficulty, 0, 100) / 100) * PLOT_WIDTH,
      y: PLOT.top + (1 - getLogVolume(point.searchVolume) / nextMaxLogVolume) * PLOT_HEIGHT,
    }));
    const nextMedianX = PLOT.left + (clamp(medianKeywordDifficulty, 0, 100) / 100) * PLOT_WIDTH;
    const nextMedianY =
      PLOT.top + (1 - getLogVolume(Math.max(0, medianMonthlySearchVolume)) / nextMaxLogVolume) * PLOT_HEIGHT;

    return {
      plottedPoints: nextPlottedPoints,
      yTicks: yTickCandidates.filter((tick) => tick <= maxSearchVolume),
      maxLogVolume: nextMaxLogVolume,
      medianX: nextMedianX,
      medianY: nextMedianY,
      hasScoredPoints: nextPlottedPoints.some((point) => point.status === "scored"),
      quadrantLabels: buildQuadrantLabels({
        plottedPoints: nextPlottedPoints,
        medianX: nextMedianX,
        medianY: nextMedianY,
      }),
    };
  }, [medianKeywordDifficulty, medianMonthlySearchVolume, points]);
  const activePoint = plottedPoints.find((point) => point.queryId === activePointId) ?? null;
  const pointGroups = {
    validated: plottedPoints.filter((point) => point.status === "validated"),
    scored: plottedPoints.filter((point) => point.status === "scored"),
    selected: plottedPoints.filter((point) => point.status === "selected"),
  };

  const setPointRef = useCallback((queryId: string, element: SVGCircleElement | null) => {
    if (element) {
      pointRefs.current.set(queryId, element);
    } else {
      pointRefs.current.delete(queryId);
    }
  }, []);

  const activatePoint = useCallback((queryId: string, element: SVGCircleElement) => {
    setActivePointId(queryId);
    setActiveAnchorRect(element.getBoundingClientRect());
  }, []);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!activePointId) {
      return;
    }

    const updateAnchor = () => {
      const element = pointRefs.current.get(activePointId);

      if (element) {
        setActiveAnchorRect(element.getBoundingClientRect());
      }
    };

    window.addEventListener("resize", updateAnchor);
    window.addEventListener("scroll", updateAnchor, true);

    return () => {
      window.removeEventListener("resize", updateAnchor);
      window.removeEventListener("scroll", updateAnchor, true);
    };
  }, [activePointId]);

  if (!hasMounted) {
    return <div className={styles.root} aria-hidden="true" />;
  }

  return (
    <div className={styles.root}>
      <p id="search-opportunity-map-description" className={styles.srOnly}>
        Search Opportunity Map plotting keyword difficulty from zero to one hundred on the horizontal axis and monthly
        search volume on a logarithmic vertical axis. Quadrants are divided using this report's median keyword difficulty
        and median monthly search volume.
      </p>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        role="img"
        aria-labelledby="search-opportunity-map-title search-opportunity-map-description"
      >
        <title id="search-opportunity-map-title">Search Opportunity Map</title>
        <defs>
          <linearGradient id="selected-opportunity-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff1f1f" />
            <stop offset="100%" stopColor="#ffc100" />
          </linearGradient>
        </defs>

        <rect className={styles.plotBackground} x={PLOT.left} y={PLOT.top} width={PLOT_WIDTH} height={PLOT_HEIGHT} />

        {xTicks.map((tick) => {
          const x = PLOT.left + (tick / 100) * PLOT_WIDTH;

          return (
            <g key={tick}>
              <line className={styles.gridLine} x1={x} y1={PLOT.top} x2={x} y2={PLOT.top + PLOT_HEIGHT} />
              <text className={styles.tickLabel} x={x} y={PLOT.top + PLOT_HEIGHT + 18} textAnchor="middle">
                {tick}
              </text>
            </g>
          );
        })}

        {yTicks.map((tick) => {
          const y = PLOT.top + (1 - getLogVolume(tick) / maxLogVolume) * PLOT_HEIGHT;

          return (
            <g key={tick}>
              <line className={styles.gridLine} x1={PLOT.left} y1={y} x2={PLOT.left + PLOT_WIDTH} y2={y} />
              <text className={styles.tickLabel} x={PLOT.left - 12} y={y + 4} textAnchor="end">
                {formatCompactVolume(tick)}
              </text>
            </g>
          );
        })}

        <line className={styles.axisLine} x1={PLOT.left} y1={PLOT.top} x2={PLOT.left} y2={PLOT.top + PLOT_HEIGHT} />
        <line
          className={styles.axisLine}
          x1={PLOT.left}
          y1={PLOT.top + PLOT_HEIGHT}
          x2={PLOT.left + PLOT_WIDTH}
          y2={PLOT.top + PLOT_HEIGHT}
        />
        <line className={styles.medianLine} x1={medianX} y1={PLOT.top} x2={medianX} y2={PLOT.top + PLOT_HEIGHT} />
        <line className={styles.medianLine} x1={PLOT.left} y1={medianY} x2={PLOT.left + PLOT_WIDTH} y2={medianY} />

        {quadrantLabels.map((label) => (
          <foreignObject
            className={styles.quadrantObject}
            key={label.label}
            x={label.x}
            y={label.y}
            width={label.width}
            height={label.height}
          >
            <div className={styles.quadrantLabel}>{label.label}</div>
          </foreignObject>
        ))}

        {(["validated", "scored", "selected"] as const).map((status) => (
          <g key={status}>
            {pointGroups[status].map((point) => (
              <circle
                key={point.queryId}
                ref={(element) => setPointRef(point.queryId, element)}
                className={`${styles.point} ${styles[status]}`}
                cx={point.x}
                cy={point.y}
                r={POINT_RADIUS}
                tabIndex={0}
                role="img"
                aria-label={`${point.query}. ${formatStatus(point.status)}. ${point.demandType} demand. ${formatDisplayLabel(
                  point.searchIntent
                )} intent. ${numberFormatter.format(point.searchVolume)} monthly searches. Keyword difficulty ${scoreFormatter.format(
                  point.keywordDifficulty
                )}. ${getQuadrantLabel(point, medianKeywordDifficulty, medianMonthlySearchVolume)} quadrant.`}
                onMouseEnter={(event) => activatePoint(point.queryId, event.currentTarget)}
                onMouseLeave={() => {
                  setActivePointId(null);
                  setActiveAnchorRect(null);
                }}
                onFocus={(event) => activatePoint(point.queryId, event.currentTarget)}
                onBlur={() => {
                  setActivePointId(null);
                  setActiveAnchorRect(null);
                }}
              />
            ))}
          </g>
        ))}

        <text className={styles.xAxisLabel} x={PLOT.left + PLOT_WIDTH / 2} y={PLOT.top + PLOT_HEIGHT + 39} textAnchor="middle">
          Keyword Difficulty
        </text>
        <text
          className={styles.yAxisLabel}
          x={14}
          y={PLOT.top + PLOT_HEIGHT / 2}
          textAnchor="middle"
          transform={`rotate(-90 14 ${PLOT.top + PLOT_HEIGHT / 2})`}
        >
          Monthly Search Volume
        </text>
      </svg>

      <div className={styles.legend} aria-label="Opportunity map legend">
        <span>
          <span className={`${styles.legendDot} ${styles.validated}`} />
          Validated query
        </span>
        {hasScoredPoints ? (
          <span>
            <span className={`${styles.legendDot} ${styles.scored}`} />
            Top 20 opportunity
          </span>
        ) : null}
        <span>
          <span className={`${styles.legendDot} ${styles.selected}`} />
          Selected for content
        </span>
      </div>

      {activePoint && activeAnchorRect ? <PointTooltip point={activePoint} anchorRect={activeAnchorRect} /> : null}
    </div>
  );
}
