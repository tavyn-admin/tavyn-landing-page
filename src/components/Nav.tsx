import Link from 'next/link';

import { BRAND_GRADIENT, COLORS, DESIGN_H, NAV_DESIGN_H } from './tokens';

// Same scale factor the sections use — one design px = 1 * var(--section-scale) * 1px.
const scaled = (px: number) => `calc(${px} * var(--section-scale) * 1px)`;

/**
 * Simplified nav per user request:
 *   - Tavyn logo (SVG with the brand gradient) on the left
 *   - "Join Waitlist" button on the right
 *   - No Product / Pricing / SERP Analysis / Login
 *
 * Fixed at the top of the viewport. Opaque, so it fully replaces the design's baked nav
 * (there is no baked nav anymore — every section is real markup now).
 */
export default function Nav() {
    return (
        <nav
            className="site-nav hero-enter hero-enter-nav fixed top-0 left-0 right-0 z-50 flex items-center justify-between"
            style={{
                height: scaled(NAV_DESIGN_H),
                paddingLeft: scaled(100),
                paddingRight: scaled(100),
                background: COLORS.bg,
                borderBottom: `1px solid ${COLORS.border}`,
            }}
        >
            <Link
                href="/"
                className="flex items-center"
                style={{ gap: scaled(10), textDecoration: 'none' }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/logo.svg"
                    alt="Tavyn"
                    style={{
                        width: scaled(18),
                        height: scaled(18),
                        display: 'block',
                    }}
                />
                <span
                    style={{
                        fontWeight: 500,
                        fontSize: scaled(14),
                        letterSpacing: '-0.14px',
                        color: COLORS.text,
                    }}
                >
                    Tavyn
                </span>
            </Link>

            <WaitlistButton />
        </nav>
    );
}

/** The nav-sized Waitlist button (scaled with the fixed nav). Links to the waitlist page. */
export function WaitlistButton() {
    return (
        <a
            href="/waitlist"
            className="waitlist-button inline-flex items-center justify-center"
            style={{
                height: scaled(32),
                padding: `0 ${scaled(16)}`,
                borderRadius: scaled(20),
                background: BRAND_GRADIENT,
                color: COLORS.text,
                fontWeight: 500,
                fontSize: scaled(10),
                letterSpacing: '-0.1px',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
            }}
        >
            Join Waitlist
        </a>
    );
}

/**
 * The larger, hero-sized Waitlist button (raw design px — used inside scaled sections like
 * the Hero and the final CTA). Links to the waitlist page. `style` lets a caller add e.g.
 * `alignSelf`.
 */
export function HeroWaitlistButton({ style }: { style?: React.CSSProperties }) {
    return (
        <a
            href="/waitlist"
            className="waitlist-button inline-flex items-center justify-center"
            style={{
                padding: '13px 22px',
                borderRadius: 25,
                background: BRAND_GRADIENT,
                color: COLORS.text,
                fontWeight: 500,
                fontSize: 12,
                letterSpacing: '-0.12px',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                ...style,
            }}
        >
            Join Waitlist
        </a>
    );
}
