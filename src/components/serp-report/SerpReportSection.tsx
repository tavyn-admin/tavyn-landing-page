"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { DESIGN_H, DESIGN_W } from "@/components/tokens";

type ReportSectionLayout = {
  designHeight: number;
  scale: number;
};

export default function SerpReportSection({
  children,
  designH = DESIGN_H,
  designW = DESIGN_W,
  background = "var(--serp-color-background, #050506)",
}: {
  children: ReactNode;
  designH?: number;
  designW?: number;
  background?: string;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<ReportSectionLayout>({
    designHeight: designH,
    scale: 1,
  });

  useLayoutEffect(() => {
    let animationFrame = 0;

    const updateLayout = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        const measuredHeight = Math.max(designH, Math.ceil(contentRef.current?.scrollHeight ?? designH));
        const nextScale = Math.min(window.innerWidth / designW, window.innerHeight / designH);

        setLayout((currentLayout) =>
          currentLayout.designHeight === measuredHeight && currentLayout.scale === nextScale
            ? currentLayout
            : { designHeight: measuredHeight, scale: nextScale }
        );
      });
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);

    const resizeObserver = new ResizeObserver(updateLayout);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateLayout);
    };
  }, [designH, designW]);

  const sectionVariables = {
    "--report-section-scale": layout.scale,
    "--report-section-inverse-scale": 1 / layout.scale,
    "--section-scale": layout.scale,
  } as CSSProperties;

  return (
    <section
      style={{
        ...sectionVariables,
        width: "100%",
        height: layout.designHeight * layout.scale,
        display: "flex",
        justifyContent: "center",
        overflow: "hidden",
        background,
      }}
    >
      <div
        style={{
          position: "relative",
          width: designW,
          height: layout.designHeight,
          flexShrink: 0,
          transform: "scale(var(--report-section-scale))",
          transformOrigin: "top center",
        }}
      >
        <div ref={contentRef} style={{ position: "relative", minHeight: designH }}>
          {children}
        </div>
      </div>
    </section>
  );
}
