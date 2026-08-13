'use client';

import { useEffect, useRef } from 'react';
import { COLORS, faderMask } from '../tokens';
import StepCaption from '../StepCaption';

/**
 * Ship — a mock "Signalyze" landing page (nav + 3 blog tiles, two filled + one empty)
 * with an orange connector arcing to an expanded published article on the right.
 *
 * Animation (loops while the illustration is in view): the expanded mock blog rides the
 * connector curve into the empty tile — its highlight dot follows the line while the line
 * shortens behind it, the card shrinks to the tile's size (width/height animate so the
 * font reflows/wraps), its body text fades out, and it comes to rest exactly filling the
 * empty tile. Three things scale on their OWN terms:
 *   • the card (frame): MOCK → FRAME size
 *   • the illustration graphics group (book/circle): GFX0 → GFX1
 *   • the highlight dot: fixed size (never scales), just rides along
 */

const MOCK = { x: 546.84, y: 42.85, w: 319.332, h: 310.15 }; // expanded blog (start)
const FRAME = { x: 410.13, y: 107.12, w: 159.156, h: 160.176 }; // empty tile (target)
const ILLO_H0 = 99.983; // illustration frame height in the expanded blog
const ILLO_H1 = 81.619; // …and in a tile
const GFX0 = { w: 97.789, h: 72.436 }; // graphics group in the expanded blog
const GFX1 = { w: 70.921, h: 58.153 }; // …in a tile (separate ratio)
const DOT_SIZE = 4.081; // highlight dot — stays this size the whole time
const CONN = {
    x: 428.5,
    y: 58.15,
    w: 133.65,
    h: 65.3,
    vbw: 133.905,
    vbh: 65.55,
};
const DOT = { x: 15.31, y: 15.7 }; // card top-left → the dot (constant offset)
const CORR = { x: -3.31, y: -0.88 }; // seat the card exactly in the tile at p=1

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) =>
    t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;

export default function Ship() {
    const illoRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const bodyRef = useRef<HTMLDivElement>(null);
    const illoBgRef = useRef<HTMLDivElement>(null);
    const gfxRef = useRef<HTMLImageElement>(null);
    const dotRef = useRef<HTMLDivElement>(null);
    const lineRef = useRef<SVGPathElement>(null);

    useEffect(() => {
        const el = illoRef.current;
        if (!el) return;
        let raf = 0;
        let start = 0;
        let total = lineRef.current?.getTotalLength() ?? 1;

        const apply = (p: number, cardOpacity: number) => {
            const ep = easeInOut(Math.min(1, Math.max(0, p)));
            if (!total && lineRef.current)
                total = lineRef.current.getTotalLength();

            const pt = lineRef.current?.getPointAtLength((1 - ep) * total) ?? {
                x: 0,
                y: 0,
            };
            const dotX = CONN.x + pt.x * (CONN.w / CONN.vbw);
            const dotY = CONN.y + pt.y * (CONN.h / CONN.vbh);

            const cw = lerp(MOCK.w, FRAME.w, ep);
            const ch = lerp(MOCK.h, FRAME.h, ep);
            const cardX = dotX - DOT.x + CORR.x * ep;
            const cardY = dotY - DOT.y + CORR.y * ep;

            if (cardRef.current) {
                const s = cardRef.current.style;
                s.transform = `translate(${cardX}px, ${cardY}px)`;
                s.width = `${cw}px`;
                s.height = `${ch}px`;
                s.opacity = String(cardOpacity);
            }
            if (illoBgRef.current)
                illoBgRef.current.style.height = `${lerp(ILLO_H0, ILLO_H1, ep)}px`;
            if (gfxRef.current) {
                gfxRef.current.style.width = `${lerp(GFX0.w, GFX1.w, ep)}px`;
                gfxRef.current.style.height = `${lerp(GFX0.h, GFX1.h, ep)}px`;
            }
            if (dotRef.current) {
                dotRef.current.style.transform = `translate(${dotX - DOT_SIZE / 2}px, ${dotY - DOT_SIZE / 2}px)`;
                dotRef.current.style.opacity = String(cardOpacity);
            }
            if (bodyRef.current)
                bodyRef.current.style.opacity = String(Math.max(0, 1 - ep * 2));
            if (lineRef.current)
                lineRef.current.style.strokeDasharray = `${(1 - ep) * total} ${total * 2}`;
        };

        const T_IN = 2600;
        let hasPlayed = false; // plays exactly once per page load — never resets on scroll.

        // Settle: hold the card in the tile, start the pulsing glow, scale/center the stage.
        const settle = () => {
            apply(1, 1);
            if (cardRef.current)
                cardRef.current.style.animation =
                    'ship-card-glow 3s ease-in-out infinite';
            if (stageRef.current)
                stageRef.current.style.transform =
                    'translate(135.69px, 21.43px) scale(1.15)';
        };

        const tick = (now: number) => {
            const t = now - start;
            if (t >= T_IN) {
                settle();
                raf = 0;
                return;
            }
            // Card stays fully opaque the whole time (no fade → no flicker); it just moves.
            apply(t / T_IN, 1);
            raf = requestAnimationFrame(tick);
        };

        const io = new IntersectionObserver(
            ([e]) => {
                if (
                    !hasPlayed &&
                    e.isIntersecting &&
                    e.intersectionRatio > 0.85
                ) {
                    hasPlayed = true;
                    start = performance.now();
                    total = lineRef.current?.getTotalLength() ?? total;
                    raf = requestAnimationFrame(tick);
                }
            },
            { threshold: [0, 0.85, 1] },
        );
        io.observe(el);
        apply(0, 1); // initial start state (expanded blog on the right)

        return () => {
            io.disconnect();
            if (raf) cancelAnimationFrame(raf);
        };
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
                    ref={stageRef}
                    style={{
                        position: 'relative',
                        width: 866.177,
                        height: 353,
                        // Once settled, the whole stage scales up ~15% and re-centers the landing page.
                        transformOrigin: '297.4px 155.075px',
                        transition:
                            'transform 750ms cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                >
                    <MockLandingPage />

                    {/* Connector (inline so it can shorten + drive the card's path). */}
                    <svg
                        width={CONN.w}
                        height={CONN.h}
                        viewBox={`0 0 ${CONN.vbw} ${CONN.vbh}`}
                        preserveAspectRatio="none"
                        style={{
                            position: 'absolute',
                            left: CONN.x,
                            top: CONN.y,
                            zIndex: 2,
                            overflow: 'visible',
                        }}
                    >
                        <defs>
                            <linearGradient
                                id="shipConnGrad"
                                x1="85"
                                y1="-7.7"
                                x2="33"
                                y2="86"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset="0" stopColor="#FFBE00" />
                                <stop offset="1" stopColor="#FF1E00" />
                            </linearGradient>
                        </defs>
                        <path
                            ref={lineRef}
                            d="M0.255058 65.55V33.2293C2.13677 5.46578 11.405 -0.8491 39.0893 0.403588H133.905"
                            fill="none"
                            stroke="url(#shipConnGrad)"
                            strokeWidth={0.51}
                        />
                    </svg>

                    {/* The travelling / shrinking mock blog. */}
                    <MockBlog
                        cardRef={cardRef}
                        bodyRef={bodyRef}
                        illoBgRef={illoBgRef}
                        gfxRef={gfxRef}
                    />

                    {/* Highlight dot — constant size, rides the connector to the tile. */}
                    <div
                        ref={dotRef}
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: DOT_SIZE,
                            height: DOT_SIZE,
                            borderRadius: '50%',
                            background: '#FF6A1A',
                            zIndex: 4,
                            pointerEvents: 'none',
                        }}
                    />
                </div>
            </div>

            <StepCaption
                title="Ship"
                description="Tavyn turns the approved brief and your expertise into a polished, search-ready article, then opens a GitHub pull request ready to review and merge."
            />
        </>
    );
}

/* ---------- Left: mock "Signalyze" landing page ---------- */

function MockLandingPage() {
    return (
        <div
            style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 594.795,
                height: 310.15,
                background: COLORS.card,
                borderRadius: 14.756,
                overflow: 'hidden',
                // The landing page IS the illustration once the card settles into it, so fade its
                // own edges — strongest on the right and bottom.
                ...faderMask({ left: 10, top: 8, right: 22, bottom: 26 }),
            }}
        >
            {/* Nav */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '0.664px solid #111',
                    padding: '9.958px 30.607px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6.638,
                    }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/figma/ship-logo.svg"
                        alt=""
                        style={{ width: 9.591, height: 12.242 }}
                    />
                    <span
                        style={{
                            fontWeight: 500,
                            fontSize: 9.294,
                            letterSpacing: '-0.09px',
                            color: COLORS.text,
                        }}
                    >
                        Signalyze
                    </span>
                </div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 20.405,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            gap: 16.596,
                            fontSize: 6.638,
                            color: COLORS.textMuted,
                        }}
                    >
                        <span>Product</span>
                        <span>Pricing</span>
                        <span>Customers</span>
                        <span style={{ color: '#fff' }}>Blogs</span>
                    </div>
                    <span
                        style={{
                            width: 1,
                            height: 18.931,
                            background: '#1a1a1a',
                        }}
                    />
                    <div
                        style={{
                            display: 'flex',
                            gap: 16.596,
                            fontSize: 6.638,
                        }}
                    >
                        <span style={{ color: COLORS.textMuted }}>Login</span>
                        <span style={{ color: '#2e4636' }}>Sign Up</span>
                    </div>
                </div>
            </div>

            {/* Page title */}
            <p
                style={{
                    position: 'absolute',
                    left: 30.61,
                    top: 63.25,
                    margin: 0,
                    fontWeight: 400,
                    fontSize: 16.324,
                    letterSpacing: '-0.16px',
                    color: COLORS.text,
                }}
            >
                Blogs
            </p>

            {/* Blog 1 (left) */}
            <BlogTile
                left={30.61}
                illustration="/figma/ship-blog-illus-1.svg"
                title="How to Do SaaS SEO: The Complete Guide"
                body="A step-by-step framework for finding valuable search opportunities, building topical authority, and turning organic traffic into growth."
            />
            {/* Blog 2 (middle) */}
            <BlogTile
                left={220.37}
                illustration="/figma/ship-blog-illus-2.svg"
                title="Best SaaS SEO Automation Tools"
                body="Compare the tools that automate keyword research, content planning, optimization, and publishing for SaaS teams."
            />

            {/* Empty tile (right) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src="/figma/ship-empty-frame.svg"
                alt=""
                style={{
                    position: 'absolute',
                    left: 410.13,
                    top: 107.12,
                    width: 159.156,
                    height: 160.176,
                }}
            />
        </div>
    );
}

function BlogTile({
    left,
    illustration,
    title,
    body,
}: {
    left: number;
    illustration: string;
    title: string;
    body: string;
}) {
    return (
        <div
            style={{
                position: 'absolute',
                left,
                top: 107.12,
                width: 159.156,
                height: 160.176,
                background: '#0b0b0b',
                borderRadius: 20.405,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={illustration}
                alt=""
                style={{ width: 159.156, height: 81.619, display: 'block' }}
            />
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6.121,
                    padding: '10.202px 20.405px 20.405px',
                }}
            >
                <p
                    style={{
                        margin: 0,
                        fontWeight: 600,
                        fontSize: 8.162,
                        lineHeight: 1.12,
                        letterSpacing: '-0.16px',
                        color: '#fff',
                    }}
                >
                    {title}
                </p>
                <p
                    style={{
                        margin: 0,
                        fontWeight: 200,
                        fontSize: 6.121,
                        lineHeight: 1.12,
                        letterSpacing: '-0.12px',
                        color: '#5b5b5b',
                    }}
                >
                    {body}
                </p>
            </div>
        </div>
    );
}

/* ---------- Right: expanded published article (animated) ---------- */

function MockBlog({
    cardRef,
    bodyRef,
    illoBgRef,
    gfxRef,
}: {
    cardRef: React.RefObject<HTMLDivElement>;
    bodyRef: React.RefObject<HTMLDivElement>;
    illoBgRef: React.RefObject<HTMLDivElement>;
    gfxRef: React.RefObject<HTMLImageElement>;
}) {
    return (
        <div
            ref={cardRef}
            style={{
                position: 'absolute',
                left: 0,
                top: 0,
                transform: `translate(${MOCK.x}px, ${MOCK.y}px)`,
                width: MOCK.w,
                height: MOCK.h,
                background: '#0b0b0b',
                borderRadius: 20.405,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                zIndex: 3,
                willChange: 'transform, width, height',
            }}
        >
            {/* Illustration frame: tint background (scales with card) + graphics group (own ratio). */}
            <div
                ref={illoBgRef}
                style={{
                    position: 'relative',
                    width: '100%',
                    height: ILLO_H0,
                    background: 'rgba(152,145,119,0.05)',
                    overflow: 'hidden',
                    flexShrink: 0,
                }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    ref={gfxRef}
                    src="/figma/ship-mockblog-graphic.svg"
                    alt=""
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: GFX0.w,
                        height: GFX0.h,
                    }}
                />
            </div>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6.121,
                    padding: '10.202px 20.405px 0',
                    flexShrink: 0,
                }}
            >
                <p
                    style={{
                        margin: 0,
                        fontWeight: 600,
                        fontSize: 8.162,
                        lineHeight: 1.12,
                        letterSpacing: '-0.16px',
                        color: '#fff',
                    }}
                >
                    SaaS SEO Audit Checklist [Free Template]
                </p>
                <p
                    style={{
                        margin: 0,
                        fontWeight: 200,
                        fontSize: 6.121,
                        lineHeight: 1.12,
                        letterSpacing: '-0.12px',
                        color: '#5b5b5b',
                    }}
                >
                    This checklist walks through the essential steps for
                    reviewing your site&apos;s technical health, keyword
                    targeting, content coverage, and conversion paths.
                </p>
            </div>

            {/* Body — fades out as the card shrinks. */}
            <div
                ref={bodyRef}
                style={{
                    overflow: 'hidden',
                    flex: '1 0 0',
                    minHeight: 0,
                    padding: '6px 20.405px 20.405px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                }}
            >
                <p
                    style={{
                        margin: 0,
                        fontWeight: 400,
                        fontSize: 6.121,
                        lineHeight: 2.5,
                        letterSpacing: '-0.12px',
                        color: '#fff',
                    }}
                >
                    A SaaS SEO audit is a quick way to uncover what is holding
                    your website back, but it is easy to focus on the wrong
                    things. Generic audit checklists often treat every site the
                    same, overlooking the technical setup, positioning, and
                    search intent that matter for SaaS. The result? Teams fix
                    minor issues while missing the content gaps, crawl problems,
                    and conversion leaks that limit growth. In this guide, we
                    will walk through a practical SaaS SEO audit—from reviewing
                    technical health and keyword targeting to finding
                    opportunities that improve qualified traffic and signups.
                </p>
                <p
                    style={{
                        margin: 0,
                        fontWeight: 400,
                        fontSize: 6.121,
                        lineHeight: 2.5,
                        letterSpacing: '-0.12px',
                        color: '#fff',
                    }}
                >
                    Before working through the checklist, it helps to understand
                    what makes a SaaS SEO audit different. Your website is not
                    just a collection of pages—it is a path that moves buyers
                    from problem awareness to product evaluation. A page that
                    ranks but does not connect to your product can be as weak as
                    a page that never ranks. This audit will help you assess
                    visibility and conversion so you can prioritize the fixes
                    that matter most.
                </p>
            </div>
        </div>
    );
}
