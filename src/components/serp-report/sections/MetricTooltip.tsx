"use client";

import { useState } from "react";

import styles from "./MetricTooltip.module.css";

type MetricTooltipProps = {
  id: string;
  label: string;
  description: string;
  align?: "start" | "center" | "end";
  side?: "top" | "bottom";
};

export default function MetricTooltip({ id, label, description, align = "center", side = "bottom" }: MetricTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className={styles.tooltipWrap}
      data-align={align}
      data-side={side}
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
