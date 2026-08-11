import SerpReportSection from "@/components/serp-report/SerpReportSection";
import type { ContentPlanData } from "@/lib/serp-report/schema";
import RecommendedContentPlanCards from "./RecommendedContentPlanCards";
import styles from "./RecommendedContentPlan.module.css";

type RecommendedContentPlanProps = {
  contentPlan: ContentPlanData;
  companyName: string;
};

export default function RecommendedContentPlan({ contentPlan, companyName }: RecommendedContentPlanProps) {
  return (
    <SerpReportSection designH={1080} background="transparent">
      <div className={styles.root}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Your first content sprint</p>
          <h1 className={styles.title}>The first three articles Tavyn would publish for {companyName}</h1>
          <p className={styles.subtitle}>A prioritized, evidence-backed plan built from your strongest search opportunities.</p>
        </header>

        <div className={styles.contentFrame}>
          <RecommendedContentPlanCards
            recommendations={contentPlan.recommendations}
            averageOpportunityScore={contentPlan.summary.average_opportunity_score}
            companyName={companyName}
          />
        </div>
      </div>
    </SerpReportSection>
  );
}
