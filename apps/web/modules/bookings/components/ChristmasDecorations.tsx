"use client";

import React from "react";

const CONFIG_ID = "ChristmasDecorations-controls";

// Deterministic pseudo-random so server and client render the same flakes
const seeded = (index: number, salt: number) => {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const CHRISTMAS_KEYFRAMES = `
@keyframes cal-xmas-snowfall {
  0% { transform: translate3d(0, -10%, 0); }
  100% { transform: translate3d(0, 110vh, 0); }
}
@keyframes cal-xmas-sway {
  0%, 100% { margin-left: 0; }
  50% { margin-left: 14px; }
}
@keyframes cal-xmas-twinkle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
@media (prefers-reduced-motion: reduce) {
  .cal-xmas-flake, .cal-xmas-light { animation: none !important; }
}
`;

const HollyCorner = ({ red, green, className }: { red: string; green: string; className?: string }) => (
  <svg viewBox="0 0 64 48" width="64" height="48" className={className} aria-hidden="true">
    <path d="M6 30 C14 18, 24 16, 32 24 C26 26, 22 32, 22 40 C16 34, 10 34, 6 30 Z" fill={green} />
    <path d="M58 30 C50 18, 40 16, 32 24 C38 26, 42 32, 42 40 C48 34, 54 34, 58 30 Z" fill={green} />
    <path d="M32 24 L22 40 M32 24 L42 40" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
    <circle cx="27" cy="22" r="5" fill={red} />
    <circle cx="37" cy="22" r="5" fill={red} />
    <circle cx="32" cy="15" r="5" fill={red} />
    <circle cx="30.5" cy="13.5" r="1.4" fill="rgba(255,255,255,0.7)" />
  </svg>
);

export function ChristmasDecorations() {
  const [showSnow, setShowSnow] = React.useState(true);
  const [snowColor, setSnowColor] = React.useState("#cbd5e1");
  const [flakeCount, setFlakeCount] = React.useState(36);
  const [fallDuration, setFallDuration] = React.useState(12);
  const [snowOpacity, setSnowOpacity] = React.useState(0.8);
  const [accentRed, setAccentRed] = React.useState("#c62828");
  const [accentGreen, setAccentGreen] = React.useState("#1b7a3e");

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector(`[data-config-id="${CONFIG_ID}"]`);
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.showSnow === "boolean") setShowSnow(p.showSnow);
      if (typeof p.snowColor === "string") setSnowColor(p.snowColor);
      if (typeof p.flakeCount === "number") setFlakeCount(p.flakeCount);
      if (typeof p.fallDuration === "number") setFallDuration(p.fallDuration);
      if (typeof p.snowOpacity === "number") setSnowOpacity(p.snowOpacity);
      if (typeof p.accentRed === "string") setAccentRed(p.accentRed);
      if (typeof p.accentGreen === "string") setAccentGreen(p.accentGreen);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const flakes = React.useMemo(
    () =>
      Array.from({ length: Math.max(0, Math.round(flakeCount)) }, (_, i) => ({
        left: seeded(i, 1) * 100,
        size: 3 + seeded(i, 2) * 5,
        delay: -seeded(i, 3) * 20,
        speed: 0.7 + seeded(i, 4) * 0.6,
        sway: 2.5 + seeded(i, 5) * 3,
      })),
    [flakeCount]
  );

  const lights = [accentRed, "#f9a825", accentGreen, "#1e88e5"];
  const candyStripe = `repeating-linear-gradient(135deg, ${accentRed} 0 12px, #ffffff 12px 20px, ${accentGreen} 20px 32px, #ffffff 32px 40px)`;

  return (
    <div
      data-config-id={CONFIG_ID}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <style>{CHRISTMAS_KEYFRAMES}</style>

      {/* Festive inner frame */}
      <div
        className="absolute inset-0 rounded-[inherit]"
        style={{ boxShadow: `inset 0 0 0 2px ${accentGreen}33, inset 0 0 40px ${accentRed}0d` }}
      />

      {/* Candy-cane ribbon along the top */}
      <div className="absolute inset-x-0 top-0 h-2" style={{ background: candyStripe }} />

      {/* String of twinkling lights under the ribbon */}
      <div className="absolute inset-x-6 top-2 flex justify-between">
        {Array.from({ length: 14 }, (_, i) => (
          <span
            key={i}
            className="cal-xmas-light block h-2 w-1.5 rounded-b-full"
            style={{
              backgroundColor: lights[i % lights.length],
              boxShadow: `0 0 6px ${lights[i % lights.length]}`,
              animation: `cal-xmas-twinkle ${1.6 + (i % 3) * 0.5}s ease-in-out ${(i % 4) * 0.3}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Holly in the top corners */}
      <HollyCorner red={accentRed} green={accentGreen} className="absolute -left-1 top-3 opacity-90" />
      <HollyCorner
        red={accentRed}
        green={accentGreen}
        className="absolute -right-1 top-3 -scale-x-100 opacity-90"
      />

      {/* Snowfall */}
      {showSnow &&
        flakes.map((flake, i) => (
          <span
            key={i}
            className="cal-xmas-flake absolute -top-4 block"
            style={{
              left: `${flake.left}%`,
              animation: `cal-xmas-snowfall ${fallDuration * flake.speed}s linear ${flake.delay}s infinite`,
            }}>
            <span
              className="cal-xmas-flake block rounded-full"
              style={{
                width: flake.size,
                height: flake.size,
                backgroundColor: snowColor,
                opacity: snowOpacity,
                boxShadow: `0 0 3px ${snowColor}`,
                animation: `cal-xmas-sway ${flake.sway}s ease-in-out ${flake.delay}s infinite`,
              }}
            />
          </span>
        ))}

      {/* Snowdrift along the bottom */}
      <div
        className="absolute inset-x-0 bottom-0 h-3"
        style={{
          background: `radial-gradient(circle at 10px 12px, ${snowColor} 9px, transparent 10px) repeat-x`,
          backgroundSize: "20px 12px",
          opacity: snowOpacity * 0.6,
        }}
      />
    </div>
  );
}

export default ChristmasDecorations;
