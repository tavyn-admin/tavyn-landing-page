'use client';

import { useState } from 'react';
import Link from 'next/link';
import { COLORS } from '@/components/tokens';
import Footer from '@/components/Footer';

const FAQS: { q: string; a: string }[] = [
    {
        q: 'Who is Tavyn AI for?',
        a: 'Tavyn is built for founder-led SaaS teams that know content matters but do not want to manage a heavy blog workflow themselves.',
    },
    {
        q: 'Is Tavyn just another AI writer?',
        a: 'No. Tavyn is built around blog ops: planning, drafting, revisions, approval, and publishing readiness through an email-first workflow.',
    },
    {
        q: 'Do I have to use a dashboard?',
        a: 'No. The workflow is email-first, with lightweight visibility when you want to review, edit, or check status more closely.',
    },
    {
        q: 'How does publishing work?',
        a: 'Approved content is prepared for publishing through GitHub or your CMS workflow, depending on your setup.',
    },
    {
        q: 'Can I request revisions by email?',
        a: 'Yes. You can reply with changes, review updates, and approve when the post is ready.',
    },
    {
        q: 'Does Tavyn guarantee SEO growth?',
        a: 'No. Tavyn is designed to make consistent, search-aware blog execution easier to maintain, not to promise guaranteed SEO results.',
    },
    {
        q: 'Is Tavyn a fit for large content teams?',
        a: 'Probably not. Tavyn is optimized for lean, founder-led teams, not large editorial organizations with complex collaboration workflows.',
    },
];

export default function FaqPage() {
    const [open, setOpen] = useState<number>(0);

    return (
        <main
            style={{
                background: COLORS.bg,
                color: COLORS.text,
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <div style={{ flex: '1 0 auto', padding: '56px 24px 88px' }}>
                <div style={{ maxWidth: 768, margin: '0 auto' }}>
                    <Link
                        href="/"
                        className="tv-link"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: 10,
                            marginBottom: 36,
                        }}
                    >
                        <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            style={{ display: 'block' }}
                        >
                            <path
                                d="M18 12 H6 M12 6 L6 12 L12 18"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        Back to home
                    </Link>

                    <h1
                        style={{
                            margin: '0 0 32px',
                            textAlign: 'center',
                            fontSize: 24,
                            fontWeight: 700,
                            letterSpacing: '-0.6px',
                            color: COLORS.text,
                        }}
                    >
                        FAQ
                    </h1>

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 14,
                        }}
                    >
                        {FAQS.map((item, i) => {
                            const isOpen = open === i;
                            return (
                                <div
                                    key={item.q}
                                    style={{
                                        background: COLORS.card,
                                        border: `1px solid ${isOpen ? 'rgba(255,116,0,0.35)' : 'rgba(255,255,255,0.06)'}`,
                                        borderRadius: 20,
                                        overflow: 'hidden',
                                        transition: 'border-color 0.2s ease',
                                    }}
                                >
                                    <button
                                        onClick={() => setOpen(isOpen ? -1 : i)}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: 16,
                                            padding: '16px 24px',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            fontFamily: 'inherit',
                                        }}
                                    >
                                        <span
                                            className={
                                                isOpen
                                                    ? 'brand-text-gradient'
                                                    : undefined
                                            }
                                            style={{
                                                fontSize: 12,
                                                fontWeight: 600,
                                                letterSpacing: '-0.13px',
                                                color: isOpen
                                                    ? undefined
                                                    : COLORS.text,
                                            }}
                                        >
                                            {item.q}
                                        </span>
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            style={{
                                                flexShrink: 0,
                                                color: isOpen
                                                    ? '#FF7400'
                                                    : '#5b5b5b',
                                                transform: isOpen
                                                    ? 'rotate(180deg)'
                                                    : 'none',
                                                transition:
                                                    'transform 0.3s ease, color 0.2s ease',
                                            }}
                                        >
                                            <path
                                                d="m6 9 6 6 6-6"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </button>

                                    {/* Smoothly animate height via grid-template-rows 0fr → 1fr. */}
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateRows: isOpen
                                                ? '1fr'
                                                : '0fr',
                                            transition:
                                                'grid-template-rows 0.3s ease',
                                        }}
                                    >
                                        <div style={{ overflow: 'hidden' }}>
                                            <p
                                                style={{
                                                    margin: 0,
                                                    padding: '0 24px 22px',
                                                    fontSize: 10,
                                                    lineHeight: 1.6,
                                                    letterSpacing: '-0.1px',
                                                    color: '#8f959e',
                                                }}
                                            >
                                                {item.a}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
