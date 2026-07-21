import Section from "@/components/Section";
import AnalysisScope from "@/components/serp-report/sections/AnalysisScope";
import CompanyProductProfile from "@/components/serp-report/sections/CompanyProductProfile";
import CompetitorLandscape from "@/components/serp-report/sections/CompetitorLandscape";
import QueryAnalysis from "@/components/serp-report/sections/QueryAnalysis";
import ReportOverview from "@/components/serp-report/sections/ReportOverview";
import { COLORS } from "@/components/tokens";
import type { SerpReportData } from "@/lib/serp-report/schema";

type SerpReportShellProps = {
  reportData: SerpReportData;
};

export default function SerpReportShell({ reportData }: SerpReportShellProps) {
  return (
    <main style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text }}>
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
        />
      </Section>

      <Section>
        <CompetitorLandscape data={reportData.competitorLandscape} />
      </Section>
    </main>
  );
}
