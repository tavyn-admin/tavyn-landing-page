import { COLORS } from './tokens';

/**
 * Site footer — Tavyn branding on the left, the FAQ + legal/contact links on the right.
 * The FAQ used to be a full section on the page; it now lives behind a link here.
 */
const LINKS = [
    { label: 'FAQ', href: '/faq' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Security', href: '/security' },
    { label: 'Contact', href: 'mailto:nishchay@tavyn.dev' },
];

export default function Footer() {
    return (
        <footer
            style={{
                background: COLORS.bg,
                borderTop: `1px solid ${COLORS.border}`,
            }}
        >
            <div
                style={{
                    maxWidth: 1280,
                    margin: '0 auto',
                    padding: '26px 24px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 24,
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                }}
            >
                {/* Brand */}
                <div
                    style={{ display: 'flex', flexDirection: 'column', gap: 9 }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/logo.svg"
                            alt=""
                            style={{ width: 18, height: 18, display: 'block' }}
                        />
                        <span
                            style={{
                                fontWeight: 600,
                                fontSize: 11,
                                letterSpacing: '-0.11px',
                                color: COLORS.text,
                            }}
                        >
                            Tavyn
                        </span>
                    </div>
                    <p
                        style={{
                            margin: 0,
                            fontSize: 10,
                            lineHeight: 1.6,
                            letterSpacing: '-0.1px',
                            color: COLORS.textMuted,
                        }}
                    >
                        Email-native blog operations for founder-led SaaS teams.
                    </p>
                    <p style={{ margin: 0, fontSize: 8.5, color: '#5b5b5b' }}>
                        © 2026 Tavyn. All rights reserved.
                    </p>
                </div>

                {/* Links */}
                <nav
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px 22px',
                        alignItems: 'center',
                    }}
                >
                    {LINKS.map((l) => (
                        <a
                            key={l.label}
                            href={l.href}
                            className="tv-link"
                            style={{ fontSize: 10 }}
                        >
                            {l.label}
                        </a>
                    ))}
                </nav>
            </div>
        </footer>
    );
}
