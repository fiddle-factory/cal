"use client";

import { createContext, useContext, useId } from "react";

export type DitherSettings = {
  /** Share of Bayer cells that are filled, 0–1. */
  ditherIntensity: number;
  /** Size in px of a single dither dot. */
  patternScale: number;
  /** Opacity of the dithered fill, 0–1. */
  fillOpacity: number;
};

export const DEFAULT_DITHER_SETTINGS: DitherSettings = {
  ditherIntensity: 0.5,
  patternScale: 2,
  fillOpacity: 0.6,
};

const DitherSettingsContext = createContext<DitherSettings>(DEFAULT_DITHER_SETTINGS);

export const DitherSettingsProvider = DitherSettingsContext.Provider;

export const useDitherSettings = () => useContext(DitherSettingsContext);

// 4x4 ordered (Bayer) dither threshold matrix
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const sanitize = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, "");

/** Returns a function that builds a unique, SVG-safe pattern id for a series key. */
export const useDitherPatternId = () => {
  const id = sanitize(useId());
  return (key: string) => `dither-${id}-${sanitize(key)}`;
};

/** Renders an SVG <pattern> with an ordered (Bayer) dot dither in the given color. Place inside <defs>. */
export const renderDitherPattern = ({
  id,
  color,
  settings,
}: {
  id: string;
  color: string;
  settings: DitherSettings;
}) => {
  const cell = Math.max(1, settings.patternScale);
  const size = cell * 4;
  const threshold = Math.round(Math.min(1, Math.max(0, settings.ditherIntensity)) * 16);

  return (
    <pattern key={id} id={id} patternUnits="userSpaceOnUse" width={size} height={size}>
      <g fill={color}>
        {BAYER_4X4.flatMap((row, y) =>
          row.map((value, x) =>
            value < threshold ? (
              <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} />
            ) : null
          )
        )}
      </g>
    </pattern>
  );
};
