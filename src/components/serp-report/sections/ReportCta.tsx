'use client';

import { useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import { useSerpTelemetry } from '@/components/serp-report/SerpTelemetryProvider';
import type { ContentPlanRecommendation } from '@/lib/serp-report/schema';
import { storeSerpWaitlistPrefill } from '@/lib/serp-report/waitlistPrefill';
import styles from './ReportCta.module.css';

type ReportCtaProps = {
    companyName: string;
    companyDomain: string;
    recommendations: ContentPlanRecommendation[];
};

export default function ReportCta({
    companyName,
    companyDomain,
    recommendations,
}: ReportCtaProps) {
    const router = useRouter();
    const { capture, captureOnce } = useSerpTelemetry();
    const rootRef = useRef<HTMLDivElement | null>(null);
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const customerName = companyName.trim() || 'Your company';
    const firstRecommendation = recommendations[0];
    const rearRecommendations = recommendations.slice(1, 3);
    const remainingCount = Math.max(0, recommendations.length - 1);

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
                if (!entry?.isIntersecting) return;

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

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (submitting) return;

        setSubmitError('');
        const normalizedEmail = email.trim();

        if (!/\S+@\S+\.\S+/.test(normalizedEmail)) {
            setSubmitError('Enter a valid work email.');
            return;
        }

        setSubmitting(true);
        capture('serp_cta_clicked', {
            cta_location: 'report_bottom',
        });
        storeSerpWaitlistPrefill({
            email: normalizedEmail,
            website: companyDomain.trim(),
        });
        const params = new URLSearchParams({
            source: 'serp_report',
            returnTo: window.location.pathname,
        });
        router.push(`/waitlist?${params.toString()}`);
    }

    const errorId = submitError ? 'report-waitlist-error' : undefined;

    return (
        <div ref={rootRef} className={styles.root} id="report-waitlist">
            <div className={styles.content}>
                <section className={styles.conversionCopy}>
                    <h2 className={styles.heading}>
                        <span className={styles.introLine}>
                            Your buyers are already searching.
                        </span>
                        <span className={styles.emphasizedLine}>
                            It’s time they found {customerName}.
                        </span>
                    </h2>

                    <form
                        className={styles.waitlistForm}
                        onSubmit={handleSubmit}
                        noValidate
                    >
                        <label
                            className={styles.emailLabel}
                            htmlFor="report-waitlist-email"
                        >
                            Work email
                        </label>
                        <input
                            id="report-waitlist-email"
                            className={styles.emailInput}
                            type="email"
                            name="email"
                            autoComplete="email"
                            placeholder="Work email"
                            value={email}
                            onChange={(event) => {
                                setEmail(event.target.value);
                                setSubmitError('');
                            }}
                            onFocus={() =>
                                captureOnce('cta-started', 'serp_cta_started', {
                                    cta_location: 'report_bottom',
                                })
                            }
                            aria-describedby={errorId}
                            aria-invalid={submitError ? true : undefined}
                            required
                        />
                        <button
                            className={styles.waitlistButton}
                            type="submit"
                            disabled={submitting}
                            aria-busy={submitting}
                        >
                            {submitting
                                ? 'Joining…'
                                : 'Join the waitlist + get my draft'}
                        </button>
                        {submitError ? (
                            <p
                                className={styles.formError}
                                id="report-waitlist-error"
                                role="alert"
                            >
                                {submitError}
                            </p>
                        ) : null}
                        <p className={styles.microcopy}>
                            By joining, you agree to receive the draft and Tavyn
                            updates. Unsubscribe anytime.
                        </p>
                    </form>
                </section>

                <section
                    className={styles.documentStage}
                    aria-label={`${recommendations.length} mapped article drafts`}
                >
                    <div className={styles.documentStack}>
                        {rearRecommendations
                            .toReversed()
                            .map((recommendation, reversedIndex) => {
                                const actualIndex =
                                    rearRecommendations.length - reversedIndex;
                                return (
                                    <article
                                        className={styles.rearDocument}
                                        data-depth={actualIndex}
                                        key={recommendation.id}
                                        aria-hidden="true"
                                    />
                                );
                            })}

                        {firstRecommendation ? (
                            <article className={styles.frontDocument}>
                                <span className={styles.documentTab}>
                                    Draft 01
                                </span>
                                <h3>{firstRecommendation.recommendedTitle}</h3>
                                <div
                                    className={styles.articleBody}
                                    aria-hidden="true"
                                >
                                    <div className={styles.draftMetadata}>
                                        <span />
                                        <span />
                                        <span />
                                    </div>
                                    <div className={styles.draftSection}>
                                        <span
                                            className={
                                                styles.draftSectionHeading
                                            }
                                        />
                                        <div className={styles.draftParagraph}>
                                            <span />
                                            <span />
                                            <span />
                                            <span />
                                        </div>
                                    </div>
                                    <div className={styles.draftSection}>
                                        <span
                                            className={
                                                styles.draftSectionHeading
                                            }
                                        />
                                        <ul className={styles.draftBulletList}>
                                            <li>
                                                <span />
                                            </li>
                                            <li>
                                                <span />
                                            </li>
                                            <li>
                                                <span />
                                            </li>
                                            <li>
                                                <span />
                                            </li>
                                        </ul>
                                    </div>
                                    <div className={styles.draftSection}>
                                        <span
                                            className={
                                                styles.draftSectionHeading
                                            }
                                        />
                                        <div className={styles.draftParagraph}>
                                            <span />
                                            <span />
                                            <span />
                                            <span />
                                        </div>
                                    </div>
                                </div>
                                <span className={styles.reservedLabel}>
                                    Full draft available when you join the
                                    waitlist
                                </span>
                            </article>
                        ) : null}
                    </div>
                    {remainingCount > 0 ? (
                        <p className={styles.mappedCount}>
                            {remainingCount} more{' '}
                            {remainingCount === 1 ? 'article' : 'articles'}{' '}
                            mapped
                        </p>
                    ) : null}
                </section>
            </div>
        </div>
    );
}
