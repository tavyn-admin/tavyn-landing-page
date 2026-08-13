'use client';

import { useEffect, useRef, useState } from 'react';
import { COLORS, faderMask } from '../tokens';
import StepCaption from '../StepCaption';

/**
 * Target — a mock "SERP Analysis" panel on the left and two "Opportunity" clusters
 * on the right, each showing a pillar page + sub-pages. All native 1440×780.
 *
 * Animations (start once the whole illustration is in view): the loading circles spin,
 * and the SERP result list scrolls upward as a seamless ticker (top fades out, entries
 * recycle to the bottom).
 */
export default function Target() {
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
                {/* Illustration frame — SERP behind, Opportunities layered on top-right.
            Box fade handles the outer edges + SERP's bottom (slightly stronger). */}
                <div
                    style={{
                        position: 'relative',
                        width: 738,
                        height: 353,
                        ...faderMask({
                            left: 12,
                            right: 12,
                            top: 9,
                            bottom: 15,
                        }),
                    }}
                >
                    <SerpAnalysis animate={animate} />
                    <Opportunities animate={animate} />
                </div>
            </div>

            <StepCaption
                title="Target"
                description="Tavyn maps the search landscape around your product, finds the gaps competitors are leaving open, and prioritizes the opportunities your SaaS can realistically win."
            />
        </>
    );
}

/** Spinning loading circle. */
function Spinner({ size = 9.8, animate }: { size?: number; animate: boolean }) {
    return (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
            src="/figma/target-loading.svg"
            alt=""
            style={{
                width: size,
                height: size,
                animation: animate ? 'spin 1.4s linear infinite' : 'none',
                transformOrigin: '50% 50%',
            }}
        />
    );
}

/* ---------- SERP Analysis panel (left) ---------- */

const SERP_RESULTS = [
    {
        logo: '/figma/target-logo-1.svg',
        url: 'nexoria.io',
        title: 'Ad · Grow revenue with AI-powered campaigns built for real ROAS',
        body: 'Reach 900M+ daily app users and convert them. Transform your growth with the most powerful campaign platform in a generation.',
    },
    {
        logo: '/figma/target-logo-2.svg',
        url: 'Signalyze',
        title: 'Topical Authority: What Is It And How Do You Build It?',
        body: 'Learn more about topical authority, what it is, and how you can build it to become an authority in your niche.',
    },
    {
        logo: '/figma/target-logo-3.svg',
        url: 'clarivue.ai',
        title: 'Clarivue: The AI Visibility Platform | Search Ranking Insights',
        body: 'Understand your visibility in ChatGPT, Gemini & Perplexity. See exactly where your brand appears in AI search results.',
    },
    {
        logo: '/figma/target-logo-4.svg',
        url: 'RankForge',
        title: 'Content Clusters for SEO: What They Are & How to Build Them',
        body: 'Audit & improve your site for users and search engines. Get a no-brainer fix-it list now.',
    },
];

function SerpResult({ r }: { r: (typeof SERP_RESULTS)[number] }) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 7.8,
                padding: '0 8.3px',
                marginBottom: 19.5,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={r.logo}
                    alt=""
                    style={{ width: 15.9, height: 15.9 }}
                />
                <span
                    style={{
                        fontWeight: 500,
                        fontSize: 6.7,
                        letterSpacing: '-0.13px',
                        color: '#fff',
                    }}
                >
                    {r.url}
                </span>
            </div>
            <p
                style={{
                    margin: 0,
                    fontWeight: 500,
                    fontSize: 10,
                    lineHeight: 1.12,
                    letterSpacing: '-0.2px',
                    color: '#fff',
                }}
            >
                {r.title}
            </p>
            <p
                style={{
                    margin: 0,
                    fontWeight: 500,
                    fontSize: 5,
                    lineHeight: 1.12,
                    letterSpacing: '-0.1px',
                    color: '#474747',
                }}
            >
                {r.body}
            </p>
        </div>
    );
}

function SerpAnalysis({ animate }: { animate: boolean }) {
    return (
        <div
            style={{
                position: 'absolute',
                left: 0,
                top: 55.7,
                width: 531,
                height: 297,
                background: COLORS.card,
                borderRadius: 14,
                overflow: 'hidden',
                // Cut the panel off where the first Opportunity card begins (design x ≈ 274.77) so
                // it never shows through the cards' bottom fade. Internal layout stays at 531 wide.
                clipPath: 'inset(0 256.23px 0 0)',
                padding: '0 19.5px',
                display: 'flex',
                flexDirection: 'column',
                gap: 4.9,
            }}
        >
            {/* Header pill */}
            <div style={{ paddingTop: 12 }}>
                <div
                    style={{
                        background: '#1a1a1a',
                        borderRadius: 29,
                        padding: '9.8px 19.6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <span
                        style={{
                            fontWeight: 500,
                            fontSize: 7.8,
                            lineHeight: 1.12,
                            letterSpacing: '-0.16px',
                            color: '#fff',
                        }}
                    >
                        Running{' '}
                        <span
                            className="brand-text-gradient"
                            style={{ fontWeight: 500 }}
                        >
                            SERP
                        </span>{' '}
                        Analysis
                    </span>
                    <Spinner animate={animate} />
                </div>
            </div>

            {/* SERP results — seamless upward ticker (top/bottom fade via mask). */}
            <div
                style={{
                    position: 'relative',
                    flex: '1 0 0',
                    minHeight: 0,
                    overflow: 'hidden',
                    maskImage:
                        'linear-gradient(to bottom, transparent 0%, #000 14%, #000 86%, transparent 100%)',
                    WebkitMaskImage:
                        'linear-gradient(to bottom, transparent 0%, #000 14%, #000 86%, transparent 100%)',
                }}
            >
                <div
                    style={{
                        paddingTop: 9.8,
                        display: 'flex',
                        flexDirection: 'column',
                        animation: animate
                            ? 'serp-scroll 13s linear infinite'
                            : 'none',
                    }}
                >
                    {/* Two identical sets so translateY(-50%) loops seamlessly. */}
                    {[...SERP_RESULTS, ...SERP_RESULTS].map((r, i) => (
                        <SerpResult key={i} r={r} />
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ---------- Opportunities cluster (right, overlaid on SERP) ---------- */

const OPPORTUNITY_1 = {
    topic: 'How to do SaaS SEO',
    pillar: 'How to Do SaaS SEO: The Complete Guide',
    subpages: [
        {
            title: 'How to Build a SaaS SEO Strategy Step by Step',
            tag: 'Informational',
        },
        {
            title: 'Best SaaS SEO Tools for Growing Organic Traffic',
            tag: 'Commercial',
        },
        {
            title: 'SaaS SEO Audit Checklist [Free Template]',
            tag: 'Transactional',
        },
        {
            title: 'Short-Tail vs. Long-Tail Keywords: Which Should You Target?',
            tag: 'Comparison',
        },
        {
            title: 'How to Find Low-Competition Keywords in a Crowded SaaS Niche',
            tag: 'Informational',
        },
        {
            title: 'Keyword Intent: How to Match Content to the Buyer Journey',
            tag: 'Informational',
        },
        {
            title: 'Competitor Keyword Analysis: A Step-by-Step Process',
            tag: 'How-To',
        },
        {
            title: 'Keyword Research Mistakes That Are Costing You Traffic',
            tag: 'Informational',
        },
    ],
};

const OPPORTUNITY_2 = {
    topic: 'SaaS SEO Automation',
    pillar: 'SaaS SEO Automation Tools: The Complete Guide',
    subpages: [
        {
            title: 'What Is SEO Automation and What Should SaaS Teams Automate?',
            tag: 'Informational',
        },
        { title: 'Best SaaS SEO Automation Tools Compared', tag: 'Commercial' },
        {
            title: 'SaaS SEO Automation Workflow Template [Free Download]',
            tag: 'Transactional',
        },
        { title: 'Best Technical SEO Tools for SaaS Teams', tag: 'Commercial' },
        {
            title: "Technical SEO vs. On-Page SEO: What's the Difference?",
            tag: 'Definitional',
        },
        {
            title: 'How to Structure URLs for a SaaS Product with Multiple Tiers',
            tag: 'Informational',
        },
        {
            title: 'JavaScript SEO: What SaaS Companies Get Wrong',
            tag: 'Informational',
        },
        {
            title: 'How to Set Up an XML Sitemap for a SaaS Website',
            tag: 'How-To',
        },
    ],
};

function Opportunities({ animate }: { animate: boolean }) {
    return (
        <div
            style={{
                position: 'absolute',
                left: 274.77,
                top: 0,
                width: 463,
                height: 297,
                display: 'flex',
                gap: 9.8,
                // These two cards stop short of the illustration's bottom edge, so the box fade
                // never reaches them — give them their own strong bottom fade.
                ...faderMask({ bottom: 40 }),
            }}
        >
            <OpportunityCard opp={OPPORTUNITY_1} animate={animate} />
            <OpportunityCard opp={OPPORTUNITY_2} animate={animate} />
        </div>
    );
}

function OpportunityCard({
    opp,
    animate,
}: {
    opp: {
        topic: string;
        pillar: string;
        subpages: { title: string; tag: string }[];
    };
    animate: boolean;
}) {
    return (
        <div
            style={{
                flex: '1 0 0',
                minWidth: 0,
                height: '100%',
                background: COLORS.card,
                borderRadius: 29,
                border: '0.5px solid rgba(255,255,255,0.12)',
                padding: '29px 29px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: 15.6,
                overflow: 'hidden',
            }}
        >
            {/* Topic */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5.9 }}>
                <span
                    style={{
                        fontWeight: 400,
                        fontSize: 5.9,
                        letterSpacing: '-0.12px',
                        color: '#fff',
                    }}
                >
                    Topic:
                </span>
                <div
                    style={{ display: 'flex', alignItems: 'center', gap: 9.8 }}
                >
                    <p
                        style={{
                            margin: 0,
                            flex: '1 0 0',
                            fontWeight: 500,
                            fontSize: 9.8,
                            lineHeight: 1.12,
                            letterSpacing: '-0.2px',
                            color: '#fff',
                        }}
                    >
                        {opp.topic}
                    </p>
                    <Spinner animate={animate} />
                </div>
            </div>

            {/* Pillar */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 5.9,
                    padding: '0 3.9px',
                }}
            >
                <span
                    style={{
                        fontWeight: 400,
                        fontSize: 5.9,
                        letterSpacing: '-0.12px',
                        color: '#fff',
                    }}
                >
                    Pillar page:
                </span>
                <p
                    style={{
                        margin: 0,
                        fontWeight: 300,
                        fontSize: 7.8,
                        lineHeight: 1.12,
                        letterSpacing: '-0.16px',
                        color: '#fff',
                    }}
                >
                    {opp.pillar}
                </p>
            </div>

            {/* Sub Pages */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: '1 0 0',
                    minHeight: 0,
                    overflow: 'hidden',
                }}
            >
                <div style={{ padding: '0 3.9px' }}>
                    <span
                        style={{
                            fontWeight: 400,
                            fontSize: 5.9,
                            letterSpacing: '-0.12px',
                            color: '#fff',
                        }}
                    >
                        Sub Pages:
                    </span>
                </div>
                {opp.subpages.map((s, i) => (
                    <div
                        key={i}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 19.5,
                            padding: '10px 7.8px',
                        }}
                    >
                        <p
                            style={{
                                margin: 0,
                                flex: '1 0 0',
                                fontWeight: 300,
                                fontSize: 5.9,
                                lineHeight: 1.12,
                                letterSpacing: '-0.12px',
                                color: '#fff',
                            }}
                        >
                            {s.title}
                        </p>
                        <span
                            style={{
                                background: '#1a1a1a',
                                borderRadius: 12.7,
                                padding: '2.9px 4.9px',
                                fontWeight: 300,
                                fontSize: 4.9,
                                lineHeight: 1.12,
                                letterSpacing: '-0.1px',
                                color: '#fff',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {s.tag}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
