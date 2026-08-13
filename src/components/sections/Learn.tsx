'use client';

import { useEffect, useRef, useState } from 'react';
import { COLORS, faderMask } from '../tokens';
import StepCaption from '../StepCaption';

/** Icon colors used both for the card header icon and its tag dots. */
const CARD_ACCENT = {
    green: '#09310F',
    blue: '#3A3D69',
    red: '#FF5F57',
} as const;

const CARD_W = 284.4;
const GAP = 14.4;
const CONNECTOR_LEFT = 46; // spine x within each card
const CONNECTOR_TOP = 77.73; // spine y within the card group

// Arm-tip y positions (relative to card top) taken directly from the connector SVGs.
// These are where each text item's vertical center must sit.
const ARM_TIPS_3 = [
    CONNECTOR_TOP + 29.27,
    CONNECTOR_TOP + 68.39,
    CONNECTOR_TOP + 104.84,
];
const ARM_TIPS_2 = [CONNECTOR_TOP + 29.27, CONNECTOR_TOP + 67.65];
const ITEM_HALF = (12 * 1.12) / 2; // half the line-box height of a 12px item

/**
 * Learn — three cards (Company Review / Product & Positioning / Goal Setting)
 * with SVG connectors, plus the "Learn" caption. Native 1440×780 layout; scaled by
 * the outer <Section>.
 */
export default function Learn() {
    // Start the connector fill animation only once the whole illustration is in view.
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
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: GAP,
                        ...faderMask({
                            left: 12,
                            right: 12,
                            top: 9,
                            bottom: 40,
                        }),
                    }}
                >
                    <LearnCard
                        iconSrc="/figma/learn-symbol-1.svg"
                        accent={CARD_ACCENT.green}
                        title="Company Review"
                        items={[
                            'Company Identity',
                            'Ideal Customer Profile',
                            'Customer Pain Points',
                        ]}
                        tags={['Business', 'Customer']}
                    />
                    <LearnCard
                        iconSrc="/figma/learn-symbol-2.svg"
                        accent={CARD_ACCENT.blue}
                        title="Product and Positioning"
                        items={[
                            'Product Capabilities',
                            'Product Differentiation',
                            'Brand Identity',
                        ]}
                        tags={['Product', 'Brand']}
                    />
                    <LearnCard
                        iconSrc="/figma/learn-symbol-3.svg"
                        accent={CARD_ACCENT.red}
                        title="Goal Setting"
                        items={['Conversion Context', 'SEO Priorities']}
                        tags={['Conversion', 'SEO']}
                    />

                    {/* Animated gradient connectors — one per card, same x offset inside each card. */}
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                left: i * (CARD_W + GAP) + CONNECTOR_LEFT,
                                top: CONNECTOR_TOP,
                            }}
                        >
                            <Connector
                                id={i}
                                variant={i === 2 ? 'short' : 'full'}
                                animate={animate}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <StepCaption
                title="Learn"
                description="Tavyn learns your product, customers, positioning, competitors, and current search visibility, so every decision starts with tailored to your business and goals."
            />
        </>
    );
}

/* ---------- Animated connector (gray base + gradient fill overlay) ---------- */

const CONN_DURATION = '4.8s'; // slow fill + fade, looped

function Connector({
    id,
    variant,
    animate,
}: {
    id: number;
    variant: 'full' | 'short';
    animate: boolean;
}) {
    const full = variant === 'full';
    const H = full ? 105.096 : 67.911;
    const spineLen = full ? 95.96 : 58.78;
    const ARM = 18.27; // arm length (all arms equal)
    const gradId = `connGrad-${id}`;

    // Each line: [x1,y1,x2,y2, length, keyframe]
    const spine = {
        x1: 0.3,
        y1: 0,
        x2: 0.3,
        y2: spineLen,
        len: spineLen,
        kf: 'conn-spine',
    };
    const arms = full
        ? [
              {
                  x1: 0.15,
                  y1: 20.13,
                  x2: 15.97,
                  y2: 29.27,
                  len: ARM,
                  kf: 'conn-arm-a',
              },
              {
                  x1: 0.15,
                  y1: 59.25,
                  x2: 15.97,
                  y2: 68.39,
                  len: ARM,
                  kf: 'conn-arm-b',
              },
              {
                  x1: 0.15,
                  y1: 95.7,
                  x2: 15.97,
                  y2: 104.84,
                  len: ARM,
                  kf: 'conn-arm-c',
              },
          ]
        : [
              {
                  x1: 0.15,
                  y1: 20.13,
                  x2: 15.97,
                  y2: 29.27,
                  len: ARM,
                  kf: 'conn-arm-d',
              },
              {
                  x1: 0.15,
                  y1: 58.52,
                  x2: 15.97,
                  y2: 67.65,
                  len: ARM,
                  kf: 'conn-arm-c',
              },
          ];
    const lines = [spine, ...arms];

    return (
        <svg
            width={15.82}
            height={full ? 105.1 : 67.91}
            viewBox={`0 0 16.1226 ${H}`}
            style={{ display: 'block', overflow: 'visible' }}
        >
            <defs>
                <linearGradient
                    id={gradId}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2={H}
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0" stopColor="#FF0000" />
                    <stop offset="0.5" stopColor="#FF7400" />
                    <stop offset="1" stopColor="#FFC100" />
                </linearGradient>
            </defs>

            {/* Gray base */}
            <g stroke="#2a2a2a" strokeWidth={0.6} fill="none">
                {lines.map((l, i) => (
                    <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
                ))}
            </g>

            {/* Gradient overlay that draws + fades on loop. Butt caps → no colored blob at the
          leading edge while filling. */}
            <g
                stroke={`url(#${gradId})`}
                strokeWidth={0.9}
                fill="none"
                strokeLinecap="butt"
            >
                {lines.map((l, i) => (
                    <line
                        key={i}
                        x1={l.x1}
                        y1={l.y1}
                        x2={l.x2}
                        y2={l.y2}
                        style={{
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            ['--len' as any]: l.len,
                            strokeDasharray: l.len,
                            strokeDashoffset: l.len,
                            animation: animate
                                ? `${l.kf} ${CONN_DURATION} linear infinite`
                                : 'none',
                        }}
                    />
                ))}
            </g>
        </svg>
    );
}

function LearnCard({
    iconSrc,
    accent,
    title,
    items,
    tags,
}: {
    iconSrc: string;
    accent: string;
    title: string;
    items: string[];
    tags: string[];
}) {
    const tips = items.length === 2 ? ARM_TIPS_2 : ARM_TIPS_3;

    return (
        <div
            style={{
                position: 'relative',
                background: COLORS.card,
                borderRadius: 36,
                width: CARD_W,
                height: 322.2,
            }}
        >
            {/* Header — single line (nowrap), so every card's items start at the same y. */}
            <div
                style={{
                    position: 'absolute',
                    top: 36,
                    left: 36,
                    right: 24,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9.6,
                }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={iconSrc}
                    alt=""
                    style={{ width: 19.2, height: 19.2, flexShrink: 0 }}
                />
                <span
                    style={{
                        fontWeight: 400,
                        fontSize: 18,
                        lineHeight: 1.12,
                        letterSpacing: '-0.36px',
                        color: '#fff',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {title}
                </span>
            </div>

            {/* Items — each absolutely centered on its connector arm tip. */}
            {items.map((it, idx) => (
                <span
                    key={it}
                    style={{
                        position: 'absolute',
                        left: 72,
                        top: tips[idx] - ITEM_HALF,
                        fontWeight: 400,
                        fontSize: 12,
                        lineHeight: 1.12,
                        letterSpacing: '-0.24px',
                        color: COLORS.textMuted,
                        whiteSpace: 'nowrap',
                    }}
                >
                    {it}
                </span>
            ))}

            {/* Tags pinned to the card bottom. */}
            <div
                style={{
                    position: 'absolute',
                    left: 36,
                    bottom: 36,
                    display: 'flex',
                    gap: 18,
                }}
            >
                {tags.map((tag) => (
                    <TagPill key={tag} label={tag} dotColor={accent} />
                ))}
            </div>
        </div>
    );
}

function TagPill({ label, dotColor }: { label: string; dotColor: string }) {
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5.4,
                padding: '5.4px 10.8px',
                borderRadius: 3.6,
                background: '#111',
            }}
        >
            <span
                style={{
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    background: dotColor,
                    flexShrink: 0,
                }}
            />
            <span
                style={{
                    fontWeight: 300,
                    fontSize: 9,
                    lineHeight: 1.12,
                    letterSpacing: '-0.18px',
                    color: '#fff',
                }}
            >
                {label}
            </span>
        </span>
    );
}
