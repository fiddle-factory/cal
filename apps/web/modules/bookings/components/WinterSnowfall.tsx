"use client";

import React, { useMemo, useState } from "react";

type SnowflakeProps = {
  className?: string;
  style?: React.CSSProperties;
};

/** Six-armed snowflake glyph used for the winter theme decorations. */
export const Snowflake = ({ className, style }: SnowflakeProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
    style={style}>
    <path d="M12 2v20M3.34 7l17.32 10M3.34 17l17.32-10" />
    <path d="M9.5 3.5 12 6l2.5-2.5M9.5 20.5 12 18l2.5 2.5" />
    <path d="m4.3 9.9 3.4-.9-.9-3.4M19.7 14.1l-3.4.9.9 3.4" />
    <path d="m4.3 14.1 3.4.9-.9 3.4M19.7 9.9l-3.4-.9.9-3.4" />
  </svg>
);

const SNOWFALL_KEYFRAMES = `
@keyframes cal-winter-snowfall {
  0% { transform: translate3d(0, -10vh, 0) rotate(0deg); }
  50% { transform: translate3d(var(--cal-snow-drift), 50vh, 0) rotate(180deg); }
  100% { transform: translate3d(0, 110vh, 0) rotate(360deg); }
}
@media (prefers-reduced-motion: reduce) {
  .cal-winter-flake { animation: none !important; }
}
`;

const BASE_FALL_SECONDS = 14;

// Deterministic pseudo-random so server and client render the same flakes.
const seeded = (i: number, salt: number) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** Gentle falling-snow layer that sits behind the page content. */
export const WinterSnowfall = () => {
  const [showSnow, setShowSnow] = useState(true);
  const [snowColor, setSnowColor] = useState("#bae6fd");
  const [flakeCount, setFlakeCount] = useState(36);
  const [fallSpeed, setFallSpeed] = useState(1);
  const [flakeOpacity, setFlakeOpacity] = useState(0.8);
  const [flakeSize, setFlakeSize] = useState(16);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="WinterSnowfall-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.showSnow === "boolean") setShowSnow(p.showSnow);
      if (typeof p.snowColor === "string") setSnowColor(p.snowColor);
      if (typeof p.flakeCount === "number") setFlakeCount(p.flakeCount);
      if (typeof p.fallSpeed === "number") setFallSpeed(p.fallSpeed);
      if (typeof p.flakeOpacity === "number") setFlakeOpacity(p.flakeOpacity);
      if (typeof p.flakeSize === "number") setFlakeSize(p.flakeSize);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const flakes = useMemo(
    () =>
      Array.from({ length: Math.max(0, Math.round(flakeCount)) }, (_, i) => ({
        left: seeded(i, 1) * 100,
        scale: 0.4 + seeded(i, 2) * 0.8,
        delay: seeded(i, 3),
        speed: 0.7 + seeded(i, 4) * 0.6,
        drift: (seeded(i, 5) - 0.5) * 80,
        alpha: 0.5 + seeded(i, 6) * 0.5,
      })),
    [flakeCount]
  );

  return (
    <div
      data-config-id="WinterSnowfall-controls"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <style>{SNOWFALL_KEYFRAMES}</style>
      {showSnow &&
        flakes.map((flake, i) => {
          // Higher fall speed = shorter loop; base loop is ~14s at speed 1.
          const duration = (BASE_FALL_SECONDS / Math.max(0.1, fallSpeed)) * flake.speed;
          return (
            <Snowflake
              key={i}
              className="cal-winter-flake absolute top-0"
              style={
                {
                  left: `${flake.left}%`,
                  width: flakeSize * flake.scale,
                  height: flakeSize * flake.scale,
                  color: snowColor,
                  opacity: flakeOpacity * flake.alpha,
                  animation: `cal-winter-snowfall ${duration}s linear ${-flake.delay * duration}s infinite`,
                  "--cal-snow-drift": `${flake.drift}px`,
                } as React.CSSProperties
              }
            />
          );
        })}
    </div>
  );
};

export default WinterSnowfall;
