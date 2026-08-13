'use client';

import { useEffect, useRef, useState } from 'react';
import { COLORS, faderMask } from '../tokens';
import StepCaption from '../StepCaption';

/**
 * Plan — a mock content calendar with date columns and three blog cards representing
 * upcoming posts. Each blog card has stats bars (relevance / business fit / etc).
 *
 * The connectors draw from each blog up to its date dot (loop: draw → hold → fade),
 * starting once the whole illustration is in view. z-ordering: each connector paints over
 * its OWN blog (so the line meets the highlight dot on top), but connector-2 stays under
 * blog 3 so it doesn't cross that card's title.
 */
export default function Plan() {
    const illoRef = useRef<HTMLDivElement>(null);
    const [animate, setAnimate] = useState(false);
    useEffect(() => {
        const el = illoRef.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([e]) => setAnimate(e.isIntersecting && e.intersectionRatio > 0.85),
            { threshold: [0, 0.85, 1] },
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <>
            <div
                ref={illoRef}
                style={{
                    position: 'absolute',
                    top: 155,
                    bottom: 155,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <div
                    style={{
                        width: 876.3,
                        height: 353,
                        background: COLORS.card,
                        borderRadius: 16.8,
                        overflow: 'hidden',
                        position: 'relative',
                        ...faderMask({
                            left: 12,
                            right: 12,
                            top: 9,
                            bottom: 26,
                        }),
                    }}
                >
                    {/* Vertical grid lines (background) */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/figma/plan-bg-lines.svg"
                        alt=""
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                        }}
                    />

                    {/* Blog cards. blog 3 gets a high z so connector-2 can pass under it. */}
                    <BlogCard
                        left={104.5}
                        top={73}
                        title="How to Do SaaS SEO: The Complete Guide"
                        expanded
                        z={2}
                    />
                    <BlogCard
                        left={383}
                        top={186}
                        title="Best SaaS SEO Tools for Growing Organic Traffic"
                        z={2}
                    />
                    <BlogCard
                        left={522.3}
                        top={73}
                        title="SaaS SEO Audit Checklist [Free Template]"
                        z={5}
                    />

                    {/* Connectors (top-right corner meets the date dot at design y ≈ 39). */}
                    {/* conn-1 → blog 1 (over it) */}
                    <div
                        style={{
                            position: 'absolute',
                            left: 287.8,
                            top: 39,
                            zIndex: 3,
                        }}
                    >
                        <PlanConnector variant="short" animate={animate} />
                    </div>
                    {/* conn-2 → blog 2 (over blog 2 @z2, under blog 3 @z5) */}
                    <div
                        style={{
                            position: 'absolute',
                            left: 566.4,
                            top: 39,
                            zIndex: 3,
                        }}
                    >
                        <PlanConnector variant="tall" animate={animate} />
                    </div>
                    {/* conn-3 → blog 3 (over it) */}
                    <div
                        style={{
                            position: 'absolute',
                            left: 705.7,
                            top: 39,
                            zIndex: 6,
                        }}
                    >
                        <PlanConnector variant="short" animate={animate} />
                    </div>

                    {/* Date row on top so its dots stay visible above the lines. */}
                    <DateRow />
                </div>
            </div>

            <StepCaption
                title="Plan"
                description="Tavyn turns the best search opportunities into a structured content plan, connecting pillar pages with supporting articles and scheduling what to publish next."
            />
        </>
    );
}

/* ---------- Animated connector: draws blog → date dot, holds, fades, loops ---------- */

const PLAN_CONN_DURATION = '5s';

function PlanConnector({
    variant,
    animate,
}: {
    variant: 'short' | 'tall';
    animate: boolean;
}) {
    const tall = variant === 'tall';
    const W = 60.9346;
    // Extend the blog end of the path down to the highlight dot (short +19.5, tall +16.3
    // design-px) so the line actually starts AT the dot with no gap. The date end (top) is
    // unchanged.
    const H = tall ? 175.3 : 61.3;
    const d = tall
        ? 'M0.290166 175.3V97.8629C1.57024 69.8277 3.69312 59.004 13.0575 59.1296H47.297C55.9515 55.2674 59.1152 43.6703 60.6446 0.0101586'
        : 'M0.290166 61.3V25.7515C1.57024 18.3846 3.69312 15.5404 13.0575 15.5734H47.297C55.9515 14.5585 59.1152 11.5111 60.6446 0.0383434';
    const gradId = `planGrad-${tall ? 't' : 's'}`;

    return (
        <svg
            width={60.4}
            height={H}
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            style={{ display: 'block', overflow: 'visible' }}
        >
            <defs>
                <linearGradient
                    id={gradId}
                    x1="38.6"
                    y1={tall ? -20 : -5}
                    x2="0.29"
                    y2={H * 1.04}
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0" stopColor="#FFBE00" />
                    <stop offset="1" stopColor="#FF1E00" />
                </linearGradient>
            </defs>
            <path
                d={d}
                pathLength={1}
                fill="none"
                stroke={`url(#${gradId})`}
                strokeWidth={0.58}
                style={{
                    strokeDasharray: 1,
                    strokeDashoffset: 1,
                    animation: animate
                        ? `plan-draw ${PLAN_CONN_DURATION} linear infinite`
                        : 'none',
                }}
            />
        </svg>
    );
}

function DateRow() {
    const dates = [
        'SEP 1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
        '12',
        '29',
    ];
    const highlighted = new Set([4, 8, 10]);

    return (
        <div
            style={{
                position: 'absolute',
                left: 0,
                top: 0,
                display: 'flex',
                alignItems: 'flex-start',
                paddingLeft: 34.8,
                paddingTop: 17.4,
                zIndex: 7, // above the connectors so the date dots stay visible
            }}
        >
            {dates.map((d, i) => (
                <div
                    key={i}
                    style={{
                        width: 69.6,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 5.8,
                        // Toned down from #323232 → a much subtler line (fixes "brighter" divider).
                        borderLeft: '1px solid rgba(255,255,255,0.03)',
                        padding: '0 0 6px',
                        minHeight: 30,
                    }}
                >
                    <span
                        style={{
                            fontWeight: d === 'SEP 1' ? 600 : 300,
                            fontSize: 11.6,
                            lineHeight: 1.12,
                            letterSpacing: '-0.23px',
                            color: '#474747',
                        }}
                    >
                        {d}
                    </span>
                    {highlighted.has(i) && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src="/figma/plan-highlight.svg"
                            alt=""
                            style={{ width: 4.6, height: 4.6 }}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}

function BlogCard({
    left,
    top,
    title,
    expanded = false,
    z = 2,
}: {
    left: number;
    top: number;
    title: string;
    expanded?: boolean;
    z?: number;
}) {
    return (
        <div
            style={{
                position: 'absolute',
                left,
                top,
                width: 209,
                background: '#0b0b0b',
                borderRadius: 23,
                boxShadow: '4.6px 4.6px 4.6px 0 rgba(0,0,0,0.5)',
                padding: 23,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                zIndex: z,
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <span
                        style={{
                            fontWeight: 400,
                            fontSize: 7,
                            letterSpacing: '-0.14px',
                            color: '#5b5b5b',
                        }}
                    >
                        Blog:
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/figma/plan-highlight.svg"
                        alt=""
                        style={{ width: 4.6, height: 4.6 }}
                    />
                </div>
                <p
                    style={{
                        margin: 0,
                        fontWeight: 400,
                        fontSize: 9.3,
                        lineHeight: 1.12,
                        letterSpacing: '-0.19px',
                        color: '#fff',
                    }}
                >
                    {title}
                </p>
                {!expanded && (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingTop: 4,
                        }}
                    >
                        <StatIndicator value="95" />
                        <span style={{ color: '#5b5b5b', fontSize: 7 }}>▾</span>
                    </div>
                )}
            </div>

            {expanded && (
                <>
                    <StatRow
                        label="Average Domain Authority:"
                        value="Medium"
                        indicator="62"
                    />
                    <StatRow
                        label="Estimated Monthly Traffic"
                        value="High"
                        indicator="3.9k"
                    />
                    <TrackRow label="Relevance:" highlight="High" />
                    <TrackRow label="Business Fit:" highlight="High" />
                    <TrackRow label="Content Type Fit:" highlight="High" />
                </>
            )}
        </div>
    );
}

function StatRow({
    label,
    value,
    indicator,
}: {
    label: string;
    value: string;
    indicator: string;
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <span
                style={{
                    fontWeight: 400,
                    fontSize: 7,
                    letterSpacing: '-0.14px',
                    color: '#5b5b5b',
                }}
            >
                {label}
            </span>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 11.6px',
                }}
            >
                <span
                    style={{
                        fontWeight: 300,
                        fontSize: 8,
                        lineHeight: 1.12,
                        letterSpacing: '-0.16px',
                        color: '#fff',
                    }}
                >
                    {value}
                </span>
                <StatIndicator value={indicator} />
            </div>
        </div>
    );
}

function StatIndicator({ value }: { value: string }) {
    return (
        <span
            style={{
                background: '#09310f',
                borderRadius: 11.6,
                padding: '1.2px 11.6px',
                fontWeight: 400,
                fontSize: 5.8,
                lineHeight: 1.12,
                letterSpacing: '-0.12px',
                color: '#fff',
            }}
        >
            {value}
        </span>
    );
}

function TrackRow({
    label,
    highlight,
}: {
    label: string;
    highlight: 'Low' | 'Medium' | 'High';
}) {
    const track: ('Low' | 'Medium' | 'High')[] = ['Low', 'Medium', 'High'];
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <span
                style={{
                    fontWeight: 400,
                    fontSize: 7,
                    letterSpacing: '-0.14px',
                    color: '#5b5b5b',
                }}
            >
                {label}
            </span>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 11.6px',
                }}
            >
                {track.map((t, i) => (
                    <span
                        key={t}
                        style={{
                            fontWeight: 300,
                            fontSize: 5.8,
                            lineHeight: 1.12,
                            letterSpacing: '-0.12px',
                            color: t === highlight ? 'transparent' : '#fff',
                            ...(t === highlight
                                ? {
                                      background:
                                          'linear-gradient(to right, red, #ffc100)',
                                      WebkitBackgroundClip: 'text',
                                      backgroundClip: 'text',
                                  }
                                : {}),
                            flexShrink: 0,
                        }}
                    >
                        {t}
                        {i < 2 && (
                            <span style={{ margin: '0 4px', color: '#323232' }}>
                                {' '}
                                |{' '}
                            </span>
                        )}
                    </span>
                ))}
            </div>
        </div>
    );
}
