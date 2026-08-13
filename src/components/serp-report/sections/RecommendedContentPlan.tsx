'use client';

import { useLayoutEffect, useRef } from 'react';

import SerpReportSection from '@/components/serp-report/SerpReportSection';
import type { ContentPlanData } from '@/lib/serp-report/schema';
import RecommendedContentPlanCards from './RecommendedContentPlanCards';
import styles from './RecommendedContentPlan.module.css';

type RecommendedContentPlanProps = {
    contentPlan: ContentPlanData;
    companyName: string;
};

export default function RecommendedContentPlan({
    contentPlan,
    companyName,
}: RecommendedContentPlanProps) {
    const rootRef = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
        const root = rootRef.current;
        let activationFrame = 0;

        if (
            !root ||
            !window.IntersectionObserver ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry?.isIntersecting) {
                    return;
                }

                observer.disconnect();
                activationFrame = requestAnimationFrame(() => {
                    root.dataset.motion = 'active';
                });
            },
            { threshold: 0.25 },
        );

        root.dataset.motion = 'pending';
        observer.observe(root);

        return () => {
            cancelAnimationFrame(activationFrame);
            observer.disconnect();
        };
    }, []);

    return (
        <SerpReportSection background="transparent">
            <div ref={rootRef} className={styles.root}>
                <header className={styles.header}>
                    <h1 className={styles.title}>
                        The first three articles Tavyn would publish for{' '}
                        {companyName}
                    </h1>
                    <p className={styles.subtitle}>
                        A prioritized, evidence-backed plan built from your
                        strongest search opportunities.
                    </p>
                </header>

                <div className={styles.contentFrame}>
                    <RecommendedContentPlanCards
                        recommendations={contentPlan.recommendations}
                        averageOpportunityScore={
                            contentPlan.summary.average_opportunity_score
                        }
                        companyName={companyName}
                    />
                </div>
            </div>
        </SerpReportSection>
    );
}
