"use client";

import { useState } from "react";

import styles from "./AnalysisScope.module.css";

type MetricTooltipProps = {
  id: string;
  label: string;
  description: string;
};

export default function MetricTooltip({ id, label, description }: MetricTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className={styles.tooltipWrap}
      data-open={open ? "true" : undefined}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={styles.tooltipTrigger}
        aria-label={`Show explanation for ${label}`}
        aria-describedby={id}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        ?
      </button>
      <span id={id} className={styles.tooltip} role="tooltip">
        {description}
      </span>
    </span>
  );
}
