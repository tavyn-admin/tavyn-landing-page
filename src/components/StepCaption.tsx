import { COLORS } from './tokens';

/**
 * Bottom-of-section caption used on every step page. Left: title + description.
 * Right: a "More →" marker.
 */
export default function StepCaption({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div
            style={{
                position: 'absolute',
                left: 150,
                right: 150,
                bottom: 50,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
            }}
        >
            <div
                style={{
                    flex: '1 0 0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                }}
            >
                <p
                    style={{
                        margin: 0,
                        fontWeight: 600,
                        fontSize: 18,
                        lineHeight: 1.28,
                        letterSpacing: '-0.18px',
                        color: COLORS.text,
                    }}
                >
                    {title}
                </p>
                <p
                    style={{
                        margin: 0,
                        fontWeight: 400,
                        fontSize: 12,
                        lineHeight: 1.6,
                        letterSpacing: '-0.06px',
                        color: COLORS.textMuted,
                    }}
                >
                    {description}
                </p>
            </div>
            <div
                style={{
                    flex: '1 0 0',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: 5,
                    paddingLeft: 36,
                }}
            >
                <span
                    style={{
                        fontWeight: 300,
                        fontSize: 12,
                        lineHeight: 1.6,
                        letterSpacing: '-0.12px',
                        color: '#fff',
                    }}
                >
                    More →
                </span>
            </div>
        </div>
    );
}
