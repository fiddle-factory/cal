"use client";

import { createContext, useContext, useId } from "react";

// 4x4 ordered (Bayer) dither matrix
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

export type DitherSettings = {
  enabled: boolean;
  /** Share of pixels that are filled, 0..1 */
  density: number;
  /** Size of one dither pixel in px */
  pixelSize: number;
};

const DitherContext = createContext<DitherSettings>({ enabled: true, density: 0.35, pixelSize: 2 });

export const DitherProvider = DitherContext.Provider;

export const useDitherSettings = () => useContext(DitherContext);

/** Returns an SVG-safe unique id for a dither pattern. */
export const useDitherId = (prefix: string) => `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

/**
 * Renders a <defs> block with an ordered-dither pattern; use as a child of a recharts chart and
 * reference it with fill={`url(#${id})`}.
 */
export const DitherDefs = ({
  patterns,
}: {
  patterns: Array<{ id: string; color: string; background?: string; density?: number }>;
}) => {
  const { density: defaultDensity, pixelSize } = useDitherSettings();
  const size = pixelSize * 4;

  return (
    <defs>
      {patterns.map(({ id, color, background, density = defaultDensity }) => (
        <pattern key={id} id={id} width={size} height={size} patternUnits="userSpaceOnUse">
          {background ? <rect width={size} height={size} fill={background} /> : null}
          {BAYER_4X4.flatMap((row, y) =>
            row.map((value, x) =>
              (value + 0.5) / 16 < density ? (
                <rect
                  key={`${x}-${y}`}
                  x={x * pixelSize}
                  y={y * pixelSize}
                  width={pixelSize}
                  height={pixelSize}
                  fill={color}
                  shapeRendering="crispEdges"
                />
              ) : null
            )
          )}
        </pattern>
      ))}
    </defs>
  );
};
