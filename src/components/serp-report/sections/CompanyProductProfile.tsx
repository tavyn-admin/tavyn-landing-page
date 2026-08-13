'use client';

import { useEffect, useRef, type CSSProperties } from 'react';

import pageStyles from '@/components/serp-report/SerpReportPage.module.css';
import type { SerpReportCompany } from '@/lib/serp-report/schema';
import styles from './CompanyProductProfile.module.css';

const sectionIndicatorSrc =
    '/serp-report/company-profile/section-indicator.svg';

type CompanyProductProfileProps = {
    company: SerpReportCompany;
};

function lowercaseSentenceItem(title: string) {
    if (title.startsWith('GitHub')) {
        return title;
    }

    return `${title.charAt(0).toLowerCase()}${title.slice(1)}`;
}

function formatList(items: string[]) {
    if (items.length === 0) {
        return '';
    }

    if (items.length === 1) {
        return items[0];
    }

    if (items.length === 2) {
        return `${items[0]} and ${items[1]}`;
    }

    return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function getDifferentiatorSummary(company: SerpReportCompany) {
    return formatList(
        company.primary_differentiators
            .slice(0, 3)
            .map((item) => lowercaseSentenceItem(item.title)),
    );
}

function formatPossessiveName(name: string) {
    return `${name}'s`;
}

export default function CompanyProductProfile({
    company,
}: CompanyProductProfileProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const displayedDifferentiators = company.primary_differentiators.slice(
        0,
        3,
    );
    const differentiatorGridStyle = {
        '--differentiator-count': displayedDifferentiators.length,
    } as CSSProperties;
    const differentiatorSummary = getDifferentiatorSummary(company);
    const possessiveCompanyName = formatPossessiveName(company.name);

    useEffect(() => {
        const root = rootRef.current;

        if (
            !root ||
            !window.IntersectionObserver ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ) {
            return;
        }

        root.dataset.motion = 'pending';
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry?.isIntersecting) return;

                root.dataset.motion = 'active';
                observer.disconnect();
            },
            { threshold: 0.25 },
        );

        observer.observe(root);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={rootRef} className={`${pageStyles.page} ${styles.root}`}>
            <header className={`${pageStyles.header} ${styles.profileHeader}`}>
                <h1 className={`${pageStyles.title} ${styles.profileTitle}`}>
                    {possessiveCompanyName} Company and Product Profile
                </h1>
                <p
                    className={`${pageStyles.subtitle} ${styles.profileDescription}`}
                >
                    The business context used to determine which search
                    opportunities are genuinely relevant to {company.name}.
                </p>
            </header>

            <div className={pageStyles.primaryContent}>
                <div className={styles.content}>
                    <div className={styles.topCards}>
                        <section
                            className={`${styles.card} ${styles.productCard}`}
                            aria-labelledby="company-product-profile-product"
                        >
                            <div className={styles.sectionHeader}>
                                <img
                                    className={styles.sectionIndicator}
                                    src={sectionIndicatorSrc}
                                    alt=""
                                    aria-hidden="true"
                                />
                                <h2 id="company-product-profile-product">
                                    Product
                                </h2>
                            </div>

                            <div className={styles.infoStack}>
                                <div className={styles.infoBlock}>
                                    <h3>Product Category</h3>
                                    <p>{company.product_category}</p>
                                </div>
                                <div className={styles.infoBlock}>
                                    <h3>Product Summary</h3>
                                    <p>{company.product_summary}</p>
                                </div>
                                <div className={styles.infoBlock}>
                                    <h3>Positioning and Angle</h3>
                                    <p>{company.product_angle}</p>
                                </div>
                            </div>
                        </section>

                        <section
                            className={`${styles.card} ${styles.audienceCard}`}
                            aria-labelledby="company-product-profile-audience"
                        >
                            <div className={styles.sectionHeader}>
                                <img
                                    className={styles.sectionIndicator}
                                    src={sectionIndicatorSrc}
                                    alt=""
                                    aria-hidden="true"
                                />
                                <h2 id="company-product-profile-audience">
                                    Audience &amp; Category
                                </h2>
                            </div>

                            <div className={styles.infoStack}>
                                <div className={styles.infoBlock}>
                                    <h3>Primary Audience</h3>
                                    <p>{company.primary_icp.name}</p>
                                    <p className={styles.description}>
                                        {company.primary_icp.description}
                                    </p>
                                </div>
                                <div className={styles.infoBlock}>
                                    <h3>Category Perspective</h3>
                                    <p>{company.category_point_of_view}</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <section
                        className={styles.differentiatorsCard}
                        aria-labelledby="company-product-profile-differentiators"
                    >
                        <div className={styles.sectionHeader}>
                            <img
                                className={styles.sectionIndicator}
                                src={sectionIndicatorSrc}
                                alt=""
                                aria-hidden="true"
                            />
                            <h2 id="company-product-profile-differentiators">
                                Key Differentiators
                            </h2>
                        </div>

                        <div
                            className={styles.differentiatorGrid}
                            style={differentiatorGridStyle}
                        >
                            {displayedDifferentiators.map(
                                (differentiator, index) => (
                                    <article
                                        className={styles.differentiator}
                                        key={`${index}-${differentiator.title}`}
                                    >
                                        <div
                                            className={
                                                styles.differentiatorHeader
                                            }
                                        >
                                            <span
                                                className={styles.badge}
                                                aria-hidden="true"
                                            >
                                                {index + 1}
                                            </span>
                                            <h3>{differentiator.title}</h3>
                                        </div>
                                        <p>{differentiator.description}</p>
                                    </article>
                                ),
                            )}
                        </div>
                    </section>
                </div>

                <section
                    className={`${pageStyles.keySummary} ${styles.insight}`}
                    aria-labelledby="company-product-profile-summary"
                >
                    <h2
                        id="company-product-profile-summary"
                        className={styles.insightTitle}
                    >
                        Tavyn discovers {possessiveCompanyName} product,
                        audience, and what makes you different.
                    </h2>
                    <p className={styles.insightDescription}>
                        {company.name} operates in the{' '}
                        <strong>{company.product_category}</strong> category for{' '}
                        <strong>{company.primary_icp.name}</strong>. Its
                        differentiation centers on {differentiatorSummary},
                        creating a clear search focus around the problems this
                        audience is trying to solve and the workflows the
                        product supports.
                    </p>
                </section>
            </div>
        </div>
    );
}
