import Section from "@/components/Section";
import AnalysisScope from "@/components/serp-report/sections/AnalysisScope";
import CompanyProductProfile from "@/components/serp-report/sections/CompanyProductProfile";
import CompetitorLandscape from "@/components/serp-report/sections/CompetitorLandscape";
import QueryAnalysis from "@/components/serp-report/sections/QueryAnalysis";
import RecommendedContentPlan from "@/components/serp-report/sections/RecommendedContentPlan";
import ReportCta from "@/components/serp-report/sections/ReportCta";
import ReportOverview from "@/components/serp-report/sections/ReportOverview";
import type { SerpReportData } from "@/lib/serp-report/schema";
import styles from "./SerpReportTheme.module.css";

type SerpReportShellProps = {
  reportData: SerpReportData;
};

export default function SerpReportShell({ reportData }: SerpReportShellProps) {
  return (
    <main className={styles.theme}>
      <Section>
        <ReportOverview data={reportData.reportOverview} />
      </Section>

      <Section>
        <CompanyProductProfile company={reportData.company} />
      </Section>

      <Section>
        <AnalysisScope analysisCoverage={reportData.analysisScope} />
      </Section>

      <Section>
        <QueryAnalysis
          summary={reportData.queryAnalysisSummary}
          queries={reportData.queryOverview}
          opportunityPoints={reportData.searchOpportunityPoints}
          priorityOpportunityCount={reportData.reportOverview.recommendationsSelected}
        />
      </Section>

      <Section>
        <CompetitorLandscape data={reportData.competitorLandscape} />
      </Section>

      <RecommendedContentPlan contentPlan={reportData.contentPlan} companyName={reportData.company.name} />

      <Section>
        <ReportCta />
      </Section>
    </main>
  );
}
