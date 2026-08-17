import Link from 'next/link';

import { COLORS } from '@/components/tokens';

export default function SerpReportNotFound() {
    return (
        <main
            style={{
                minHeight: '100vh',
                display: 'grid',
                placeItems: 'center',
                background: COLORS.bg,
                color: COLORS.text,
                padding: 24,
            }}
        >
            <section style={{ maxWidth: 460, textAlign: 'center' }}>
                <h1
                    style={{
                        margin: '0 0 12px',
                        fontSize: 24,
                        fontWeight: 700,
                        letterSpacing: 0,
                    }}
                >
                    SERP report not found
                </h1>
                <p
                    style={{
                        margin: '0 0 24px',
                        color: COLORS.textMuted,
                        fontSize: 13,
                        lineHeight: 1.6,
                    }}
                >
                    The SERP report could not be found or is not complete yet.
                </p>
                <Link
                    href="/"
                    className="tv-link"
                    style={{ fontSize: 13, fontWeight: 600 }}
                >
                    Back to home
                </Link>
            </section>
        </main>
    );
}
