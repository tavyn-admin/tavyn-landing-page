'use client';

import { useEffect, useRef, useState } from 'react';
import { COLORS, faderMask } from '../tokens';

/**
 * Execution Gap — the section right after the 5 steps. Has its own header text
 * ("Close the execution gap. Only step in when needed.") plus three feature cards:
 *   - Built to Convert (chart illustration)
 *   - Email Native (inbox mockup)
 *   - GitHub Publishing (GitHub icon + blog card)
 * The sticky "One agent…" header does NOT show on this page — the sticky releases here.
 *
 * Animations start once the feature frame is fully in view: the "Built to Convert" chart
 * draws its upward arrow, and the GitHub blog-highlight dot switches on and off.
 */
export default function ExecutionGap() {
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
            {/* Own header block (in place of the "One agent…" sticky) */}
            <div
                style={{
                    position: 'absolute',
                    left: 150,
                    right: 150,
                    top: 97,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 125,
                }}
            >
                <div
                    style={{
                        fontWeight: 500,
                        fontSize: 40,
                        lineHeight: 1.12,
                        letterSpacing: '-0.8px',
                        color: COLORS.text,
                    }}
                >
                    <div>
                        Close the{' '}
                        <span className="brand-text-gradient">
                            execution gap.
                        </span>
                    </div>
                    <div>Only step in when needed.</div>
                </div>
            </div>

            {/* Three feature cards */}
            <div
                ref={illoRef}
                style={{
                    position: 'absolute',
                    left: 150,
                    right: 150,
                    top: 260,
                    bottom: 50,
                    display: 'flex',
                    gap: 20,
                    justifyContent: 'center',
                    alignItems: 'stretch',
                }}
            >
                <FeatureCard
                    illustration={<ChartIllustration animate={animate} />}
                    title="Built to Convert"
                    body="Every article is shaped around search intent, funnel, and your product, giving traffic a path toward signup."
                />
                <FeatureCard
                    illustration={<InboxIllustration />}
                    title="Email Native"
                    body="Approve plans, answer focused questions, and revise drafts from your inbox. No new workflow to manage."
                />
                <FeatureCard
                    illustration={<GithubIllustration animate={animate} />}
                    title="GitHub Publishing"
                    body="Tavyn operates inside your GitHub, allowing for seamless integration of blog posts."
                />
            </div>
        </>
    );
}

function FeatureCard({
    illustration,
    title,
    body,
}: {
    illustration: React.ReactNode;
    title: string;
    body: string;
}) {
    return (
        <div
            style={{
                flex: '1 0 0',
                maxWidth: 367,
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                borderRadius: 14.5,
                padding: '20px 25px 40px',
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    flex: '1 0 0',
                    minHeight: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                }}
            >
                {illustration}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p
                    style={{
                        margin: 0,
                        fontWeight: 600,
                        fontSize: 18,
                        lineHeight: 1.28,
                        letterSpacing: '-0.18px',
                        color: COLORS.text,
                    }}
                >
                    {title}
                </p>
                <p
                    style={{
                        margin: 0,
                        fontWeight: 400,
                        fontSize: 12,
                        lineHeight: 1.6,
                        letterSpacing: '-0.06px',
                        color: COLORS.textMuted,
                    }}
                >
                    {body}
                </p>
            </div>
        </div>
    );
}

/* ---------- Illustrations (simplified CSS versions) ---------- */

function ChartIllustration({ animate }: { animate: boolean }) {
    // Chart SVG (grid + axes) as a static background; the upward trend arrow is overlaid as
    // an inline SVG so it can "draw" via stroke-dashoffset once the frame is in view. The
    // arrow (Vector 1 = trend line, Vector 2 = arrowhead) was removed from exec-chart.svg.
    return (
        <div
            style={{
                position: 'relative',
                width: 296,
                height: 297,
                ...faderMask({ left: 12, right: 12, top: 9, bottom: 24 }),
            }}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src="/figma/exec-chart.svg"
                alt=""
                style={{ width: 296, height: 297, display: 'block' }}
            />
            <svg
                width={296}
                height={297}
                viewBox="0 0 297 298"
                fill="none"
                style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
            >
                <defs>
                    <linearGradient
                        id="execArrowGrad"
                        x1="155.106"
                        y1="39.6875"
                        x2="23.6191"
                        y2="140.224"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop stopColor="#FFBE00" />
                        <stop
                            offset="1"
                            stopColor="#FF1E00"
                            stopOpacity="0.1"
                        />
                    </linearGradient>
                </defs>
                {/* Trend line — draws first (0 → 1.1s). */}
                <path
                    d="M61.5 236L119 207L177.5 149L209 61.5"
                    pathLength={1}
                    stroke="url(#execArrowGrad)"
                    strokeWidth={2}
                    style={{
                        strokeDasharray: 1,
                        strokeDashoffset: 1,
                        animation: animate
                            ? 'exec-draw 1.1s ease-out forwards'
                            : 'none',
                    }}
                />
                {/* Arrowhead — draws right after the line reaches the top. */}
                <path
                    d="M202 65.5L209 61.5L212 67.5"
                    pathLength={1}
                    stroke="url(#execArrowGrad)"
                    strokeWidth={2}
                    style={{
                        strokeDasharray: 1,
                        strokeDashoffset: 1,
                        animation: animate
                            ? 'exec-draw 0.32s ease-out 1.05s forwards'
                            : 'none',
                    }}
                />
            </svg>
        </div>
    );
}

function InboxIllustration() {
    const emails = [
        {
            name: 'Tavyn',
            brand: true,
            preview: 'Tavyn has founder questions! - Let us learn more…',
            time: '12:56 PM',
        },
        {
            name: 'Liora',
            preview: 'Liora shared her design feedback on the new proto…',
            time: '11:15 PM',
        },
        {
            name: 'John',
            preview: 'John updated the project timeline after the client…',
            time: '10:23 AM',
        },
        {
            name: 'Mira',
            preview: 'Mira requested clarification on the marketing strate…',
            time: '9:45 AM',
        },
        {
            name: 'Jin',
            preview: 'Jin shared updated sales figures for Q2.',
            time: '9:10 AM',
        },
        {
            name: 'Sofia',
            preview: 'Sofia proposed a new design layout for the homepa…',
            time: '8:35 AM',
        },
        {
            name: 'Liam',
            preview: 'Liam confirmed the logistics for the upcoming produ…',
            time: '8:00 AM',
        },
        {
            name: 'Ally',
            preview: 'Ayesha highlighted key customer feedback from the…',
            time: '7:25 AM',
        },
    ];

    return (
        <div
            style={{
                width: 304,
                height: 240,
                background: COLORS.card,
                borderRadius: 14,
                padding: 19.4,
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
                overflow: 'hidden',
                // Email Native — add a clear top fade as well as the stronger bottom.
                ...faderMask({ left: 12, right: 12, top: 20, bottom: 24 }),
            }}
        >
            {/* Search bar */}
            <div
                style={{
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9.7,
                }}
            >
                <div
                    style={{
                        flex: '1 0 0',
                        height: '100%',
                        border: '0.5px solid #323232',
                        borderRadius: 29,
                        padding: '0 19.4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: 5.8,
                        color: '#8a8f98',
                    }}
                >
                    <span
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                        }}
                    >
                        <SearchIcon />
                        Search
                    </span>
                    <span style={{ letterSpacing: 1 }}>•••</span>
                </div>
                <SettingsIcon />
                <div
                    style={{
                        width: 21,
                        height: 21,
                        borderRadius: '50%',
                        background: '#1a1a1a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 7,
                        color: '#f7f8f8',
                    }}
                >
                    LY
                </div>
            </div>

            {/* Tabs */}
            <div
                style={{
                    display: 'flex',
                    gap: 9.7,
                    height: 21,
                    alignItems: 'center',
                }}
            >
                {['Primary', 'Promotions', 'Updates'].map((t, i) => (
                    <span
                        key={t}
                        style={{
                            flex: '1 0 0',
                            fontWeight: 500,
                            fontSize: 5.8,
                            letterSpacing: '-0.12px',
                            color: '#fff',
                            borderBottom:
                                i === 0 ? '1px solid #323232' : 'none',
                            paddingBottom: 4,
                        }}
                    >
                        {t}
                    </span>
                ))}
            </div>

            {/* Email list */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                {emails.map((e, i) => (
                    <div
                        key={i}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5.8,
                            padding: '5.5px 5.8px',
                            borderBottom: '0.5px solid #323232',
                        }}
                    >
                        <span
                            style={{
                                width: 5.8,
                                height: 5.8,
                                border: '0.5px solid #d9d9d9',
                                borderRadius: 2,
                                flexShrink: 0,
                            }}
                        />
                        <span
                            style={{
                                color: e.brand ? 'gold' : '#d9d9d9',
                                fontSize: 5.8,
                                flexShrink: 0,
                            }}
                        >
                            ☆
                        </span>
                        <span
                            style={{
                                width: 20,
                                fontWeight: 500,
                                fontSize: 6.8,
                                letterSpacing: '-0.14px',
                                color: e.brand ? 'transparent' : '#fff',
                                ...(e.brand
                                    ? {
                                          background:
                                              'linear-gradient(to right, red, #ffc100)',
                                          WebkitBackgroundClip: 'text',
                                          backgroundClip: 'text',
                                      }
                                    : {}),
                            }}
                        >
                            {e.name}
                        </span>
                        <span
                            style={{
                                flex: '1 0 0',
                                minWidth: 0,
                                fontWeight: 300,
                                fontSize: 5.8,
                                letterSpacing: '-0.12px',
                                color: '#5b5b5b',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {e.preview}
                        </span>
                        <span
                            style={{
                                fontWeight: 300,
                                fontSize: 3.9,
                                letterSpacing: '-0.08px',
                                color: '#fff',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {e.time}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function GithubIllustration({ animate }: { animate: boolean }) {
    // Fixed illustration frame that CLIPS its children — the mock blog is intentionally
    // larger than this frame so it gets cut off on the right and bottom (matching Figma).
    return (
        <div
            style={{
                position: 'relative',
                width: 316.667,
                height: 278,
                overflow: 'hidden',
                ...faderMask({ left: 12, right: 12, top: 9, bottom: 24 }),
            }}
        >
            {/* GitHub icon frame (dark card with the Invertocat logo), partly off the left edge. */}
            <div
                style={{
                    position: 'absolute',
                    left: -74,
                    top: 12,
                    width: 273.424,
                    height: 127,
                    background: '#0f0f0f',
                    borderRadius: 10.805,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/figma/exec-github-logo.svg"
                    alt="GitHub"
                    style={{ width: 72, height: 72 }}
                />
            </div>

            {/* Mock blog — 239.9 wide at left 111.67, so its right (~351) and bottom (~315)
          spill past the 316×278 frame and get clipped: no right/bottom border, text
          runs off the right edge. */}
            <div
                style={{
                    position: 'absolute',
                    left: 111.67,
                    top: 82,
                    width: 239.898,
                    height: 233,
                    background: '#0b0b0b',
                    borderRadius: 15.329,
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}
            >
                {/* Book illustration — full width, natural aspect ratio. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/figma/exec-mockblog-frame.svg"
                    alt=""
                    style={{ width: 239.898, height: 88, display: 'block' }}
                />
                {/* Blog-highlight dot (removed from the SVG) overlaid so its gradient can pulse.
            Frame viewBox 205×76 → rendered 239.898×88; dot center (13.03,11.50) maps here. */}
                <span
                    style={{
                        position: 'absolute',
                        left: 15.25 - 1.8,
                        top: 13.31 - 1.8,
                        width: 3.6,
                        height: 3.6,
                        borderRadius: '50%',
                        background:
                            'linear-gradient(to bottom, #FF0000, #FFC100)',
                        animation: animate
                            ? 'exec-dot-pulse 1.9s ease-in-out infinite'
                            : 'none',
                    }}
                />
                <div
                    style={{
                        padding: '9px 15.329px 0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4.6,
                    }}
                >
                    <p
                        style={{
                            margin: 0,
                            fontWeight: 600,
                            fontSize: 6.132,
                            lineHeight: 1.12,
                            letterSpacing: '-0.12px',
                            color: '#fff',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        How to do Keyword Research for SaaS Products
                    </p>
                    <p
                        style={{
                            margin: 0,
                            fontWeight: 200,
                            fontSize: 4.599,
                            lineHeight: 1.12,
                            letterSpacing: '-0.09px',
                            color: '#5b5b5b',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        A practical, step-by-step guide to finding the keywords
                        your SaaS buyers are actually searching for.
                    </p>
                    <p
                        style={{
                            margin: 0,
                            fontSize: 4.599,
                            lineHeight: 2.5,
                            color: '#fff',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Keyword research is often the first step in any SEO
                        strategy, but for SaaS companies,
                        <br />
                        it&apos;s easy to get it wrong. Generic keyword tools
                        are built for broad consumer searches, not the
                        <br />
                        specific, often technical language your buyers use when
                        they&apos;re evaluating software solutions. The result?
                        <br />
                        Content that ranks for terms nobody&apos;s searching
                        for, or worse, terms that attract the wrong audience
                        <br />
                        entirely. In this guide, we&apos;ll break down exactly
                        how to do keyword research the right way for SaaS
                        <br />
                        products—from finding terms with real buyer intent to
                        organizing them into a strategy that actually
                        <br />
                        drives signups, not just traffic.
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ---------- Inbox icons (monochrome, matching Figma) ---------- */

function SearchIcon() {
    return (
        <svg
            width="7"
            height="7"
            viewBox="0 0 16 16"
            fill="none"
            style={{ flexShrink: 0 }}
        >
            <circle cx="7" cy="7" r="4.5" stroke="#8a8f98" strokeWidth="1.4" />
            <path
                d="M10.5 10.5 L14 14"
                stroke="#8a8f98"
                strokeWidth="1.4"
                strokeLinecap="round"
            />
        </svg>
    );
}

function SettingsIcon() {
    return (
        <svg
            width="9"
            height="9"
            viewBox="0 0 16 16"
            fill="none"
            style={{ flexShrink: 0 }}
        >
            <circle cx="8" cy="8" r="2.2" stroke="#5b5b5b" strokeWidth="1.2" />
            <path
                d="M8 1.5 V3 M8 13 V14.5 M14.5 8 H13 M3 8 H1.5 M12.6 3.4 L11.5 4.5 M4.5 11.5 L3.4 12.6 M12.6 12.6 L11.5 11.5 M4.5 4.5 L3.4 3.4"
                stroke="#5b5b5b"
                strokeWidth="1.2"
                strokeLinecap="round"
            />
        </svg>
    );
}
