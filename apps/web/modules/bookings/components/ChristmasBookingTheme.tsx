"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

const BULB_COLORS = ["var(--xmas-accent)", "#f5c542", "#2e9d5b", "#4aa3df"];
const GARLAND_SEGMENTS = 6;
const BULBS_PER_SEGMENT = 4;

function hollySvg(berryColor: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<path d="M30 30 C22 18 10 20 4 12 C6 22 2 26 6 32 C12 30 16 36 22 34 C22 30 26 30 30 30Z" fill="#1f7a45"/>
<path d="M34 30 C42 18 54 20 60 12 C58 22 62 26 58 32 C52 30 48 36 42 34 C42 30 38 30 34 30Z" fill="#2e9d5b"/>
<circle cx="27" cy="34" r="6" fill="${berryColor}"/>
<circle cx="37" cy="34" r="6" fill="${berryColor}"/>
<circle cx="32" cy="25" r="6" fill="${berryColor}"/>
<circle cx="30" cy="23" r="1.6" fill="#ffffff" opacity="0.7"/>
</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

// Deterministic pseudo-random so the preview is stable between renders.
function seeded(index: number, salt: number) {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function ChristmasBookingTheme({ children }: { children: ReactNode }) {
  const [snowEnabled, setSnowEnabled] = useState(true);
  const [snowCount, setSnowCount] = useState(60);
  const [snowSpeed, setSnowSpeed] = useState(12);
  const [snowColor, setSnowColor] = useState("#ffffff");
  const [accentColor, setAccentColor] = useState("#c62828");
  const [backdropColor, setBackdropColor] = useState("#0f3b2c");
  const [lightsTwinkle, setLightsTwinkle] = useState(true);

  // geneditor-listener-start
  useEffect(() => {
    const el = document.querySelector('[data-config-id="ChristmasBookingConfirmation-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.snowEnabled === "boolean") setSnowEnabled(p.snowEnabled);
      if (typeof p.snowCount === "number") setSnowCount(p.snowCount);
      if (typeof p.snowSpeed === "number") setSnowSpeed(p.snowSpeed);
      if (typeof p.snowColor === "string") setSnowColor(p.snowColor);
      if (typeof p.accentColor === "string") setAccentColor(p.accentColor);
      if (typeof p.backdropColor === "string") setBackdropColor(p.backdropColor);
      if (typeof p.lightsTwinkle === "boolean") setLightsTwinkle(p.lightsTwinkle);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const flakes = useMemo(
    () =>
      Array.from({ length: Math.max(0, Math.round(snowCount)) }, (_, i) => ({
        left: seeded(i, 1) * 100,
        size: 3 + seeded(i, 2) * 6,
        delay: -seeded(i, 3),
        durationFactor: 0.7 + seeded(i, 4) * 0.6,
        drift: (seeded(i, 5) - 0.5) * 80,
        opacity: 0.55 + seeded(i, 6) * 0.45,
      })),
    [snowCount]
  );

  const bulbs = useMemo(() => {
    const total = GARLAND_SEGMENTS * BULBS_PER_SEGMENT;
    return Array.from({ length: total }, (_, i) => {
      const segment = Math.floor(i / BULBS_PER_SEGMENT);
      const u = ((i % BULBS_PER_SEGMENT) + 0.5) / BULBS_PER_SEGMENT;
      return {
        left: ((segment + u) / GARLAND_SEGMENTS) * 100,
        top: 4 + 72 * u * (1 - u),
        color: BULB_COLORS[i % BULB_COLORS.length],
        delay: (i % 5) * 0.35,
      };
    });
  }, []);

  const themeStyle = {
    "--xmas-accent": accentColor,
    "--xmas-holly": hollySvg(accentColor),
    "--cal-border-booker": accentColor,
    "--cal-border-booker-width": "2px",
    backgroundColor: backdropColor,
    backgroundImage:
      "radial-gradient(ellipse at top, rgba(255,255,255,0.12), transparent 60%), radial-gradient(ellipse at bottom, rgba(255,255,255,0.08), transparent 55%)",
  } as CSSProperties;

  return (
    <div
      className="christmas-booking relative min-h-screen overflow-hidden"
      data-config-id="ChristmasBookingConfirmation-controls"
      style={themeStyle}>
      <style>{`
        @keyframes xmas-snowfall {
          0% { transform: translate3d(0, -10vh, 0); }
          100% { transform: translate3d(var(--xmas-drift), 110vh, 0); }
        }
        @keyframes xmas-twinkle {
          0%, 100% { opacity: 1; filter: brightness(1.1); }
          50% { opacity: 0.45; filter: brightness(0.8); }
        }
        .christmas-booking [role="dialog"] {
          position: relative;
          box-shadow: 0 20px 50px -20px rgba(0, 0, 0, 0.55);
        }
        .christmas-booking [role="dialog"]::before {
          content: "";
          position: absolute;
          inset: 0 0 auto 0;
          height: 8px;
          background: repeating-linear-gradient(135deg, var(--xmas-accent) 0 12px, #ffffff 12px 24px);
        }
        .christmas-booking [role="dialog"]::after {
          content: "";
          position: absolute;
          top: 14px;
          right: 14px;
          width: 44px;
          height: 44px;
          background: var(--xmas-holly) center / contain no-repeat;
          pointer-events: none;
        }
        .christmas-booking [role="dialog"] .bg-cal-success {
          box-shadow: 0 0 0 4px color-mix(in srgb, var(--xmas-accent) 18%, transparent);
        }
        @media (prefers-reduced-motion: reduce) {
          .christmas-booking .xmas-flake, .christmas-booking .xmas-bulb { animation: none !important; }
        }
      `}</style>

      {/* Garland of lights */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-12" aria-hidden="true">
        <svg
          className="absolute inset-0 h-10 w-full"
          viewBox={`0 0 ${GARLAND_SEGMENTS * 100} 40`}
          preserveAspectRatio="none">
          <path
            d={Array.from(
              { length: GARLAND_SEGMENTS },
              (_, s) => `${s === 0 ? "M0,4 " : ""}Q${s * 100 + 50},40 ${(s + 1) * 100},4`
            ).join(" ")}
            fill="none"
            stroke="#1b4d36"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {bulbs.map((bulb, i) => (
          <span
            key={i}
            className="xmas-bulb absolute flex flex-col items-center"
            style={{
              left: `${bulb.left}%`,
              top: bulb.top - 2,
              transform: "translateX(-50%)",
              animation: lightsTwinkle ? `xmas-twinkle 1.8s ease-in-out ${bulb.delay}s infinite` : "none",
            }}>
            <span className="h-1.5 w-1.5 rounded-sm bg-[#1b4d36]" />
            <span
              className="h-3.5 w-2.5 rounded-full"
              style={{ backgroundColor: bulb.color, boxShadow: `0 0 10px 2px ${bulb.color}` }}
            />
          </span>
        ))}
      </div>

      {/* Festive greeting */}
      <div className="relative z-10 flex justify-center pt-14 sm:pt-16">
        <span
          className="font-heading inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
          <span aria-hidden="true">❄</span>
          Happy holidays
          <span aria-hidden="true">❄</span>
        </span>
      </div>

      <div className="relative z-10 [&_[data-testid=success-page]]:h-auto [&_[data-testid=success-page]]:pb-24">
        {children}
      </div>

      {/* Snow drift */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-28"
        aria-hidden="true"
        style={{
          background: `radial-gradient(120% 100% at 20% 100%, ${snowColor} 45%, transparent 46%), radial-gradient(90% 80% at 75% 100%, ${snowColor} 45%, transparent 46%)`,
          opacity: 0.9,
        }}
      />

      {/* Snowfall */}
      {snowEnabled && (
        <div className="pointer-events-none absolute inset-0 z-30" aria-hidden="true">
          {flakes.map((flake, i) => {
            const duration = snowSpeed * flake.durationFactor;
            return (
              <span
                key={i}
                className="xmas-flake absolute top-0 rounded-full"
                style={
                  {
                    left: `${flake.left}%`,
                    width: flake.size,
                    height: flake.size,
                    backgroundColor: snowColor,
                    opacity: flake.opacity,
                    boxShadow: `0 0 4px ${snowColor}`,
                    "--xmas-drift": `${flake.drift}px`,
                    animation: `xmas-snowfall ${duration}s linear ${flake.delay * duration}s infinite`,
                  } as CSSProperties
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
