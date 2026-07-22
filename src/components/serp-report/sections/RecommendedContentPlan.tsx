import type { CSSProperties } from "react";

import { BRAND_TEXT_GRADIENT, COLORS } from "@/components/tokens";
import type { ContentPlanData } from "@/lib/serp-report/schema";
import RecommendedContentPlanCards from "./RecommendedContentPlanCards";
import styles from "./RecommendedContentPlan.module.css";

type RecommendedContentPlanProps = {
  contentPlan: ContentPlanData;
};

export default function RecommendedContentPlan({ contentPlan }: RecommendedContentPlanProps) {
  const tokenVars = {
    "--content-plan-bg": COLORS.bg,
    "--content-plan-card": COLORS.card,
    "--content-plan-muted": COLORS.textMuted,
    "--content-plan-gradient": BRAND_TEXT_GRADIENT,
  } as CSSProperties;

  return (
    <div className={styles.root} style={tokenVars}>
      <header className={styles.header}>
        <h1 className={styles.title}>Recommended Content Plan</h1>
        <p className={styles.subtitle}>
          Tavyn has mapped the path from search opportunity to execution. The highest-impact opportunities are ready to
          act on.
        </p>
      </header>

      <div className={styles.contentFrame}>
        <RecommendedContentPlanCards recommendations={contentPlan.recommendations} />
      </div>
    </div>
  );
}
