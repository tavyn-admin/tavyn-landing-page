'use client';

import { forwardRef, useEffect, useRef, useState } from 'react';
import { COLORS } from './tokens';

const scaled = (px: number) => `calc(${px} * var(--section-scale) * 1px)`;

/** Gutter that aligns the header content with the centered-scaled section content. */
const GUTTER = 'calc(50vw - 570 * var(--section-scale) * 1px)';

// Smoother, softer bounce than before, and a longer duration so it reads as fluid.
const EASE = 'cubic-bezier(0.30, 1.3, 0.35, 1)';
const DURATION = 760;

const NAT_H = 92; // 2-line header height (design px)
const COLLAPSED_H = 48; // 1-line header height when pinned
const LINE_H = 44.8; // 40px * 1.12 line-height

type Mode = 'none' | 'collapse' | 'expand';

/**
 * "One agent. Five steps. Start to finish." header.
 *
 * Positioned by the parent via `ref` (JS-driven `position: fixed`). While `stuck` it
 * collapses two lines → one with a crossover; on un-stick it plays the reverse crossover
 * back to two lines. A solid black fill sits above the text so page content never shows
 * through above the header, and a blurred/faded strip sits below it.
 */
const WorkflowStickyHeader = forwardRef<
    HTMLDivElement,
    { activeStep: number; stuck: boolean }
>(function WorkflowStickyHeader({ activeStep, stuck }, ref) {
    const aRef = useRef<HTMLSpanElement | null>(null);
    const fRef = useRef<HTMLSpanElement | null>(null);
    const sRef = useRef<HTMLSpanElement | null>(null);
    const [w, setW] = useState({ a: 0, f: 0, s: 0 });

    // Which animation to play: collapse (pinning), expand (un-pinning), or none (initial).
    const [mode, setMode] = useState<Mode>('none');
    const prevStuck = useRef(false);
    useEffect(() => {
        if (stuck) setMode('collapse');
        else if (prevStuck.current) setMode('expand');
        prevStuck.current = stuck;
    }, [stuck]);

    useEffect(() => {
        const measure = () => {
            setW({
                a: aRef.current?.getBoundingClientRect().width ?? 0,
                f: fRef.current?.getBoundingClientRect().width ?? 0,
                s: sRef.current?.getBoundingClientRect().width ?? 0,
            });
        };
        measure();
        const t = setTimeout(measure, 350);
        if (document.fonts?.ready) document.fonts.ready.then(measure);
        window.addEventListener('resize', measure);

        // The word widths scale with --section-scale (font-size), which changes on load and
        // on viewport-height changes WITHOUT a resize event settling first. Re-measure whenever
        // the actual rendered spans change size, so the absolute positions never go stale
        // (a stale, too-small width is what makes "One agent." and "Five steps." collide).
        const ro = new ResizeObserver(measure);
        [aRef, fRef, sRef].forEach((r) => r.current && ro.observe(r.current));

        return () => {
            clearTimeout(t);
            window.removeEventListener('resize', measure);
            ro.disconnect();
        };
    }, []);

    const h = stuck ? COLLAPSED_H : NAT_H;

    const cssVars = {
        '--wf-a': `${w.a}px`,
        '--wf-af': `${w.a + w.f + 12}px`,
        '--wf-shuffle': `${w.s + 10}px`,
        '--wf-line': scaled(LINE_H),
    } as React.CSSProperties;

    // Static (non-animating) transforms = the resting positions for each state.
    const fStatic = 'translateX(0)';
    const sStatic =
        mode === 'collapse'
            ? `translateX(${w.a + w.f + 12}px)` // stays collapsed after the collapse anim
            : `translate(0px, ${scaled(LINE_H)})`; // two-line rest

    const fAnim =
        mode === 'collapse'
            ? { animation: `wf-five-collapse ${DURATION}ms ${EASE} forwards` }
            : mode === 'expand'
              ? { animation: `wf-five-expand ${DURATION}ms ${EASE} forwards` }
              : { transform: fStatic };
    const sAnim =
        mode === 'collapse'
            ? { animation: `wf-start-collapse ${DURATION}ms ${EASE} forwards` }
            : mode === 'expand'
              ? { animation: `wf-start-expand ${DURATION}ms ${EASE} forwards` }
              : { transform: sStatic };

    return (
        <div
            ref={ref}
            style={{
                ...cssVars,
                position: 'fixed',
                // Start off-screen (below the fold, its scroll-0 resting spot) so it doesn't flash
                // at the top of the page before the parent positions it via ref on mount.
                top: '100vh',
                left: 0,
                right: 0,
                height: scaled(h),
                zIndex: 40,
                background: COLORS.bg,
                paddingLeft: GUTTER,
                paddingRight: GUTTER,
                pointerEvents: 'none',
                willChange: 'top',
            }}
        >
            {/* Solid black fill directly above the text, so page content never shows through
            above the header (covers the gap up to the nav). */}
            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: '100%',
                    height: scaled(120),
                    background: COLORS.bg,
                }}
            />

            <div style={{ position: 'relative', height: '100%' }}>
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        fontWeight: 500,
                        fontSize: scaled(40),
                        lineHeight: 1.12,
                        letterSpacing: '-0.8px',
                        color: COLORS.text,
                        whiteSpace: 'nowrap',
                    }}
                >
                    <span
                        ref={aRef}
                        style={{ position: 'absolute', left: 0, top: 0 }}
                    >
                        One agent.&nbsp;
                    </span>

                    <span
                        ref={fRef}
                        className="brand-text-gradient"
                        style={{
                            position: 'absolute',
                            left: `${w.a}px`,
                            top: 0,
                            zIndex: 2,
                            ...fAnim,
                        }}
                    >
                        Five steps.
                    </span>

                    <span
                        ref={sRef}
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            zIndex: 1,
                            ...sAnim,
                        }}
                    >
                        Start to finish.
                    </span>
                </div>

                {/* Step counter, top-right. */}
                <p
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        margin: 0,
                        fontSize: scaled(12),
                        letterSpacing: '-0.24px',
                        color: '#fff',
                        fontWeight: 500,
                    }}
                >
                    {activeStep + 1} | 5
                </p>
            </div>

            {/* Blur + fade strip underneath. */}
            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: '100%',
                    height: scaled(28),
                    backdropFilter: 'blur(5px)',
                    WebkitBackdropFilter: 'blur(5px)',
                    background: `linear-gradient(to bottom, ${COLORS.bg} 0%, rgba(5,5,6,0) 100%)`,
                    maskImage:
                        'linear-gradient(to bottom, black 0%, transparent 100%)',
                    WebkitMaskImage:
                        'linear-gradient(to bottom, black 0%, transparent 100%)',
                    pointerEvents: 'none',
                }}
            />
        </div>
    );
});

export default WorkflowStickyHeader;
