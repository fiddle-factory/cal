"use client";

import React, { useMemo, useState } from "react";

type Flake = {
  left: number;
  size: number;
  delay: number;
  durationFactor: number;
  drift: number;
  opacityFactor: number;
};

// Deterministic pseudo-random so server and client render the same flakes.
const seeded = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

const buildFlakes = (count: number, maxSize: number): Flake[] =>
  Array.from({ length: count }, (_, i) => ({
    left: seeded(i + 1) * 100,
    size: 2 + seeded(i + 101) * Math.max(maxSize - 2, 0),
    delay: seeded(i + 201),
    durationFactor: 0.75 + seeded(i + 301) * 0.5,
    drift: (seeded(i + 401) - 0.5) * 80,
    opacityFactor: 0.55 + seeded(i + 501) * 0.45,
  }));

const SNOWFALL_KEYFRAMES = `
@keyframes cal-winter-snowfall {
  0% { transform: translate3d(0, -5vh, 0); }
  50% { transform: translate3d(calc(var(--cal-flake-drift) * 0.5px), 50vh, 0); }
  100% { transform: translate3d(calc(var(--cal-flake-drift) * 1px), 105vh, 0); }
}
@media (prefers-reduced-motion: reduce) {
  .cal-winter-flake { display: none; }
}
`;

const Snowflake = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.25}
    strokeLinecap="round"
    className={className}
    style={style}
    aria-hidden="true">
    <path d="M12 2v20M4.93 7l14.14 10M4.93 17L19.07 7" />
    <path d="M9.5 3.5L12 6l2.5-2.5M9.5 20.5L12 18l2.5 2.5" />
    <path d="M3.6 10.2l3.4-.9-.9-3.4M20.4 13.8l-3.4.9.9 3.4M3.6 13.8l3.4.9-.9 3.4M20.4 10.2l-3.4-.9.9-3.4" />
  </svg>
);

/**
 * Decorative winter backdrop: icy gradient, faint silver snowflake ornaments,
 * a soft snow drift and gently falling snow. Renders behind page content.
 */
export const WinterSnowfall = () => {
  const [snowEnabled, setSnowEnabled] = useState(true);
  const [flakeCount, setFlakeCount] = useState(60);
  const [fallDuration, setFallDuration] = useState(16);
  const [flakeOpacity, setFlakeOpacity] = useState(0.9);
  const [flakeSize, setFlakeSize] = useState(6);
  const [flakeColor, setFlakeColor] = useState("#ffffff");

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="WinterSnowfall-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.snowEnabled === "boolean") setSnowEnabled(p.snowEnabled);
      if (typeof p.flakeCount === "number") setFlakeCount(p.flakeCount);
      if (typeof p.fallDuration === "number") setFallDuration(p.fallDuration);
      if (typeof p.flakeOpacity === "number") setFlakeOpacity(p.flakeOpacity);
      if (typeof p.flakeSize === "number") setFlakeSize(p.flakeSize);
      if (typeof p.flakeColor === "string") setFlakeColor(p.flakeColor);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const flakes = useMemo(() => buildFlakes(Math.round(flakeCount), flakeSize), [flakeCount, flakeSize]);

  return (
    <div
      data-config-id="WinterSnowfall-controls"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-linear-to-b from-sky-200 via-sky-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-sky-950">
      <style>{SNOWFALL_KEYFRAMES}</style>

      {/* Silver snowflake ornaments */}
      <Snowflake className="absolute left-[6%] top-[12%] h-24 w-24 text-white/70 dark:text-sky-200/10" />
      <Snowflake className="absolute right-[8%] top-[28%] h-16 w-16 rotate-12 text-slate-300/60 dark:text-slate-400/10" />
      <Snowflake className="absolute bottom-[22%] left-[12%] h-12 w-12 -rotate-12 text-slate-300/50 dark:text-slate-400/10" />
      <Snowflake className="absolute bottom-[30%] right-[14%] h-20 w-20 text-white/70 dark:text-sky-200/10" />

      {/* Soft snow drift along the bottom */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-white via-white/70 to-transparent dark:from-slate-800/80 dark:via-slate-900/40" />

      {snowEnabled &&
        flakes.map((flake, i) => (
          <span
            key={i}
            className="cal-winter-flake absolute -top-4 rounded-full"
            style={
              {
                left: `${flake.left}%`,
                width: flake.size,
                height: flake.size,
                backgroundColor: flakeColor,
                opacity: flakeOpacity * flake.opacityFactor,
                boxShadow: "0 0 4px rgba(125, 170, 210, 0.55)",
                filter: flake.size > 5 ? "blur(0.5px)" : undefined,
                "--cal-flake-drift": flake.drift,
                animation: `cal-winter-snowfall ${fallDuration * flake.durationFactor}s linear ${
                  -flake.delay * fallDuration * flake.durationFactor
                }s infinite`,
              } as React.CSSProperties
            }
          />
        ))}
    </div>
  );
};

export default WinterSnowfall;
