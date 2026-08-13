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
  fitDesignHeight = false,
  mobileFluid = false,
  background = "var(--serp-color-background, #050506)",
}: {
  children: ReactNode;
  designH?: number;
  designW?: number;
  id?: string;
  fitDesignHeight?: boolean;
  mobileFluid?: boolean;
  background?: string;
}) {
  return (
    <section
      id={id}
      className={`relative w-full flex justify-center ${fitDesignHeight ? "items-start overflow-visible" : "items-center overflow-hidden"}${mobileFluid ? " section-mobile-fluid" : ""}`}
      style={{
        height: fitDesignHeight ? `max(100vh, calc(${designH}px * var(--section-scale)))` : "100vh",
        background,
      }}
    >
      <div
        className={mobileFluid ? "section-mobile-fluid-canvas" : undefined}
        style={{
          width: designW,
          height: designH,
          transform: "scale(var(--section-scale))",
          transformOrigin: fitDesignHeight ? "top center" : "center center",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {children}
      </div>
    </section>
  );
}
