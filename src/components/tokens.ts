/**
 * Shared visual tokens taken directly from the Figma file.
 * Keep this in one place so tweaking a brand color updates everything.
 */

import type { CSSProperties } from 'react';

export const COLORS = {
    bg: '#050506',
    border: '#111',
    card: '#080809',
    text: '#f7f8f8',
    textMuted: '#8a8f98',
    textDim: '#333',
    divider: 'rgba(255,255,255,0.11)',
    dividerSoft: 'rgba(255,255,255,0.07)',
    surface: 'rgba(255,255,255,0.02)',
    surfaceHover: 'rgba(255,255,255,0.05)',
} as const;

/**
 * Yellow → orange → red gradient at 75% opacity. Used on:
 *   - the Tavyn logo circle
 *   - the Join Waitlist button
 *   - the "Winnable" pill on Hero
 */
export const BRAND_GRADIENT =
    'linear-gradient(to right, rgba(255,193,0,0.75) 0%, rgba(255,116,0,0.75) 50%, rgba(255,0,0,0.75) 100%)';

/** Solid red → yellow gradient — used as text fill on "Five steps." / "ranking." etc. */
export const BRAND_TEXT_GRADIENT = 'linear-gradient(to right, red, #ffc100)';

/**
 * Edge fade ("Fader" in the Figma file). Dissolves an element's edges into the page
 * background so it fades out of view instead of ending at a hard rectangle — the same
 * treatment the Fader frames apply in Figma, but done here as a mask so the element's own
 * pixels ramp to transparent. No overlay element needed, and it works on any background.
 *
 * Each argument is the fade-band size for that edge as a % of the element's width
 * (left/right) or height (top/bottom); 0 (the default) means no fade on that edge — so a
 * bigger number = a stronger, deeper fade. Spread the result into an element's style.
 * Horizontal and vertical fades are separate mask layers combined with `intersect`
 * (webkit: `source-in`) so a pixel is hidden if EITHER edge fade hides it.
 */
// smootherstep — zero 1st/2nd derivative at both ends, so the ramp joins the flat regions
// with no kink. A plain linear ramp kinks there and the eye reads that as a hard "line"
// (Mach banding); easing the ramp is what makes the fade look smooth.
const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

/**
 * One axis of the mask: an eased ramp transparent→opaque over the first `near`% of the
 * element, an opaque plateau, then opaque→transparent over the last `far`%. Many stops
 * following `smootherstep` so the transition is smooth rather than banded.
 */
function axisGradient(
    dir: 'to right' | 'to bottom',
    near: number,
    far: number,
): string {
    const STEPS = 12;
    const stops: string[] = [];
    if (near > 0) {
        for (let i = 0; i <= STEPS; i++) {
            const t = i / STEPS;
            stops.push(
                `rgba(0,0,0,${smootherstep(t).toFixed(4)}) ${(near * t).toFixed(3)}%`,
            );
        }
    } else {
        stops.push('rgba(0,0,0,1) 0%');
    }
    stops.push(`rgba(0,0,0,1) ${(far > 0 ? 100 - far : 100).toFixed(3)}%`);
    if (far > 0) {
        for (let i = 1; i <= STEPS; i++) {
            const t = i / STEPS;
            stops.push(
                `rgba(0,0,0,${smootherstep(1 - t).toFixed(4)}) ${(100 - far + far * t).toFixed(3)}%`,
            );
        }
    }
    return `linear-gradient(${dir}, ${stops.join(', ')})`;
}

export function faderMask({
    top = 0,
    bottom = 0,
    left = 0,
    right = 0,
}: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
}): CSSProperties {
    const layers: string[] = [];
    if (left || right) layers.push(axisGradient('to right', left, right));
    if (top || bottom) layers.push(axisGradient('to bottom', top, bottom));
    if (layers.length === 0) return {};
    const image = layers.join(', ');
    const multi = layers.length > 1;
    return {
        maskImage: image,
        WebkitMaskImage: image,
        maskComposite: multi ? 'intersect' : 'add',
        WebkitMaskComposite: multi ? 'source-in' : 'source-over',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
    };
}

/**
 * Eased overlay fade to the page background, for elements that shouldn't use a mask (e.g.
 * the Hero dashboard, where a mask would clip its drop shadow). Transparent up to `hold`%,
 * then `smootherstep` to the solid background at 100% — same easing as the mask fades so
 * they read the same and don't band. Use the result as a `background`.
 */
export function bgFadeGradient(dir: string, hold: number): string {
    const STEPS = 10;
    const stops: string[] = ['rgba(5,5,6,0) 0%', `rgba(5,5,6,0) ${hold}%`];
    for (let i = 1; i <= STEPS; i++) {
        const t = i / STEPS;
        stops.push(
            `rgba(5,5,6,${smootherstep(t).toFixed(4)}) ${(hold + (100 - hold) * t).toFixed(3)}%`,
        );
    }
    return `linear-gradient(${dir}, ${stops.join(', ')})`;
}

/** Section design dimensions. 780 tall for every screen except the final CTA (537). */
export const DESIGN_W = 1440;
export const DESIGN_H = 780;
export const CTA_DESIGN_H = 537;
export const NAV_DESIGN_H = 62;
export const WORKFLOW_HEADER_DESIGN_H = 93; // "One agent…" band height
