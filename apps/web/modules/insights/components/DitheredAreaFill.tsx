"use client";

import React, { useId, useState } from "react";

// 4x4 ordered (Bayer) dither threshold matrix
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

// Density levels used from the line downward (out of 16 cells per tile)
const LEVELS = [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

export const DITHER_CONFIG_ID = "InsightsDitheredArea-controls";

const sanitize = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, "");

/** Stable, url()-safe id prefix for one chart's dither patterns. */
export const useDitherId = () => `dither-${sanitize(useId())}`;

/** Fill value referencing the dithered pattern for a series color. */
export const ditherFill = (ditherId: string, color: string) => `url(#${ditherId}-${sanitize(color)})`;

/**
 * SVG <defs> with an ordered-dither fill per series color. The fill is densest right under
 * the top of the area and thins out in steps towards the baseline.
 * Render it as a direct child of a Recharts chart.
 */
export const DitheredAreaDefs = ({ ditherId, colors }: { ditherId: string; colors: string[] }) => {
  const [ditherOpacity, setDitherOpacity] = useState(0.55);
  const [ditherPixelSize, setDitherPixelSize] = useState(2);
  const [ditherFadeLength, setDitherFadeLength] = useState(220);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector(`[data-config-id="${DITHER_CONFIG_ID}"]`);
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.ditherOpacity === "number") setDitherOpacity(p.ditherOpacity);
      if (typeof p.ditherPixelSize === "number") setDitherPixelSize(p.ditherPixelSize);
      if (typeof p.ditherFadeLength === "number") setDitherFadeLength(p.ditherFadeLength);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const px = ditherPixelSize;
  const tile = px * 4;
  const band = ditherFadeLength / LEVELS.length;

  return (
    <defs>
      {Array.from(new Set(colors)).map((color) => {
        const base = `${ditherId}-${sanitize(color)}`;
        return (
          <React.Fragment key={color}>
            {LEVELS.map((level) => (
              <pattern
                key={level}
                id={`${base}-l${level}`}
                width={tile}
                height={tile}
                patternUnits="userSpaceOnUse">
                {BAYER_4X4.flatMap((row, y) =>
                  row.map((threshold, x) =>
                    threshold < level ? (
                      <rect
                        key={`${x}-${y}`}
                        x={x * px}
                        y={y * px}
                        width={px}
                        height={px}
                        fill={color}
                        shapeRendering="crispEdges"
                      />
                    ) : null
                  )
                )}
              </pattern>
            ))}
            <pattern
              id={base}
              x={0}
              y={0}
              width={1}
              height={1}
              patternUnits="objectBoundingBox"
              patternContentUnits="userSpaceOnUse">
              <g opacity={ditherOpacity}>
                {LEVELS.map((level, i) => (
                  <rect
                    key={level}
                    x={0}
                    y={i * band}
                    width={10000}
                    height={band + 0.5}
                    fill={`url(#${base}-l${level})`}
                  />
                ))}
              </g>
            </pattern>
          </React.Fragment>
        );
      })}
    </defs>
  );
};
