"use client";

import React, { useState } from "react";

const BULB_PALETTE_SIZE = 4;

/**
 * Festive string of twinkling lights draped along the top edge of a card.
 * The parent must be `relative` (and ideally `overflow-hidden`).
 */
export function ChristmasLights() {
  const [showLights, setShowLights] = useState(true);
  const [bulbCount, setBulbCount] = useState(12);
  const [twinkleSpeed, setTwinkleSpeed] = useState(2.4);
  const [glowSize, setGlowSize] = useState(10);
  const [wireColor, setWireColor] = useState("#c9a227");
  const [bulbColorA, setBulbColorA] = useState("#f5c84c");
  const [bulbColorB, setBulbColorB] = useState("#d0344a");

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="ChristmasLights-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.showLights === "boolean") setShowLights(p.showLights);
      if (typeof p.bulbCount === "number") setBulbCount(p.bulbCount);
      if (typeof p.twinkleSpeed === "number") setTwinkleSpeed(p.twinkleSpeed);
      if (typeof p.glowSize === "number") setGlowSize(p.glowSize);
      if (typeof p.wireColor === "string") setWireColor(p.wireColor);
      if (typeof p.bulbColorA === "string") setBulbColorA(p.bulbColorA);
      if (typeof p.bulbColorB === "string") setBulbColorB(p.bulbColorB);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const count = Math.max(2, Math.round(bulbCount));
  // Alternate warm gold, berry red, soft cream, berry red
  const palette = [bulbColorA, bulbColorB, "#fff4d6", bulbColorB];
  const segment = 40;
  const wirePath = Array.from({ length: count })
    .map((_, i) => `Q${i * segment + segment / 2} 22 ${(i + 1) * segment} 4`)
    .join(" ");

  return (
    <div
      data-config-id="ChristmasLights-controls"
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-10">
      {showLights && (
        <>
          <svg
            className="absolute inset-x-0 top-0 h-6 w-full"
            viewBox={`0 0 ${count * segment} 24`}
            preserveAspectRatio="none">
            <path
              d={`M0 4 ${wirePath}`}
              fill="none"
              stroke={wireColor}
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
            />
          </svg>
          {Array.from({ length: count }).map((_, i) => {
            const color = palette[i % BULB_PALETTE_SIZE];
            return (
              <div
                key={i}
                className="absolute flex -translate-x-1/2 flex-col items-center"
                style={{ left: `${((i + 0.5) / count) * 100}%`, top: 11 }}>
                <span className="block h-1 w-1.5 rounded-t-sm" style={{ backgroundColor: wireColor }} />
                <span
                  className="animate-pulse block h-3 w-2 rounded-full"
                  style={{
                    backgroundColor: color,
                    boxShadow: `0 0 ${glowSize}px ${glowSize / 3}px ${color}`,
                    animationDuration: `${twinkleSpeed}s`,
                    animationDelay: `${((i * 7) % 5) * (twinkleSpeed / 5)}s`,
                  }}
                />
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

export default ChristmasLights;
