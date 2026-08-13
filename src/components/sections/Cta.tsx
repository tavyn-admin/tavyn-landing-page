'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { COLORS } from '../tokens';
import { HeroWaitlistButton } from '../Nav';

/**
 * Final CTA. The headline types itself out character-by-character once the section scrolls
 * into view; when it finishes, the Join Waitlist button fades in. Font size matches the
 * hero title (48px); the button matches the nav-sized button. Designed at 1440×537.
 */

// The headline as styled segments. "\n" is the line break between the two lines. Typing
// walks this list one character at a time so the gradient words reveal in place.
const SEGMENTS: { text: string; grad: boolean }[] = [
    { text: 'Your competitors are ', grad: false },
    { text: 'ranking.', grad: true },
    { text: '\n', grad: false },
    { text: 'Tavyn', grad: true },
    { text: ' took that personally.', grad: false },
];
const TOTAL = SEGMENTS.reduce((n, s) => n + s.text.length, 0);
const CHAR_MS = 38; // per-character cadence

export default function Cta() {
    const rootRef = useRef<HTMLDivElement>(null);
    const [count, setCount] = useState(0);
    const started = useRef(false);

    // Begin typing once the CTA frame is in view; play exactly once.
    useEffect(() => {
        const el = rootRef.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([e]) => {
                if (
                    !started.current &&
                    e.isIntersecting &&
                    e.intersectionRatio > 0.5
                ) {
                    started.current = true;
                    let c = 0;
                    const id = setInterval(() => {
                        c += 1;
                        setCount(c);
                        if (c >= TOTAL) clearInterval(id);
                    }, CHAR_MS);
                }
            },
            { threshold: [0, 0.5, 1] },
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    const done = count >= TOTAL;

    // Render the headline revealed up to `count` characters, preserving styled segments.
    const nodes: ReactNode[] = [];
    let offset = 0;
    SEGMENTS.forEach((seg, i) => {
        if (seg.text === '\n') {
            if (count > offset) nodes.push(<br key={i} />);
        } else {
            const shown = Math.max(
                0,
                Math.min(seg.text.length, count - offset),
            );
            if (shown > 0) {
                const sub = seg.text.slice(0, shown);
                nodes.push(
                    seg.grad ? (
                        <span key={i} className="brand-text-gradient">
                            {sub}
                        </span>
                    ) : (
                        <span key={i}>{sub}</span>
                    ),
                );
            }
        }
        offset += seg.text.length;
    });

    return (
        <div
            ref={rootRef}
            style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 50,
                padding: '0 150px',
            }}
        >
            <h2
                style={{
                    margin: 0,
                    textAlign: 'center',
                    fontWeight: 500,
                    fontSize: 48,
                    lineHeight: 1.06,
                    letterSpacing: '-1.2px',
                    color: COLORS.text,
                    // Reserve two lines so the button below never shifts as the text types in.
                    minHeight: 48 * 1.06 * 2,
                }}
            >
                {nodes}
                {!done && (
                    <span className="cta-caret" aria-hidden>
                        |
                    </span>
                )}
            </h2>

            <div
                style={{
                    opacity: done ? 1 : 0,
                    transform: done ? 'translateY(0)' : 'translateY(8px)',
                    transition: 'opacity 500ms ease, transform 500ms ease',
                    pointerEvents: done ? 'auto' : 'none',
                }}
            >
                <HeroWaitlistButton />
            </div>
        </div>
    );
}
