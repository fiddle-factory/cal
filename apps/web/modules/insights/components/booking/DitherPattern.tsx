"use client";

import React, { createContext, useContext, useId, useState } from "react";
import type { ReactNode } from "react";

type DitherSettings = {
  dotSize: number;
  dotSpacing: number;
  dotOpacity: number;
};

const DEFAULT_DITHER: DitherSettings = {
  dotSize: 1.2,
  dotSpacing: 5,
  dotOpacity: 0.85,
};

const DitherContext = createContext<DitherSettings>(DEFAULT_DITHER);

export const useDitherSettings = () => useContext(DitherContext);

/**
 * Holds the dither look (dot size, spacing, opacity) shared by every Insights chart.
 */
export const DitherProvider = ({ className, children }: { className?: string; children: ReactNode }) => {
  const [dotSize, setDotSize] = useState(DEFAULT_DITHER.dotSize);
  const [dotSpacing, setDotSpacing] = useState(DEFAULT_DITHER.dotSpacing);
  const [dotOpacity, setDotOpacity] = useState(DEFAULT_DITHER.dotOpacity);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="InsightsCharts-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.dotSize === "number") setDotSize(p.dotSize);
      if (typeof p.dotSpacing === "number") setDotSpacing(p.dotSpacing);
      if (typeof p.dotOpacity === "number") setDotOpacity(p.dotOpacity);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  return (
    <DitherContext.Provider value={{ dotSize, dotSpacing, dotOpacity }}>
      <div className={className} data-config-id="InsightsCharts-controls">
        {children}
      </div>
    </DitherContext.Provider>
  );
};

/** Returns a stable, url()-safe pattern id prefix for one chart. */
export const useDitherId = () => useId().replace(/[^a-zA-Z0-9_-]/g, "");

export const ditherPatternId = (prefix: string, key: string) =>
  `${prefix}-dither-${key.replace(/[^a-zA-Z0-9_-]/g, "")}`;

/**
 * Renders a hidden SVG with one staggered halftone dot pattern per series.
 * Charts reference them with fill={`url(#${ditherPatternId(prefix, key)})`}.
 */
export const DitherDefs = ({
  prefix,
  series,
}: {
  prefix: string;
  series: Array<{ key: string; color: string }>;
}) => {
  const { dotSize, dotSpacing, dotOpacity } = useDitherSettings();
  const half = dotSpacing / 2;

  return (
    <svg
      aria-hidden="true"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
      <defs>
        {series.map(({ key, color }) => (
          <pattern
            key={key}
            id={ditherPatternId(prefix, key)}
            width={dotSpacing}
            height={dotSpacing}
            patternUnits="userSpaceOnUse">
            <circle cx={half / 2} cy={half / 2} r={dotSize} style={{ fill: color }} opacity={dotOpacity} />
            <circle
              cx={half + half / 2}
              cy={half + half / 2}
              r={dotSize}
              style={{ fill: color }}
              opacity={dotOpacity}
            />
          </pattern>
        ))}
      </defs>
    </svg>
  );
};
