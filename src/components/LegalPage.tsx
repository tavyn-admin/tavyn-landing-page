import Link from "next/link";

import { COLORS } from "./tokens";
import Footer from "./Footer";

export type LegalSection = { heading: string; paragraphs: string[] };

/**
 * Shared layout for the Privacy / Terms / Security document pages. Normal scrollable page
 * (not viewport-scaled), in the Tavyn dark theme.
 */
export default function LegalPage({
  title,
  lastUpdated,
  intro,
  sections,
}: {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <main style={{ background: COLORS.bg, color: COLORS.text, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: "1 0 auto", padding: "80px 24px" }}>
        <article className="doc-body" style={{ maxWidth: 896, margin: "0 auto" }}>
          <Link href="/" className="tv-link" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 10, marginBottom: 36 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ display: "block" }}>
              <path d="M18 12 H6 M12 6 L6 12 L12 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to home
          </Link>

          <p style={{ margin: "0 0 12px", fontSize: 9, fontWeight: 700, letterSpacing: "1.8px", textTransform: "uppercase", color: COLORS.textMuted }}>
            {lastUpdated}
          </p>
          <h1 style={{ margin: "0 0 18px", fontSize: 30, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.6px", color: COLORS.text }}>
            {title}
          </h1>
          <p style={{ margin: 0, fontSize: 11, lineHeight: 1.6, letterSpacing: "-0.11px", color: "#a7adb6" }}>{intro}</p>

          {sections.map((s) => (
            <section key={s.heading} style={{ marginTop: 32 }}>
              <h2 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, lineHeight: 1.4, letterSpacing: "-0.13px", color: COLORS.text }}>
                {s.heading}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {s.paragraphs.map((p, i) => (
                  <p key={i} style={{ fontSize: 10, lineHeight: 1.6, letterSpacing: "-0.1px", color: "#8f959e" }}>
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}

          <p style={{ marginTop: 40, fontSize: 9, lineHeight: 1.6, fontStyle: "italic", color: "#5b5b5b" }}>
            This page is provided for transparency and does not constitute legal advice.
          </p>
        </article>
      </div>
      <Footer />
    </main>
  );
}
