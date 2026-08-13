'use client';

import { useEffect, useRef, useState } from 'react';
import Section from '@/components/Section';
import Nav from '@/components/Nav';
import StickyWorkflowHeader from '@/components/StickyWorkflowHeader';
import { CTA_DESIGN_H, DESIGN_H } from '@/components/tokens';
import Hero from '@/components/sections/Hero';
import Learn from '@/components/sections/Learn';
import Target from '@/components/sections/Target';
import Plan from '@/components/sections/Plan';
import Create from '@/components/sections/Create';
import Ship from '@/components/sections/Ship';
import ExecutionGap from '@/components/sections/ExecutionGap';
import Cta from '@/components/sections/Cta';
import Footer from '@/components/Footer';

// 80px (design) of space above the header in its natural position, between it and the
// hero's dashboard. Collapses to a 20px gap under the nav once pinned.
const HEADER_GAP_TOP = 80;
// On step 5.0 the header un-pins by settling into the page: it comes to rest HEADER_REST_GAP
// (design px) above Ship's illustration and thereafter scrolls up with the page, staying that
// far above the illustration. It expands back to two lines shortly before it detaches.
const HEADER_REST_GAP = 40; // gap between the 2-line header's bottom and Ship's illustration
const HEADER_NAT_H = 92; // 2-line header height (design px)
const SHIP_ILLO_TOP = 155; // Ship illustration top within its 100vh section (design px)
const EXPAND_LEAD = 0.14; // expand to 2 lines this many viewports before the base detach point
const DETACH_DELAY = 44; // hold the pin this many extra px after expanding, so the 2-line
// header is clearly visible before it releases and rides up with the page.

export default function Home() {
    const [activeStep, setActiveStep] = useState(0);
    const [stuck, setStuck] = useState(false);
    const headerRef = useRef<HTMLDivElement>(null);
    const stuckRef = useRef(false);
    const stepRef = useRef(0);

    useEffect(() => {
        const setScale = () => {
            const scale = window.innerHeight / DESIGN_H;
            document.documentElement.style.setProperty(
                '--section-scale',
                String(scale),
            );
        };

        const compute = () => {
            const vhPx = window.innerHeight;
            const scale = vhPx / DESIGN_H;
            const scrolled = window.scrollY;

            const navH = 62 * scale;
            const gapTop = HEADER_GAP_TOP * scale;
            const gapStuck = 20 * scale;

            // Header natural doc position (top of the steps group, `gapTop` below the hero).
            const naturalTop = vhPx + gapTop;
            const pinTop = navH + gapStuck; // pinned position: 20px under the nav
            const pinStart = naturalTop - pinTop; // scrollY where it reaches the nav and pins
            const shipTop = vhPx + gapTop + 4 * vhPx; // step 5.0 (Ship) doc top

            // The header reaches "HEADER_REST_GAP above Ship's illustration" at `detachBase`; it
            // then holds pinned an extra DETACH_DELAY px (so the expanded 2-line header is clearly
            // visible) before detaching and riding up with the page.
            const anchorDoc =
                shipTop +
                (SHIP_ILLO_TOP - HEADER_REST_GAP - HEADER_NAT_H) * scale;
            const detachBase = anchorDoc - pinTop;
            const detachScroll = detachBase + DETACH_DELAY * scale;
            const expandScroll = detachBase - EXPAND_LEAD * vhPx; // expand start (timing unchanged)
            const naturalPos = naturalTop - scrolled; // header's pre-pin (rising) position

            // Drive the fixed header's top directly (no per-scroll React re-render):
            //   before pin → rises with the page; pinned under the nav → constant (through the
            //   expand + hold); after detach → rides up 1:1 with the page (settled on the page).
            let top: number;
            if (naturalPos > pinTop) top = naturalPos;
            else if (scrolled < detachScroll) top = pinTop;
            else top = pinTop - (scrolled - detachScroll);
            if (headerRef.current) headerRef.current.style.top = `${top}px`;

            const newStuck = scrolled >= pinStart && scrolled < expandScroll;
            if (newStuck !== stuckRef.current) {
                stuckRef.current = newStuck;
                setStuck(newStuck);
            }

            // Counter advances at the halfway point of each step.
            const relative = scrolled - naturalTop;
            const idx = Math.min(
                4,
                Math.max(0, Math.floor((relative + vhPx * 0.5) / vhPx)),
            );
            if (idx !== stepRef.current) {
                stepRef.current = idx;
                setActiveStep(idx);
            }
        };

        const onResize = () => {
            setScale();
            compute();
        };

        setScale();
        compute();
        window.addEventListener('scroll', compute, { passive: true });
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('scroll', compute);
            window.removeEventListener('resize', onResize);
        };
    }, []);

    return (
        <main className="w-full" style={{ background: '#050506' }}>
            <Nav />
            {/* Fixed, JS-positioned header. Pins through steps 1–5.0 and releases partway into
          Ship, well before the Execution Gap header. */}
            <StickyWorkflowHeader
                ref={headerRef}
                activeStep={activeStep}
                stuck={stuck}
            />

            <Section>
                <Hero />
            </Section>

            {/* The 5-step group. `padding-top` supplies the 80px natural gap above the header. */}
            <div
                style={{
                    paddingTop: `calc(${HEADER_GAP_TOP} * var(--section-scale) * 1px)`,
                }}
            >
                <Section>
                    <Learn />
                </Section>
                <Section>
                    <Target />
                </Section>
                <Section>
                    <Plan />
                </Section>
                <Section>
                    <Create />
                </Section>
                <Section>
                    <Ship />
                </Section>
            </div>

            <Section>
                <ExecutionGap />
            </Section>
            <Section designH={CTA_DESIGN_H}>
                <Cta />
            </Section>

            <Footer />
        </main>
    );
}
