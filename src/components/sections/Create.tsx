import { COLORS, faderMask } from '../tokens';
import StepCaption from '../StepCaption';

/**
 * Create — email questionnaire panel on the left, SEO Brief with competitors + keywords
 * on the right. The two panels overlap slightly at their edges.
 */
export default function Create() {
    return (
        <>
            <div
                style={{
                    position: 'absolute',
                    top: 155,
                    bottom: 155,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <div
                    style={{
                        position: 'relative',
                        width: 943,
                        height: 353,
                        ...faderMask({
                            left: 12,
                            right: 12,
                            top: 9,
                            bottom: 22,
                        }),
                    }}
                >
                    <EmailQuestionnaire />
                    <SeoBrief />
                </div>
            </div>

            <StepCaption
                title="Create"
                description="Tavyn turns live SERP research into a detailed SEO brief, then gathers your expertise over email to create content grounded in your product and point of view."
            />
        </>
    );
}

/* ---------- Email Questionnaire (left) — rebuilt to match Figma 235:486 ---------- */

const ICON = '#8a8f98';

function EmailQuestionnaire() {
    return (
        <div
            style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 375,
                height: 353,
                background: COLORS.card,
                borderRadius: 27.464,
                overflow: 'hidden',
                padding: '20.598px 20.598px 0',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Options / toolbar bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 13.732 }}>
                <IconBack />
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 13.732,
                    }}
                >
                    <IconStar />
                    <IconInfo />
                    <IconTrash />
                    <span
                        style={{ width: 1, height: 12, background: '#2a2a2a' }}
                    />
                    <IconClock />
                    <IconDots />
                </div>
                <div
                    style={{
                        flex: '1 0 0',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        gap: 10,
                    }}
                >
                    <IconChevron dir="left" />
                    <IconChevron dir="right" />
                </div>
            </div>

            {/* Content frame */}
            <div
                style={{
                    flex: '1 0 0',
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 13.732,
                    paddingTop: 20.598,
                    overflow: 'hidden',
                }}
            >
                {/* Title row */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingLeft: 35.7,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                        }}
                    >
                        <span
                            style={{
                                fontWeight: 500,
                                fontSize: 13.732,
                                lineHeight: 1.12,
                                letterSpacing: '-0.27px',
                                color: '#fff',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            A few questions for your next blog
                        </span>
                        {/* orange double chevron */}
                        <svg
                            width="9"
                            height="9"
                            viewBox="0 0 12 12"
                            fill="none"
                        >
                            <path
                                d="M2 2 L6 6 L2 10"
                                stroke="#FF7400"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M6 2 L10 6 L6 10"
                                stroke="#FF7400"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                        }}
                    >
                        <IconExternal />
                        <IconPrint />
                    </div>
                </div>

                {/* Sender info */}
                <div
                    style={{ display: 'flex', alignItems: 'center', gap: 9.6 }}
                >
                    <div
                        style={{
                            width: 26.09,
                            height: 26.09,
                            flexShrink: 0,
                            borderRadius: '50%',
                            background: '#111',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <span
                            style={{
                                fontWeight: 900,
                                fontSize: 12.71,
                                lineHeight: 1,
                                letterSpacing: '-0.25px',
                                color: 'transparent',
                                background:
                                    'linear-gradient(to bottom, red, #ffc100)',
                                WebkitBackgroundClip: 'text',
                                backgroundClip: 'text',
                            }}
                        >
                            T
                        </span>
                    </div>
                    <div
                        style={{
                            flex: '1 0 0',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            gap: 2,
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <span
                                style={{
                                    fontWeight: 500,
                                    fontSize: 9.61,
                                    lineHeight: 1.12,
                                    letterSpacing: '-0.19px',
                                    color: '#fff',
                                }}
                            >
                                Tavyn
                            </span>
                            <IconReply />
                        </div>
                        <span
                            style={{
                                fontWeight: 300,
                                fontSize: 8.24,
                                lineHeight: 1.12,
                                letterSpacing: '-0.16px',
                                color: '#5b5b5b',
                            }}
                        >
                            agent@tavyn.com
                        </span>
                    </div>
                </div>

                {/* Email body card */}
                <div
                    style={{
                        background: '#0b0b0b',
                        borderRadius: 27.464,
                        width: 260.9,
                        height: 258.16,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        alignSelf: 'center',
                    }}
                >
                    {/* "Tavyn Agent" header with orange dot */}
                    <div
                        style={{
                            borderBottom: '0.69px solid #111',
                            padding: '17.165px 13.732px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 5,
                        }}
                    >
                        <span
                            style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background:
                                    'linear-gradient(to right, #FFC100, #FF7400, #FF0000)',
                                flexShrink: 0,
                            }}
                        />
                        <span
                            style={{
                                fontWeight: 500,
                                fontSize: 9.61,
                                letterSpacing: '-0.1px',
                                color: COLORS.text,
                            }}
                        >
                            Tavyn Agent
                        </span>
                    </div>

                    {/* Introduction */}
                    <div
                        style={{
                            padding: '13.732px 13.732px 0',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 13.732,
                        }}
                    >
                        <span
                            style={{
                                fontWeight: 300,
                                fontSize: 8.24,
                                lineHeight: 1.12,
                                letterSpacing: '-0.16px',
                                color: '#fff',
                            }}
                        >
                            Hi Signalyze,
                        </span>
                        <span
                            style={{
                                fontWeight: 400,
                                fontSize: 6.87,
                                lineHeight: 1.12,
                                letterSpacing: '-0.14px',
                                color: '#5b5b5b',
                            }}
                        >
                            I&apos;ve finished the SERP research for &quot;How
                            to Do SaaS SEO.&quot; Reply with your answers to the
                            two questions below, and I&apos;ll use them to bring
                            your product expertise and point of view into the
                            brief.
                        </span>
                    </div>

                    {/* Questions */}
                    <div style={{ padding: '20.598px 13.732px 0' }}>
                        <QuestionRow text="What language do your customers use to describe the SEO problem your product solves, especially in sales calls, support conversations, or reviews?" />
                    </div>
                    <div style={{ padding: '13.732px 13.732px 0' }}>
                        <QuestionRow text="Where does your approach differ from the advice or tools already ranking for this topic? What do you think they miss?" />
                    </div>

                    {/* Sign-off */}
                    <div
                        style={{
                            padding: '20.598px 13.732px 0',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6.87,
                        }}
                    >
                        <span
                            style={{
                                fontWeight: 400,
                                fontSize: 6.87,
                                lineHeight: 1.12,
                                letterSpacing: '-0.14px',
                                color: '#5b5b5b',
                            }}
                        >
                            Looking forward to your response!
                        </span>
                        <span
                            style={{
                                fontWeight: 300,
                                fontSize: 8.24,
                                lineHeight: 1.12,
                                letterSpacing: '-0.16px',
                                color: '#fff',
                            }}
                        >
                            Tavyn Agent
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function QuestionRow({ text }: { text: string }) {
    return (
        <div
            style={{
                display: 'flex',
                gap: 6.87,
                alignItems: 'flex-start',
                padding: '0 6.87px',
            }}
        >
            <span
                style={{
                    width: 5.49,
                    height: 5.49,
                    borderRadius: '50%',
                    background:
                        'linear-gradient(to right, #FFC100, #FF7400, #FF0000)',
                    flexShrink: 0,
                    marginTop: 1.5,
                }}
            />
            <span
                style={{
                    fontWeight: 300,
                    fontSize: 6.87,
                    lineHeight: 1.12,
                    letterSpacing: '-0.14px',
                    color: '#fffbfb',
                }}
            >
                {text}
            </span>
        </div>
    );
}

/* ---------- Inline toolbar icons (drawn to match Figma; sized in design px) ---------- */

function IconBack() {
    return (
        <svg width="9" height="9" viewBox="0 0 16 16" fill="none">
            <path
                d="M14 8 H3 M7 4 L3 8 L7 12"
                stroke={ICON}
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
function IconStar() {
    return (
        <svg width="9" height="9" viewBox="0 0 16 16" fill="none">
            <path
                d="M8 2 L9.8 6.1 L14 6.5 L10.9 9.3 L11.8 13.5 L8 11.2 L4.2 13.5 L5.1 9.3 L2 6.5 L6.2 6.1 Z"
                stroke={ICON}
                strokeWidth="1.1"
                strokeLinejoin="round"
            />
        </svg>
    );
}
function IconInfo() {
    return (
        <svg width="9" height="9" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.2" stroke={ICON} strokeWidth="1.1" />
            <path
                d="M8 4.6 V8.4"
                stroke={ICON}
                strokeWidth="1.3"
                strokeLinecap="round"
            />
            <circle cx="8" cy="11" r="0.7" fill={ICON} />
        </svg>
    );
}
function IconTrash() {
    return (
        <svg width="9" height="9" viewBox="0 0 16 16" fill="none">
            <path
                d="M3.5 4.5 H12.5 M6 4.5 V3.2 H10 V4.5 M4.6 4.5 L5.2 13 H10.8 L11.4 4.5"
                stroke={ICON}
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
function IconClock() {
    return (
        <svg width="9" height="9" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.2" stroke={ICON} strokeWidth="1.1" />
            <path
                d="M8 4.6 V8 L10.4 9.6"
                stroke={ICON}
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
function IconDots() {
    return (
        <svg width="9" height="9" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="3.5" r="1.1" fill={ICON} />
            <circle cx="8" cy="8" r="1.1" fill={ICON} />
            <circle cx="8" cy="12.5" r="1.1" fill={ICON} />
        </svg>
    );
}
function IconChevron({ dir }: { dir: 'left' | 'right' }) {
    return (
        <svg
            width="7"
            height="7"
            viewBox="0 0 16 16"
            fill="none"
            style={{ transform: dir === 'left' ? 'rotate(180deg)' : undefined }}
        >
            <path
                d="M6 3 L11 8 L6 13"
                stroke={ICON}
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
function IconExternal() {
    return (
        <svg width="9" height="9" viewBox="0 0 16 16" fill="none">
            <path
                d="M6 3 H3 V13 H13 V10 M9.5 3 H13 V6.5 M13 3 L7.5 8.5"
                stroke={ICON}
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
function IconPrint() {
    return (
        <svg width="9" height="9" viewBox="0 0 16 16" fill="none">
            <path
                d="M4.5 6 V2.5 H11.5 V6 M4.5 11 H3 V6.5 H13 V11 H11.5 M4.8 9.5 H11.2 V13.5 H4.8 Z"
                stroke={ICON}
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
function IconReply() {
    return (
        <svg width="9" height="9" viewBox="0 0 16 16" fill="none">
            <path
                d="M6 4 L2.5 7.5 L6 11 M2.5 7.5 H9 A4 4 0 0 1 13 11.5 V12.5"
                stroke={ICON}
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

/* ---------- SEO Brief (right, overlaid) ---------- */

const COMPETITORS: {
    name: string;
    url: string;
    score: number;
    tone: 'green' | 'orange' | 'red';
}[] = [
    { name: 'Rankforge', url: 'rankforge.com', score: 92, tone: 'green' },
    { name: 'Clarivue', url: 'clarivue.ai', score: 91, tone: 'green' },
    { name: 'Signalyze', url: 'signalyze.co', score: 85, tone: 'orange' },
    { name: 'Pathwise', url: 'pathwise.io', score: 82, tone: 'orange' },
    { name: 'Growstack', url: 'growstack.com', score: 42, tone: 'red' },
];

const KEYWORDS: {
    name: string;
    score: number;
    tone: 'green' | 'orange' | 'red';
}[] = [
    { name: 'saas seo', score: 95, tone: 'green' },
    { name: 'how to do seo for saas', score: 92, tone: 'green' },
    { name: 'saas seo keyword strategy', score: 90, tone: 'green' },
    { name: 'b2b saas seo', score: 85, tone: 'orange' },
    { name: 'keyword research process', score: 85, tone: 'red' },
];

function ScorePill({
    value,
    tone,
}: {
    value: number | string;
    tone: 'green' | 'orange' | 'red';
}) {
    const bg =
        tone === 'green'
            ? '#09310f'
            : tone === 'orange'
              ? '#633417'
              : '#421212';
    return (
        <span
            style={{
                background: bg,
                borderRadius: 13.7,
                padding: '1.4px 13.7px',
                fontWeight: 400,
                fontSize: 6.9,
                lineHeight: 1.12,
                letterSpacing: '-0.14px',
                color: '#fff',
                whiteSpace: 'nowrap',
            }}
        >
            {value}
        </span>
    );
}

function SeoBrief() {
    return (
        <div
            style={{
                position: 'absolute',
                left: 357,
                top: 22,
                width: 586,
                height: 310,
                background: COLORS.card,
                borderRadius: 27,
                overflow: 'hidden',
                padding: 27.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 25,
                // Extra bottom fade on the SEO Brief specifically (the email box keeps the lighter
                // fade from the illustration root).
                ...faderMask({ bottom: 34 }),
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 13.7 }}>
                <span
                    style={{
                        flex: '1 0 0',
                        fontWeight: 500,
                        fontSize: 16.5,
                        lineHeight: 1.12,
                        letterSpacing: '-0.33px',
                        color: '#fff',
                    }}
                >
                    SEO Brief:
                </span>
                <span
                    style={{
                        width: 5.5,
                        height: 5.5,
                        borderRadius: '50%',
                        background:
                            'linear-gradient(to right, #FFC100, #FF7400, #FF0000)',
                    }}
                />
            </div>

            {/* Two columns */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 14,
                }}
            >
                {/* Left column */}
                <div
                    style={{
                        width: 270,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 20,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                        }}
                    >
                        <span
                            style={{
                                fontWeight: 400,
                                fontSize: 8.2,
                                lineHeight: 1.12,
                                letterSpacing: '-0.16px',
                                color: '#5b5b5b',
                            }}
                        >
                            Target Article:
                        </span>
                        <p
                            style={{
                                margin: 0,
                                fontWeight: 200,
                                fontSize: 13.7,
                                lineHeight: 1.12,
                                letterSpacing: '-0.27px',
                                color: '#fff',
                            }}
                        >
                            How to Do SaaS SEO: The Complete Guide
                        </p>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 11,
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: 8.2,
                                color: '#5b5b5b',
                            }}
                        >
                            <span>Top-Ranking Competitors</span>
                            <span>Authority</span>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 12,
                            }}
                        >
                            {COMPETITORS.map((c) => (
                                <div
                                    key={c.name}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0 5.5px 6.9px',
                                        borderBottom: `0.7px solid rgba(255,255,255,0.03)`,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            gap: 6.9,
                                            alignItems: 'center',
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontWeight: 300,
                                                fontSize: 9,
                                                letterSpacing: '-0.18px',
                                                color: '#fff',
                                            }}
                                        >
                                            {c.name}
                                        </span>
                                        <span
                                            style={{
                                                fontWeight: 400,
                                                fontSize: 8,
                                                letterSpacing: '-0.16px',
                                                color: '#5b5b5b',
                                            }}
                                        >
                                            {c.url}
                                        </span>
                                    </div>
                                    <ScorePill value={c.score} tone={c.tone} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right column */}
                <div
                    style={{
                        flex: '1 0 0',
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                        paddingLeft: 12,
                    }}
                >
                    {/* Indicators — nudged up so the Keywords/Relevance row lines up with the
              Top-Ranking Competitors/Authority row in the left column. */}
                    <div
                        style={{
                            background: '#0b0b0b',
                            borderRadius: 13.7,
                            padding: '9.6px 3px',
                            display: 'flex',
                            height: 48,
                            marginTop: -7,
                        }}
                    >
                        <div
                            style={{
                                flex: '1 0 0',
                                padding: '0 11px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 5.5,
                                borderRight: '0.7px solid #111',
                            }}
                        >
                            <span
                                style={{
                                    fontWeight: 400,
                                    fontSize: 6.9,
                                    letterSpacing: '-0.14px',
                                    color: '#5b5b5b',
                                }}
                            >
                                Estimated Monthly Traffic
                            </span>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <span
                                    style={{
                                        fontWeight: 300,
                                        fontSize: 9.6,
                                        letterSpacing: '-0.19px',
                                        color: '#fff',
                                    }}
                                >
                                    High
                                </span>
                                <ScorePill value="3.9k" tone="green" />
                            </div>
                        </div>
                        <div
                            style={{
                                flex: '1 0 0',
                                padding: '0 11px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 5.5,
                            }}
                        >
                            <span
                                style={{
                                    fontWeight: 400,
                                    fontSize: 6.9,
                                    letterSpacing: '-0.14px',
                                    color: '#5b5b5b',
                                }}
                            >
                                Average Domain Authority:
                            </span>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <span
                                    style={{
                                        fontWeight: 300,
                                        fontSize: 9.6,
                                        letterSpacing: '-0.19px',
                                        color: '#fff',
                                    }}
                                >
                                    Medium
                                </span>
                                <ScorePill value="62" tone="green" />
                            </div>
                        </div>
                    </div>

                    {/* Keywords */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 11,
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: 8.2,
                                color: '#5b5b5b',
                            }}
                        >
                            <span>Keywords:</span>
                            <span>Relevance:</span>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 12,
                            }}
                        >
                            {KEYWORDS.map((k) => (
                                <div
                                    key={k.name}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0 5.5px 6.9px',
                                        borderBottom:
                                            '0.7px solid rgba(255,255,255,0.03)',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontWeight: 300,
                                            fontSize: 9,
                                            letterSpacing: '-0.18px',
                                            color: '#fff',
                                        }}
                                    >
                                        {k.name}
                                    </span>
                                    <ScorePill value={k.score} tone={k.tone} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
