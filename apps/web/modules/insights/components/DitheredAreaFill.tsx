"use client";

import React, { useId, useState } from "react";

// 4x4 ordered (Bayer) dither matrix.
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/**
 * Builds a data-URI tile whose dots carry `1 - threshold` as alpha. Combined with a vertical
 * alpha gradient inside an SVG filter, this produces an ordered dither: a dot is lit only where
 * the gradient value exceeds its Bayer threshold, so dots are dense near the line and sparse
 * toward the baseline.
 */
const buildBayerTile = (cell: number) => {
  const size = cell * 4;
  const radius = cell * 0.42;
  const dots = BAYER_4X4.flatMap((row, y) =>
    row.map((value, x) => {
      const threshold = (value + 0.5) / 16;
      return `<circle cx="${x * cell + cell / 2}" cy="${y * cell + cell / 2}" r="${radius}" fill="#000" fill-opacity="${(
        1 - threshold
      ).toFixed(4)}"/>`;
    })
  ).join("");
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${dots}</svg>`
  )}`;
};

export type DitherSettings = {
  ditherDensity: number;
  ditherScale: number;
  fillOpacity: number;
};

export const useDitherSettings = (): DitherSettings & { idPrefix: string } => {
  const [ditherDensity, setDitherDensity] = useState(0.9);
  const [ditherScale, setDitherScale] = useState(4);
  const [fillOpacity, setFillOpacity] = useState(0.7);
  const idPrefix = `dither-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="SourceRouteStory-main-0"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.ditherDensity === "number") setDitherDensity(p.ditherDensity);
      if (typeof p.ditherScale === "number") setDitherScale(p.ditherScale);
      if (typeof p.fillOpacity === "number") setFillOpacity(p.fillOpacity);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  return { ditherDensity, ditherScale, fillOpacity, idPrefix };
};

const slug = (key: string) => key.replace(/[^a-zA-Z0-9_-]/g, "_");

export const ditherGradientId = (idPrefix: string, key: string) => `${idPrefix}-grad-${slug(key)}`;
export const ditherFilterId = (idPrefix: string, key: string) => `${idPrefix}-filter-${slug(key)}`;

/**
 * Returns a `<defs>` element (call it as a function inside a recharts chart) with, per series,
 * an alpha gradient for the area fill and a filter that turns it into coloured Bayer dots.
 */
export const renderDitherDefs = (
  settings: DitherSettings & { idPrefix: string },
  series: Array<{ key: string; color: string }>
) => {
  const cell = Math.max(1, settings.ditherScale);
  const tile = buildBayerTile(cell);
  const tileSize = cell * 4;
  return (
    <defs>
      {series.map(({ key, color }, index) => (
        <React.Fragment key={key}>
          <linearGradient id={ditherGradientId(settings.idPrefix, key)} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000" stopOpacity={settings.ditherDensity} />
            <stop offset="100%" stopColor="#000" stopOpacity={0} />
          </linearGradient>
          <filter
            id={ditherFilterId(settings.idPrefix, key)}
            filterUnits="userSpaceOnUse"
            primitiveUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="100%"
            height="100%"
            colorInterpolationFilters="sRGB">
            {/* Offset each series' grid so overlapping fills interleave instead of covering each other */}
            <feImage
              href={tile}
              x={(index % 4) * cell}
              y={Math.floor(index / 4) * cell * 2}
              width={tileSize}
              height={tileSize}
              result="bayer"
            />
            <feTile in="bayer" result="bayerTiled" />
            {/* alpha = gradient - threshold */}
            <feComposite
              in="SourceAlpha"
              in2="bayerTiled"
              operator="arithmetic"
              k1="0"
              k2="1"
              k3="1"
              k4="-1"
              result="diff"
            />
            <feComponentTransfer in="diff" result="dots">
              <feFuncA type="linear" slope="255" intercept="0" />
            </feComponentTransfer>
            <feFlood floodColor={color} floodOpacity={settings.fillOpacity} result="tint" />
            <feComposite in="tint" in2="dots" operator="in" />
          </filter>
        </React.Fragment>
      ))}
    </defs>
  );
};
