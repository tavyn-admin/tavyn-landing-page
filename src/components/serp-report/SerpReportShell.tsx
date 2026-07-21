import Section from "@/components/Section";
import AnalysisScope from "@/components/serp-report/sections/AnalysisScope";
import { COLORS } from "@/components/tokens";
import type { AnalysisScopeData } from "@/lib/serp-report/schema";

type SerpReportShellProps = {
  analysisCoverage: AnalysisScopeData;
};

export default function SerpReportShell({ analysisCoverage }: SerpReportShellProps) {
  return (
    <main style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text }}>
      <Section>
        <AnalysisScope analysisCoverage={analysisCoverage} />
      </Section>
    </main>
  );
}
