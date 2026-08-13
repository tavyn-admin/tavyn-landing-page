import { BRAND_GRADIENT, COLORS, bgFadeGradient } from '../tokens';

/**
 * Hero — "You run the SaaS. Tavyn runs the SEO." with an inline waitlist field, and the
 * dashboard mockup (Figma 300:596) peeking up from the bottom, faded into the page bg.
 * All coordinates are native design px (1440 × 780); the outer <Section> scales.
 */
export default function Hero() {
    return (
        <>
            {/* Hero CTA (design y=192, x=150) — above the dashboard. */}
            <div
                style={{
                    position: 'absolute',
                    left: 150,
                    top: 192,
                    width: 790,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 45,
                    zIndex: 1,
                }}
            >
                <div>
                    <p
                        className="hero-enter hero-enter-headline"
                        style={{
                            margin: 0,
                            fontWeight: 500,
                            fontSize: 48,
                            lineHeight: 1.06,
                            letterSpacing: '-1.2px',
                            color: COLORS.text,
                        }}
                    >
                        You run the{' '}
                        <span className="brand-text-gradient">SaaS</span>.
                        <br />
                        Tavyn runs the{' '}
                        <span className="brand-text-gradient">SEO</span>.
                    </p>
                    <p
                        className="hero-enter hero-enter-copy"
                        style={{
                            margin: 0,
                            marginTop: 35,
                            fontWeight: 400,
                            fontSize: 12,
                            lineHeight: 1.6,
                            letterSpacing: '-0.12px',
                            color: COLORS.textMuted,
                        }}
                    >
                        We find organic visibility gaps, write the briefs, asks
                        the right founder questions, and ships publish-ready
                        content through your GitHub.
                    </p>
                </div>

                {/* Inline waitlist: email field + Join Waitlist button */}
                <div
                    className="hero-enter hero-enter-cta"
                    style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                >
                    <input
                        type="email"
                        className="hero-email"
                        placeholder="Enter email..."
                        style={{
                            width: 463,
                            background: '#111',
                            border: 'none',
                            outline: 'none',
                            borderRadius: 25,
                            padding: '13px 22px',
                            color: COLORS.text,
                            fontSize: 12,
                            letterSpacing: '-0.12px',
                            fontFamily: 'inherit',
                        }}
                    />
                    <a
                        href="/waitlist"
                        className="waitlist-button"
                        style={{
                            background: BRAND_GRADIENT,
                            borderRadius: 25,
                            padding: '13px 22px',
                            color: COLORS.text,
                            fontWeight: 500,
                            fontSize: 12,
                            letterSpacing: '-0.12px',
                            textDecoration: 'none',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Join Waitlist
                    </a>
                </div>
            </div>

            {/* Dashboard mockup, peeking up from the bottom and fading into the page bg. */}
            <div
                className="hero-enter hero-enter-dashboard"
                style={{
                    position: 'absolute',
                    left: 150,
                    top: 500,
                    width: 1140,
                }}
            >
                <ProductFrame />
            </div>
        </>
    );
}

/* ---------- Dashboard mockup (Figma 300:596) ---------- */

function ProductFrame() {
    return (
        <div style={{ position: 'relative' }}>
            <div
                style={{
                    background: COLORS.card,
                    border: '1px solid rgba(255,255,255,0.11)',
                    borderRadius: 16,
                    height: 266,
                    width: 1140,
                    overflow: 'hidden',
                    boxShadow: '0 40px 90px 0 rgba(0,0,0,0.55)',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Browser header */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '13px 18px',
                        borderBottom: '1px solid rgba(255,255,255,0.07)',
                        flexShrink: 0,
                    }}
                >
                    <BrowserDots />
                    <div
                        style={{
                            background: 'rgba(255,255,255,0.04)',
                            borderRadius: 7,
                            padding: '6px 14px',
                        }}
                    >
                        <span
                            style={{
                                fontWeight: 300,
                                fontSize: 12,
                                color: COLORS.textMuted,
                                letterSpacing: '-0.06px',
                            }}
                        >
                            tavyn.app / briefs
                        </span>
                    </div>
                    <BrowserDots />
                </div>

                {/* Dashboard body: sidebar + page */}
                <div style={{ display: 'flex', flex: '1 0 0', minHeight: 0 }}>
                    <DashboardSidebar />
                    <DashboardPage />
                </div>
            </div>

            {/* Fader — the dashboard dissolves into the page background toward the bottom. */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 1140,
                    height: 266,
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    background: bgFadeGradient('to bottom', 20),
                    pointerEvents: 'none',
                }}
            />
        </div>
    );
}

function BrowserDots() {
    return (
        <div style={{ display: 'flex', gap: 7 }}>
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    style={{
                        display: 'inline-block',
                        width: 11,
                        height: 11,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.06)',
                    }}
                />
            ))}
        </div>
    );
}

function DashboardSidebar() {
    const items = [
        { label: 'Dashboard', active: false },
        { label: 'Opportunities', active: true },
        { label: 'Briefs', active: false },
        { label: 'Drafts', active: false },
        { label: 'Pull requests', active: false },
    ];
    return (
        <div
            style={{
                width: 221,
                borderRight: '1px solid rgba(255,255,255,0.07)',
                padding: '18px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                flexShrink: 0,
            }}
        >
            {items.map((it) => (
                <div
                    key={it.label}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 10px',
                        borderRadius: 7,
                        background: it.active
                            ? 'rgba(255,255,255,0.05)'
                            : 'transparent',
                    }}
                >
                    <span
                        style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: it.active ? '#FF6A1A' : '#5b5b5b',
                            flexShrink: 0,
                        }}
                    />
                    <span
                        style={{
                            fontWeight: 400,
                            fontSize: 13,
                            letterSpacing: '-0.065px',
                            color: it.active ? COLORS.text : COLORS.textMuted,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {it.label}
                    </span>
                </div>
            ))}
        </div>
    );
}

function DashboardPage() {
    return (
        <div
            style={{
                flex: '1 0 0',
                minWidth: 0,
                padding: '20px 24px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
            }}
        >
            {/* Page header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <span
                    style={{
                        fontWeight: 600,
                        fontSize: 18,
                        letterSpacing: '-0.18px',
                        color: COLORS.text,
                    }}
                >
                    Opportunities
                </span>
                <div
                    style={{
                        border: '1px solid rgba(255,0,0,0.75)',
                        borderRadius: 100,
                        padding: '8px 14px',
                    }}
                >
                    <span
                        style={{
                            fontWeight: 300,
                            fontSize: 12,
                            letterSpacing: '-0.06px',
                            color: COLORS.text,
                        }}
                    >
                        New Brief
                    </span>
                </div>
            </div>

            {/* Rows */}
            <div
                style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                <Row
                    title="Best keyword search tools"
                    intent="Commercial"
                    winnable
                />
                <Row
                    title="Programmatic SEO for SaaS"
                    intent="Informational"
                    winnable
                />
                <Row
                    title="Ahrefs alternatives for small teams"
                    intent="Commercial"
                    crowded
                />
            </div>

            {/* Empty placeholder cards */}
            <div
                style={{
                    display: 'flex',
                    flex: '1 0 0',
                    gap: 12,
                    minHeight: 0,
                }}
            >
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        style={{
                            flex: '1 0 0',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: 10,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

function Row({
    title,
    intent,
    winnable = false,
    crowded = false,
}: {
    title: string;
    intent: string;
    winnable?: boolean;
    crowded?: boolean;
}) {
    return (
        <div
            style={{
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                padding: '15px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}
        >
            <span
                style={{
                    fontWeight: 300,
                    fontSize: 12,
                    letterSpacing: '-0.12px',
                    color: COLORS.text,
                }}
            >
                {title}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Pill label={intent} outlined />
                {winnable && <Pill label="Winnable" />}
                {crowded && <Pill label="Crowded" muted />}
            </div>
        </div>
    );
}

function Pill({
    label,
    outlined = false,
    muted = false,
}: {
    label: string;
    outlined?: boolean;
    muted?: boolean;
}) {
    const base = {
        padding: '4px 10px',
        borderRadius: 10,
        fontWeight: 500,
        fontSize: 8,
        letterSpacing: '-0.04px',
        whiteSpace: 'nowrap' as const,
    };
    if (muted)
        return (
            <span
                style={{
                    ...base,
                    border: '1px solid #1e1e1e',
                    color: COLORS.textDim,
                }}
            >
                {label}
            </span>
        );
    if (outlined)
        return (
            <span
                style={{
                    ...base,
                    border: `1px solid ${COLORS.textDim}`,
                    color: COLORS.text,
                }}
            >
                {label}
            </span>
        );
    return (
        <span
            style={{ ...base, background: BRAND_GRADIENT, color: COLORS.text }}
        >
            {label}
        </span>
    );
}
