"use client";

import * as React from "react";
import { useState } from "react";

const HOLLY_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M30 30C22 18 10 20 4 14c2 10 0 16 6 20 6 4 14 0 20-4z" fill="#15803d"/><path d="M34 30c8-12 20-10 26-16-2 10 0 16-6 20-6 4-14 0-20-4z" fill="#166534"/><circle cx="26" cy="34" r="6" fill="#dc2626"/><circle cx="38" cy="34" r="6" fill="#b91c1c"/><circle cx="32" cy="42" r="6" fill="#ef4444"/></svg>`
);

const LIGHT_COLORS = ["#ef4444", "#facc15", "#22c55e", "#3b82f6", "#f97316"];

export function ChristmasBookingTheme({ children }: { children: React.ReactNode }) {
  const [snowfall, setSnowfall] = useState(true);
  const [snowflakeCount, setSnowflakeCount] = useState(60);
  const [fallDuration, setFallDuration] = useState(12);
  const [snowOpacity, setSnowOpacity] = useState(0.85);
  const [accentColor, setAccentColor] = useState("#b91c1c");
  const [backdropColor, setBackdropColor] = useState("#0f3d2e");
  const [twinkleLights, setTwinkleLights] = useState(true);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="BookingConfirmationChristmas-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.snowfall === 'boolean') setSnowfall(p.snowfall);
      if (typeof p.snowflakeCount === 'number') setSnowflakeCount(p.snowflakeCount);
      if (typeof p.fallDuration === 'number') setFallDuration(p.fallDuration);
      if (typeof p.snowOpacity === 'number') setSnowOpacity(p.snowOpacity);
      if (typeof p.accentColor === 'string') setAccentColor(p.accentColor);
      if (typeof p.backdropColor === 'string') setBackdropColor(p.backdropColor);
      if (typeof p.twinkleLights === 'boolean') setTwinkleLights(p.twinkleLights);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const flakes = React.useMemo(
    () =>
      Array.from({ length: Math.max(0, Math.round(snowflakeCount)) }, (_, i) => {
        // Deterministic pseudo-random spread so the scene is stable between renders.
        const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
        return {
          left: r(1) * 100,
          size: 3 + r(2) * 6,
          delay: -r(3),
          speed: 0.7 + r(4) * 0.6,
          drift: (r(5) - 0.5) * 60,
        };
      }),
    [snowflakeCount]
  );

  const themeVars = {
    "--xmas-accent": accentColor,
    "--cal-bg": "#fffdf8",
    "--cal-bg-muted": "#fffdf8",
    "--cal-border-booker": accentColor,
    "--cal-border-booker-width": "2px",
    "--cal-bg-success": "#dcfce7",
    background: `radial-gradient(ellipse at top, ${backdropColor} 0%, #082119 70%, #05140f 100%)`,
  } as React.CSSProperties;

  return (
    <div
      data-config-id="BookingConfirmationChristmas-controls"
      data-christmas-theme=""
      style={{ ...themeVars, position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <style>{`
        @keyframes xmas-snow-fall {
          0% { transform: translate3d(0, -10vh, 0); }
          100% { transform: translate3d(var(--xmas-drift), 110vh, 0); }
        }
        @keyframes xmas-twinkle {
          0%, 100% { opacity: 1; filter: drop-shadow(0 0 6px currentColor); }
          50% { opacity: 0.35; filter: none; }
        }
        [data-christmas-theme] [data-testid="success-page"] { height: auto; }
        [data-christmas-theme] [role="dialog"] {
          position: relative;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35), 0 0 0 6px rgba(250, 204, 21, 0.18);
        }
        [data-christmas-theme] [role="dialog"]::before {
          content: "";
          position: absolute;
          inset: 0 0 auto 0;
          height: 8px;
          background: repeating-linear-gradient(135deg, var(--xmas-accent) 0 12px, #ffffff 12px 24px);
        }
        [data-christmas-theme] [role="dialog"]::after {
          content: "";
          position: absolute;
          top: 14px;
          right: 14px;
          width: 44px;
          height: 44px;
          background: url("data:image/svg+xml,${HOLLY_SVG}") center / contain no-repeat;
          pointer-events: none;
        }
        [data-christmas-theme] #modal-headline { color: var(--xmas-accent); }
      `}</style>

      <div
        aria-hidden="true"
        style={{
          position: "relative",
          height: 56,
          display: "flex",
          justifyContent: "space-around",
          alignItems: "flex-start",
          padding: "0 24px",
          zIndex: 2,
        }}>
        <svg
          viewBox="0 0 100 10"
          preserveAspectRatio="none"
          style={{ position: "absolute", inset: "0 0 auto 0", width: "100%", height: 24 }}>
          <path d="M0 2 Q 12.5 10 25 2 T 50 2 T 75 2 T 100 2" fill="none" stroke="#14532d" strokeWidth="0.6" />
        </svg>
        {Array.from({ length: 16 }, (_, i) => (
          <span
            key={i}
            style={{
              color: LIGHT_COLORS[i % LIGHT_COLORS.length],
              marginTop: i % 2 === 0 ? 14 : 8,
              width: 10,
              height: 16,
              borderRadius: "50% 50% 45% 45%",
              background: "currentColor",
              boxShadow: "0 0 10px currentColor",
              animation: twinkleLights ? `xmas-twinkle 1.6s ease-in-out ${(i % 4) * 0.4}s infinite` : "none",
            }}
          />
        ))}
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>

      {snowfall && (
        <div
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3, overflow: "hidden" }}>
          {flakes.map((flake, i) => (
            <span
              key={i}
              style={
                {
                  "--xmas-drift": `${flake.drift}px`,
                  position: "absolute",
                  top: 0,
                  left: `${flake.left}%`,
                  width: flake.size,
                  height: flake.size,
                  borderRadius: "50%",
                  background: "#ffffff",
                  opacity: snowOpacity,
                  boxShadow: "0 0 4px rgba(255,255,255,0.8)",
                  animation: `xmas-snow-fall ${fallDuration * flake.speed}s linear ${
                    flake.delay * fallDuration
                  }s infinite`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
