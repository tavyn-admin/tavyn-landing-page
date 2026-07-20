import { BRAND_GRADIENT, COLORS } from "@/components/tokens";
import type { SerpReportArtifact } from "@/lib/serp-report/schema";

type SerpReportShellProps = {
  artifact: SerpReportArtifact;
};

const metricStyle = {
  padding: "16px",
  border: `1px solid ${COLORS.dividerSoft}`,
  borderRadius: 8,
  background: COLORS.surface,
} as const;

export default function SerpReportShell({ artifact }: SerpReportShellProps) {
  const metrics = [
    { label: "Company name", value: artifact.company.name },
    { label: "Website URL", value: artifact.website_url },
    { label: "Report slug", value: artifact.report_slug },
    { label: "Schema version", value: artifact.schema_version },
    { label: "Status", value: artifact.status },
    { label: "Validated queries", value: artifact.validated_queries.queries.length },
    { label: "Competitors", value: artifact.competitor_landscape.competitors.length },
    { label: "Content-plan items", value: artifact.content_plan.items.length },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        color: COLORS.text,
        padding: "56px 24px",
      }}
    >
      <section style={{ maxWidth: 920, margin: "0 auto" }}>
        <div
          aria-hidden="true"
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: BRAND_GRADIENT,
            marginBottom: 28,
          }}
        />
        <p
          style={{
            margin: "0 0 12px",
            color: COLORS.textMuted,
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: 0,
          }}
        >
          SERP report loaded
        </p>
        <h1 style={{ margin: "0 0 32px", fontSize: 28, lineHeight: 1.15, fontWeight: 700, letterSpacing: 0 }}>
          {artifact.company.name}
        </h1>

        {/* Temporary data-verification shell. Replace section-by-section with the Figma report design. */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {metrics.map((metric) => (
            <div key={metric.label} style={metricStyle}>
              <div style={{ color: COLORS.textMuted, fontSize: 11, lineHeight: 1.4, marginBottom: 8 }}>{metric.label}</div>
              <div style={{ color: COLORS.text, fontSize: 15, lineHeight: 1.35, fontWeight: 600, overflowWrap: "anywhere" }}>
                {metric.value}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
