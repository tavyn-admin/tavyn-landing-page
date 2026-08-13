'use client';

import {
    useLayoutEffect,
    useRef,
    useState,
    type CSSProperties,
    type ReactNode,
} from 'react';

import { DESIGN_H, DESIGN_W } from '@/components/tokens';
import styles from './SerpReportSection.module.css';

type ReportSectionLayout = {
    designHeight: number;
    scale: number | null;
};

export default function SerpReportSection({
    children,
    designH = DESIGN_H,
    designW = DESIGN_W,
    background = 'var(--serp-color-background, #050506)',
}: {
    children: ReactNode;
    designH?: number;
    designW?: number;
    background?: string;
}) {
    const contentRef = useRef<HTMLDivElement>(null);
    const [layout, setLayout] = useState<ReportSectionLayout>({
        designHeight: designH,
        scale: null,
    });

    useLayoutEffect(() => {
        let animationFrame = 0;

        const updateLayout = () => {
            cancelAnimationFrame(animationFrame);
            animationFrame = requestAnimationFrame(() => {
                const measuredHeight = Math.max(
                    designH,
                    Math.ceil(contentRef.current?.scrollHeight ?? designH),
                );
                const nextScale =
                    window.innerWidth > 1100
                        ? Math.min(
                              window.innerWidth / designW,
                              window.innerHeight / designH,
                          )
                        : 1;

                setLayout((currentLayout) =>
                    currentLayout.designHeight === measuredHeight &&
                    currentLayout.scale === nextScale
                        ? currentLayout
                        : { designHeight: measuredHeight, scale: nextScale },
                );
            });
        };

        updateLayout();
        window.addEventListener('resize', updateLayout);

        const resizeObserver = new ResizeObserver(updateLayout);
        if (contentRef.current) {
            resizeObserver.observe(contentRef.current);
        }

        return () => {
            cancelAnimationFrame(animationFrame);
            resizeObserver.disconnect();
            window.removeEventListener('resize', updateLayout);
        };
    }, [designH, designW]);

    const scale = layout.scale ?? 'var(--serp-section-scale, 1)';
    const sectionVariables = {
        '--report-section-scale': scale,
        '--report-section-inverse-scale':
            layout.scale === null
                ? 'var(--serp-section-inverse-scale, 1)'
                : 1 / layout.scale,
        '--section-scale': scale,
        '--report-section-design-width': `${designW}px`,
        '--report-section-design-height': `${designH}px`,
        '--report-section-measured-height': `${layout.designHeight}px`,
        '--report-section-rendered-height':
            layout.scale === null && designH === DESIGN_H
                ? 'var(--serp-section-height, 780px)'
                : `${layout.designHeight * (layout.scale ?? 1)}px`,
        '--report-section-background': background,
    } as CSSProperties;

    return (
        <section className={styles.section} style={sectionVariables}>
            <div className={styles.canvas}>
                <div ref={contentRef} className={styles.content}>
                    {children}
                </div>
            </div>
        </section>
    );
}
