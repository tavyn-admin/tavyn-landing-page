import type { ContentPlanData } from "@/lib/serp-report/schema";
import RecommendedContentPlanCards from "./RecommendedContentPlanCards";
import styles from "./RecommendedContentPlan.module.css";

type RecommendedContentPlanProps = {
  contentPlan: ContentPlanData;
};

export default function RecommendedContentPlan({ contentPlan }: RecommendedContentPlanProps) {
  return (
    <div className={styles.root}>
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
