"use client";

import * as React from "react";
import { useState } from "react";

// Deterministic pseudo-random so the snow layout is stable between renders.
const rand = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

function Holly({ red, green, className, style }: { red: string; green: string; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 80" className={className} style={style} aria-hidden="true">
      <path
        d="M60 44 C48 30 30 28 14 34 C20 38 18 46 10 50 C26 56 44 54 60 44 Z"
        fill={green}
      />
      <path
        d="M60 44 C72 30 90 28 106 34 C100 38 102 46 110 50 C94 56 76 54 60 44 Z"
        fill={green}
        opacity={0.85}
      />
      <path d="M60 44 C46 40 30 42 18 46" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" fill="none" />
      <path d="M60 44 C74 40 90 42 102 46" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" fill="none" />
      <circle cx="54" cy="38" r="7" fill={red} />
      <circle cx="66" cy="38" r="7" fill={red} />
      <circle cx="60" cy="28" r="7" fill={red} />
      <circle cx="52" cy="36" r="2" fill="#fff" opacity={0.6} />
      <circle cx="64" cy="36" r="2" fill="#fff" opacity={0.6} />
      <circle cx="58" cy="26" r="2" fill="#fff" opacity={0.6} />
    </svg>
  );
}

function Ornament({ color, string, size }: { color: string; string: number; size: number }) {
  return (
    <div className="flex flex-col items-center" aria-hidden="true">
      <div style={{ width: 1, height: string, background: "rgba(120,120,120,0.6)" }} />
      <div style={{ width: size * 0.36, height: size * 0.2, background: "#d4af37", borderRadius: 2 }} />
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: `radial-gradient(circle at 32% 30%, rgba(255,255,255,0.75) 0, rgba(255,255,255,0) 28%), ${color}`,
          boxShadow: "0 3px 8px rgba(0,0,0,0.18)",
        }}
      />
    </div>
  );
}

export function ChristmasTheme({ children }: { children: React.ReactNode }) {
  const [snowEnabled, setSnowEnabled] = useState(true);
  const [snowCount, setSnowCount] = useState(60);
  const [snowFallSeconds, setSnowFallSeconds] = useState(12);
  const [snowOpacity, setSnowOpacity] = useState(0.9);
  const [festiveRed, setFestiveRed] = useState("#c62828");
  const [festiveGreen, setFestiveGreen] = useState("#2e7d32");

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="ChristmasBookingConfirmation-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.snowEnabled === "boolean") setSnowEnabled(p.snowEnabled);
      if (typeof p.snowCount === "number") setSnowCount(p.snowCount);
      if (typeof p.snowFallSeconds === "number") setSnowFallSeconds(p.snowFallSeconds);
      if (typeof p.snowOpacity === "number") setSnowOpacity(p.snowOpacity);
      if (typeof p.festiveRed === "string") setFestiveRed(p.festiveRed);
      if (typeof p.festiveGreen === "string") setFestiveGreen(p.festiveGreen);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const flakes = React.useMemo(
    () =>
      Array.from({ length: Math.max(0, Math.round(snowCount)) }, (_, i) => ({
        left: rand(i + 1) * 100,
        size: 3 + rand(i + 101) * 6,
        delay: -rand(i + 201) * 1,
        speed: 0.7 + rand(i + 301) * 0.6,
        drift: (rand(i + 401) - 0.5) * 80,
        blur: rand(i + 501) > 0.7 ? 1 : 0,
      })),
    [snowCount]
  );

  const ornaments = [
    { color: festiveRed, string: 26, size: 22 },
    { color: festiveGreen, string: 44, size: 18 },
    { color: "#d4af37", string: 18, size: 16 },
    { color: festiveRed, string: 38, size: 20 },
    { color: festiveGreen, string: 22, size: 22 },
    { color: festiveRed, string: 48, size: 16 },
    { color: "#d4af37", string: 30, size: 20 },
    { color: festiveGreen, string: 40, size: 18 },
    { color: festiveRed, string: 20, size: 22 },
  ];

  return (
    <div
      data-config-id="ChristmasBookingConfirmation-controls"
      className="xmas-theme relative min-h-screen overflow-hidden"
      style={
        {
          "--xmas-red": festiveRed,
          "--xmas-green": festiveGreen,
          background: `radial-gradient(ellipse at top, ${festiveGreen}1f 0%, transparent 60%), radial-gradient(ellipse at bottom, ${festiveRed}14 0%, transparent 55%)`,
        } as React.CSSProperties
      }>
      <style>{`
        @keyframes xmas-snowfall {
          0% { transform: translate3d(0, -10vh, 0); }
          100% { transform: translate3d(var(--xmas-drift), 110vh, 0); }
        }
        @keyframes xmas-sway {
          0%, 100% { transform: rotate(-4deg); }
          50% { transform: rotate(4deg); }
        }
        .xmas-theme [data-testid="success-page"] { height: auto; min-height: 100vh; }
        .xmas-theme [data-testid="success-page"] [role="dialog"] {
          position: relative;
          border-top: 4px solid var(--xmas-red);
          box-shadow: 0 0 0 1px color-mix(in srgb, var(--xmas-green) 25%, transparent), 0 18px 40px -16px color-mix(in srgb, var(--xmas-green) 45%, transparent);
        }
        @media (prefers-reduced-motion: reduce) {
          .xmas-flake, .xmas-ornament { animation: none !important; }
        }
      `}</style>

      {/* Snow — behind the content so the card stays readable */}
      {snowEnabled && (
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true" style={{ opacity: snowOpacity }}>
          {flakes.map((f, i) => (
            <span
              key={i}
              className="xmas-flake absolute top-0 rounded-full bg-white"
              style={
                {
                  left: `${f.left}%`,
                  width: f.size,
                  height: f.size,
                  filter: f.blur ? "blur(1px)" : undefined,
                  boxShadow: "0 0 4px rgba(150,170,190,0.9)",
                  "--xmas-drift": `${f.drift}px`,
                  animation: `xmas-snowfall ${snowFallSeconds * f.speed}s linear ${f.delay * snowFallSeconds * f.speed}s infinite`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      {/* Garland with hanging ornaments */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20" aria-hidden="true">
        <div
          style={{
            height: 10,
            background: `repeating-linear-gradient(135deg, ${festiveRed} 0 14px, #ffffff 14px 22px, ${festiveGreen} 22px 36px, #ffffff 36px 44px)`,
            boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
          }}
        />
        <div className="flex justify-between px-[6%]">
          {ornaments.map((o, i) => (
            <div
              key={i}
              className="xmas-ornament"
              style={{
                transformOrigin: "top center",
                animation: `xmas-sway ${3 + (i % 3)}s ease-in-out ${-i * 0.4}s infinite`,
              }}>
              <Ornament {...o} />
            </div>
          ))}
        </div>
      </div>

      {/* Holly in the lower corners */}
      <Holly
        red={festiveRed}
        green={festiveGreen}
        className="pointer-events-none absolute bottom-4 left-4 z-20 w-28 sm:w-36"
        style={{ transform: "rotate(-12deg)" }}
      />
      <Holly
        red={festiveRed}
        green={festiveGreen}
        className="pointer-events-none absolute bottom-4 right-4 z-20 w-28 sm:w-36"
        style={{ transform: "rotate(12deg) scaleX(-1)" }}
      />

      {/* Seasonal greeting */}
      <div className="relative z-10 flex justify-center pt-20">
        <span
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold text-white shadow-sm"
          style={{ background: `linear-gradient(90deg, ${festiveRed}, ${festiveGreen})` }}>
          <span aria-hidden="true">🎄</span>
          Happy Holidays — see you soon!
          <span aria-hidden="true">❄️</span>
        </span>
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
