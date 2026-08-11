import AnalysisScope from "@/components/serp-report/sections/AnalysisScope";
import CompanyProductProfile from "@/components/serp-report/sections/CompanyProductProfile";
import CompetitorLandscape from "@/components/serp-report/sections/CompetitorLandscape";
import QueryAnalysis from "@/components/serp-report/sections/QueryAnalysis";
import RecommendedContentPlan from "@/components/serp-report/sections/RecommendedContentPlan";
import ReportCta from "@/components/serp-report/sections/ReportCta";
import ReportOverview from "@/components/serp-report/sections/ReportOverview";
import SerpReportSection from "@/components/serp-report/SerpReportSection";
import type { SerpReportData } from "@/lib/serp-report/schema";
import styles from "./SerpReportTheme.module.css";

type SerpReportShellProps = {
  reportData: SerpReportData;
};

export default function SerpReportShell({ reportData }: SerpReportShellProps) {
  return (
    <main className={styles.theme}>
      <SerpReportSection>
        <ReportOverview data={reportData.reportOverview} />
      </SerpReportSection>

      <SerpReportSection>
        <CompanyProductProfile company={reportData.company} />
      </SerpReportSection>

      <SerpReportSection>
        <AnalysisScope analysisCoverage={reportData.analysisScope} />
      </SerpReportSection>

      <SerpReportSection>
        <QueryAnalysis
          companyName={reportData.company.name}
          summary={reportData.queryAnalysisSummary}
          queries={reportData.queryOverview}
          opportunityPoints={reportData.searchOpportunityPoints}
          priorityOpportunityCount={reportData.reportOverview.recommendationsSelected}
        />
      </SerpReportSection>

      <div id="competitor-landscape" style={{ scrollMarginTop: 96 }}>
        <SerpReportSection>
          <CompetitorLandscape data={reportData.competitorLandscape} />
        </SerpReportSection>
      </div>

      <div className={styles.closingSequence}>
        <div id="recommended-content-plan" style={{ scrollMarginTop: 96 }}>
          <RecommendedContentPlan contentPlan={reportData.contentPlan} companyName={reportData.company.name} />
        </div>

        <SerpReportSection background="transparent">
          <ReportCta companyName={reportData.company.name} />
        </SerpReportSection>
      </div>
    </main>
  );
}
