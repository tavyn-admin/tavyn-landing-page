import type { ReactNode } from "react";
import { DESIGN_H, DESIGN_W } from "./tokens";

/**
 * Wraps a section that was designed at 1440×780 (or a different design height for the CTA).
 * The child renders at its native design pixels; the wrapper scales it by viewport height
 * via `transform: scale(var(--section-scale))`. Extra horizontal space fills with the
 * dark page background — matching the spec.
 */
export default function Section({
  children,
  designH = DESIGN_H,
  designW = DESIGN_W,
  id,
}: {
  children: ReactNode;
  designH?: number;
  designW?: number;
  id?: string;
}) {
  return (
    <section
      id={id}
      className="relative w-full flex items-center justify-center overflow-hidden"
      style={{ height: "100vh", background: "var(--serp-color-background, #050506)" }}
    >
      <div
        style={{
          width: designW,
          height: designH,
          transform: "scale(var(--section-scale))",
          transformOrigin: "center center",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {children}
      </div>
    </section>
  );
}
