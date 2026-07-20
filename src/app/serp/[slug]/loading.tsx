import { BRAND_GRADIENT, COLORS } from "@/components/tokens";

export default function Loading() {
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
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span aria-hidden="true" style={{ width: 18, height: 18, borderRadius: "50%", background: BRAND_GRADIENT }} />
        <span style={{ color: COLORS.textMuted, fontSize: 13, fontWeight: 500, letterSpacing: 0 }}>Loading SERP report...</span>
      </div>
    </main>
  );
}
