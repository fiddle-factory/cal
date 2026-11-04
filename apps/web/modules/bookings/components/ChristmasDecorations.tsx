"use client";

import React, { useMemo, useState } from "react";

const SNOWFALL_CONFIG_ID = "ChristmasSnowfall-controls";
const MAX_FLAKES = 200;

// Deterministic pseudo-random so server and client render the same flakes.
const seeded = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

export function Snowfall() {
  const [snowEnabled, setSnowEnabled] = useState(true);
  const [snowAmount, setSnowAmount] = useState(60);
  const [snowSpeed, setSnowSpeed] = useState(1);
  const [flakeSize, setFlakeSize] = useState(6);
  const [snowColor, setSnowColor] = useState("#cbd5e1");
  const [snowOpacity, setSnowOpacity] = useState(0.8);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector(`[data-config-id="${SNOWFALL_CONFIG_ID}"]`);
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.snowEnabled === "boolean") setSnowEnabled(p.snowEnabled);
      if (typeof p.snowAmount === "number") setSnowAmount(p.snowAmount);
      if (typeof p.snowSpeed === "number") setSnowSpeed(p.snowSpeed);
      if (typeof p.flakeSize === "number") setFlakeSize(p.flakeSize);
      if (typeof p.snowColor === "string") setSnowColor(p.snowColor);
      if (typeof p.snowOpacity === "number") setSnowOpacity(p.snowOpacity);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const flakes = useMemo(
    () =>
      Array.from({ length: MAX_FLAKES }, (_, i) => ({
        left: seeded(i + 1) * 100,
        scale: 0.5 + seeded(i + 101) * 0.8,
        duration: 8 + seeded(i + 201) * 10,
        delay: -seeded(i + 301) * 18,
        drift: (seeded(i + 401) - 0.5) * 80,
      })),
    []
  );

  const count = Math.max(0, Math.min(MAX_FLAKES, Math.round(snowAmount)));
  const speed = Math.max(0.1, snowSpeed);

  return (
    <div
      data-config-id={SNOWFALL_CONFIG_ID}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <style>{`
        @keyframes cal-snowfall {
          0% { transform: translate3d(0, -10vh, 0); }
          100% { transform: translate3d(var(--cal-snow-drift), 110vh, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .cal-snowflake { animation: none !important; display: none; }
        }
      `}</style>
      {snowEnabled &&
        flakes.slice(0, count).map((flake, i) => {
          const size = flakeSize * flake.scale;
          return (
            <span
              key={i}
              className="cal-snowflake absolute top-0 rounded-full"
              style={
                {
                  left: `${flake.left}%`,
                  width: size,
                  height: size,
                  backgroundColor: snowColor,
                  opacity: snowOpacity,
                  "--cal-snow-drift": `${flake.drift}px`,
                  animation: `cal-snowfall ${flake.duration / speed}s linear ${flake.delay / speed}s infinite`,
                } as React.CSSProperties
              }
            />
          );
        })}
    </div>
  );
}

function Holly({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 48" className={className} aria-hidden="true">
      <path
        d="M32 30 C26 22 16 22 8 26 C12 24 14 20 12 16 C18 20 26 18 30 12 C30 18 32 24 32 30 Z"
        className="fill-green-700 dark:fill-green-500"
      />
      <path
        d="M32 30 C38 22 48 22 56 26 C52 24 50 20 52 16 C46 20 38 18 34 12 C34 18 32 24 32 30 Z"
        className="fill-green-600 dark:fill-green-400"
      />
      <circle cx="27" cy="31" r="4.5" className="fill-red-600 dark:fill-red-500" />
      <circle cx="37" cy="31" r="4.5" className="fill-red-600 dark:fill-red-500" />
      <circle cx="32" cy="36" r="4.5" className="fill-red-700 dark:fill-red-400" />
    </svg>
  );
}

/** Festive ribbon and holly sprigs for the booking confirmation card. Parent must be positioned. */
export function ChristmasCardAccents() {
  return (
    <div aria-hidden="true" className="pointer-events-none">
      <div
        className="absolute inset-x-0 top-0 h-1.5"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, #dc2626 0 12px, #ffffff 12px 18px, #15803d 18px 30px, #ffffff 30px 36px)",
        }}
      />
      <Holly className="absolute left-2 top-3 h-9 w-12 -rotate-12" />
      <Holly className="absolute right-2 top-3 h-9 w-12 rotate-12 scale-x-[-1]" />
    </div>
  );
}
