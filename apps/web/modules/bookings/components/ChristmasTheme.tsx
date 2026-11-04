"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

const HOLLY_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48"><path fill="#15803d" d="M30 26c-6-2-9-8-8-14 3 2 6 1 8-1-1 4 1 7 4 8-3 1-4 4-4 7z"/><path fill="#166534" d="M34 26c6-2 13-1 17 4-3 0-5 3-5 6-2-3-6-3-8-1 0-4-2-7-4-9z"/><path fill="#16a34a" d="M30 26c-6 1-12 6-13 12 3-1 6 1 7 3 1-3 4-5 7-4-2-3-2-8-1-11z"/><circle cx="31" cy="28" r="4" fill="#b91c1c"/><circle cx="37" cy="30" r="3.5" fill="#dc2626"/><circle cx="33" cy="34" r="3.5" fill="#991b1b"/></svg>`
);

// Deterministic pseudo-random so every render produces the same flakes.
const rand = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

export function ChristmasTheme({ children }: { children: ReactNode }) {
  const [snowEnabled, setSnowEnabled] = useState(true);
  const [snowCount, setSnowCount] = useState(60);
  const [snowSpeed, setSnowSpeed] = useState(1);
  const [snowColor, setSnowColor] = useState("#cbd5e1");
  const [accentRed, setAccentRed] = useState("#b91c1c");
  const [accentGreen, setAccentGreen] = useState("#15803d");
  const [lightsTwinkle, setLightsTwinkle] = useState(true);

  // geneditor-listener-start
  useEffect(() => {
    const el = document.querySelector('[data-config-id="ChristmasTheme-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.snowEnabled === "boolean") setSnowEnabled(p.snowEnabled);
      if (typeof p.snowCount === "number") setSnowCount(p.snowCount);
      if (typeof p.snowSpeed === "number") setSnowSpeed(p.snowSpeed);
      if (typeof p.snowColor === "string") setSnowColor(p.snowColor);
      if (typeof p.accentRed === "string") setAccentRed(p.accentRed);
      if (typeof p.accentGreen === "string") setAccentGreen(p.accentGreen);
      if (typeof p.lightsTwinkle === "boolean") setLightsTwinkle(p.lightsTwinkle);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const flakes = useMemo(
    () =>
      Array.from({ length: Math.max(0, Math.round(snowCount)) }, (_, i) => ({
        left: rand(i + 1) * 100,
        size: 3 + rand(i + 101) * 5,
        duration: 9 + rand(i + 201) * 9,
        delay: -rand(i + 301) * 18,
        drift: (rand(i + 401) - 0.5) * 60,
        opacity: 0.5 + rand(i + 501) * 0.5,
      })),
    [snowCount]
  );

  const lightColors = [accentRed, "#f59e0b", accentGreen, "#2563eb"];

  return (
    <div
      data-config-id="ChristmasTheme-controls"
      data-xmas-theme=""
      className="relative min-h-screen"
      style={
        {
          "--xmas-red": accentRed,
          "--xmas-green": accentGreen,
          background: `radial-gradient(ellipse at top, color-mix(in srgb, ${accentGreen} 7%, transparent), transparent 60%)`,
        } as CSSProperties
      }>
      <style>{`
        @keyframes xmas-snowfall {
          0% { transform: translate3d(0, -10vh, 0); }
          50% { transform: translate3d(var(--xmas-drift), 50vh, 0); }
          100% { transform: translate3d(0, 110vh, 0); }
        }
        @keyframes xmas-twinkle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        [data-xmas-theme] [role="dialog"] {
          position: relative;
          box-shadow: 0 10px 30px -12px color-mix(in srgb, var(--xmas-red) 35%, transparent);
        }
        [data-xmas-theme] [role="dialog"]::before {
          content: "";
          position: absolute;
          inset: 0 0 auto 0;
          height: 6px;
          background: repeating-linear-gradient(135deg, var(--xmas-red) 0 10px, #ffffff 10px 20px);
        }
        [data-xmas-theme] [role="dialog"]::after {
          content: "";
          position: absolute;
          top: 14px;
          right: 14px;
          width: 56px;
          height: 42px;
          background: url("data:image/svg+xml,${HOLLY_SVG}") no-repeat center / contain;
          pointer-events: none;
        }
        [data-xmas-theme] [role="dialog"] .bg-cal-success {
          background-color: color-mix(in srgb, var(--xmas-green) 15%, transparent);
          box-shadow: 0 0 0 4px color-mix(in srgb, var(--xmas-red) 12%, transparent);
        }
        [data-xmas-theme] [role="dialog"] .bg-cal-success svg {
          color: var(--xmas-green);
        }
        [data-xmas-theme] #modal-headline::after {
          content: " \\2744";
          color: var(--xmas-red);
        }
        @media (prefers-reduced-motion: reduce) {
          [data-xmas-flake], [data-xmas-light] { animation: none !important; }
        }
      `}</style>

      {/* String of holiday lights along the top */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 h-6 overflow-hidden">
        <svg className="absolute inset-x-0 top-0 h-6 w-full" preserveAspectRatio="none" viewBox="0 0 100 10">
          <path
            d="M0 2 Q 5 8 10 2 T 20 2 T 30 2 T 40 2 T 50 2 T 60 2 T 70 2 T 80 2 T 90 2 T 100 2"
            fill="none"
            stroke={accentGreen}
            strokeOpacity="0.6"
            strokeWidth="0.4"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="absolute inset-x-0 top-0 flex justify-around">
          {Array.from({ length: 20 }, (_, i) => (
            <span
              key={i}
              data-xmas-light=""
              className="mt-2 block h-2.5 w-2 rounded-full"
              style={{
                backgroundColor: lightColors[i % lightColors.length],
                boxShadow: `0 0 6px ${lightColors[i % lightColors.length]}`,
                animation: lightsTwinkle ? `xmas-twinkle 1.6s ease-in-out ${(i % 4) * 0.4}s infinite` : "none",
              }}
            />
          ))}
        </div>
      </div>

      {children}

      {snowEnabled && (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          {flakes.map((f, i) => (
            <span
              key={i}
              data-xmas-flake=""
              className="absolute top-0 block rounded-full"
              style={
                {
                  left: `${f.left}%`,
                  width: f.size,
                  height: f.size,
                  opacity: f.opacity,
                  backgroundColor: snowColor,
                  boxShadow: `0 0 4px ${snowColor}`,
                  "--xmas-drift": `${f.drift}px`,
                  animation: `xmas-snowfall ${f.duration / Math.max(snowSpeed, 0.1)}s linear ${
                    f.delay / Math.max(snowSpeed, 0.1)
                  }s infinite`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
