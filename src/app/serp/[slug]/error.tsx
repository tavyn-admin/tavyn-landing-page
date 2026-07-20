"use client";

import { COLORS } from "@/components/tokens";

type SerpReportErrorProps = {
  reset: () => void;
};

export default function SerpReportError({ reset }: SerpReportErrorProps) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: COLORS.bg,
        color: COLORS.text,
        padding: 24,
      }}
    >
      <section style={{ maxWidth: 460, textAlign: "center" }}>
        <h1 style={{ margin: "0 0 12px", fontSize: 24, fontWeight: 700, letterSpacing: 0 }}>Unable to load report</h1>
        <p style={{ margin: "0 0 24px", color: COLORS.textMuted, fontSize: 13, lineHeight: 1.6 }}>
          Something went wrong while loading this SERP report.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            border: `1px solid ${COLORS.divider}`,
            borderRadius: 8,
            background: COLORS.surface,
            color: COLORS.text,
            cursor: "pointer",
            font: "inherit",
            fontSize: 13,
            fontWeight: 600,
            padding: "10px 14px",
          }}
        >
          Try again
        </button>
      </section>
    </main>
  );
}
