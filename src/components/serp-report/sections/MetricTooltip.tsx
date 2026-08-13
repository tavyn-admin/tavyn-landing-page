'use client';

import { useEffect, useRef, useState } from 'react';

import styles from './MetricTooltip.module.css';

type MetricTooltipProps = {
    id: string;
    label: string;
    description: string;
    align?: 'start' | 'center' | 'end';
    side?: 'top' | 'bottom';
};

export default function MetricTooltip({
    id,
    label,
    description,
    align = 'center',
    side = 'bottom',
}: MetricTooltipProps) {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef<HTMLSpanElement | null>(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        const closeWhenClickingOutside = (event: PointerEvent) => {
            if (!wrapRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('pointerdown', closeWhenClickingOutside);

        return () =>
            document.removeEventListener(
                'pointerdown',
                closeWhenClickingOutside,
            );
    }, [open]);

    return (
        <span
            ref={wrapRef}
            className={styles.tooltipWrap}
            data-align={align}
            data-side={side}
            data-open={open ? 'true' : undefined}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <button
                type="button"
                className={styles.tooltipTrigger}
                aria-label={`Show explanation for ${label}`}
                aria-describedby={id}
                aria-expanded={open}
                onClick={() => setOpen(true)}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
                onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                        setOpen(false);
                        event.currentTarget.blur();
                    }
                }}
            >
                ?
            </button>
            <span id={id} className={styles.tooltip} role="tooltip">
                {description}
            </span>
        </span>
    );
}
