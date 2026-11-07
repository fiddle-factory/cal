"use client";

import * as React from "react";

import { Icon } from "@calcom/ui/components/icon";

/**
 * Christmas-themed decorations for the booking success card.
 * Pure CSS/SVG: falling snow, a candy-cane garland, holly sprigs and an ornament-style checkmark.
 */

const FESTIVE_KEYFRAMES = `
@keyframes xmas-snowfall {
  0% { top: -6%; transform: translateX(0); }
  50% { transform: translateX(var(--xmas-drift, 12px)); }
  100% { top: 104%; transform: translateX(0); }
}
@keyframes xmas-ornament-swing {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}
@media (prefers-reduced-motion: reduce) {
  .xmas-flake { animation: none !important; display: none; }
  .xmas-ornament { animation: none !important; }
}
`;

function HollySprig({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 48 32" className={className} style={style} aria-hidden="true">
      <path
        d="M24 18 C18 6 8 4 2 8 C6 9 6 13 4 15 C8 15 10 18 9 21 C13 18 19 19 24 18 Z"
        fill="var(--xmas-holly)"
      />
      <path
        d="M24 18 C30 6 40 4 46 8 C42 9 42 13 44 15 C40 15 38 18 39 21 C35 18 29 19 24 18 Z"
        fill="var(--xmas-holly)"
      />
      <path d="M24 18 L10 12 M24 18 L38 12" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" fill="none" />
      <circle cx="21" cy="20" r="3.4" fill="var(--xmas-ornament)" />
      <circle cx="27" cy="20" r="3.4" fill="var(--xmas-ornament)" />
      <circle cx="24" cy="24.5" r="3.4" fill="var(--xmas-ornament)" />
      <circle cx="20" cy="19" r="1" fill="rgba(255,255,255,0.6)" />
      <circle cx="26" cy="19" r="1" fill="rgba(255,255,255,0.6)" />
      <circle cx="23" cy="23.5" r="1" fill="rgba(255,255,255,0.6)" />
    </svg>
  );
}

/** Ornament-style replacement for the green success checkmark. Reads colors from the festive card. */
export function ChristmasOrnamentCheck() {
  return (
    <span
      className="xmas-ornament relative flex h-12 w-12 items-center justify-center"
      style={{ animation: "xmas-ornament-swing 3.2s ease-in-out infinite", transformOrigin: "50% -6px" }}>
      {/* cap + hook */}
      <span
        className="absolute left-1/2 h-2 w-4 -translate-x-1/2 rounded-sm"
        style={{ top: -6, background: "linear-gradient(180deg, #f6d77a, #c89b2c)" }}
      />
      <span
        className="absolute left-1/2 h-2 w-2 -translate-x-1/2 rounded-full border-2"
        style={{ top: -12, borderColor: "#c89b2c" }}
      />
      {/* bauble */}
      <span
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{
          background:
            "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.65) 0, rgba(255,255,255,0) 38%), var(--xmas-ornament)",
          boxShadow: "inset 0 -5px 10px rgba(0,0,0,0.25), 0 4px 10px rgba(0,0,0,0.12)",
        }}>
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full"
          style={{ background: "var(--xmas-holly)", boxShadow: "0 0 0 2px rgba(255,255,255,0.85)" }}>
          <Icon name="check" className="h-4 w-4 text-white" />
        </span>
      </span>
      <HollySprig className="absolute h-5 w-8" style={{ top: -14, left: -16, transform: "rotate(-18deg)" }} />
    </span>
  );
}

type FestiveCardProps = {
  enabled: boolean;
  children: React.ReactNode;
};

/** Wraps the booking card content; renders snow, garland and holly accents when enabled. */
export function ChristmasFestiveCard({ enabled, children }: FestiveCardProps) {
  const [snowAmount, setSnowAmount] = React.useState(40);
  const [snowSpeed, setSnowSpeed] = React.useState(1);
  const [snowSize, setSnowSize] = React.useState(5);
  const [snowColor, setSnowColor] = React.useState("#b8cfe6");
  const [showSnow, setShowSnow] = React.useState(true);
  const [ornamentColor, setOrnamentColor] = React.useState("#c62828");
  const [hollyColor, setHollyColor] = React.useState("#1b7a3e");

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="ChristmasFestiveCard-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.snowAmount === "number") setSnowAmount(p.snowAmount);
      if (typeof p.snowSpeed === "number") setSnowSpeed(p.snowSpeed);
      if (typeof p.snowSize === "number") setSnowSize(p.snowSize);
      if (typeof p.snowColor === "string") setSnowColor(p.snowColor);
      if (typeof p.showSnow === "boolean") setShowSnow(p.showSnow);
      if (typeof p.ornamentColor === "string") setOrnamentColor(p.ornamentColor);
      if (typeof p.hollyColor === "string") setHollyColor(p.hollyColor);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, [enabled]);
  // geneditor-listener-end

  const flakes = React.useMemo(() => {
    const count = Math.max(0, Math.round(snowAmount));
    return Array.from({ length: count }, (_, i) => {
      // Deterministic pseudo-random spread so server and client render match.
      const r1 = ((i * 37.71) % 100) / 100;
      const r2 = ((i * 53.13 + 17) % 100) / 100;
      const r3 = ((i * 71.37 + 41) % 100) / 100;
      return {
        left: r1 * 100,
        scale: 0.5 + r2 * 0.8,
        baseDuration: 7 + r3 * 7,
        delayFactor: r2,
        drift: (r3 - 0.5) * 36,
        opacity: 0.55 + r1 * 0.4,
      };
    });
  }, [snowAmount]);

  if (!enabled) return <>{children}</>;

  const speed = Math.max(0.1, snowSpeed);

  return (
    <div
      data-config-id="ChristmasFestiveCard-controls"
      className="contents"
      style={
        {
          "--xmas-ornament": ornamentColor,
          "--xmas-holly": hollyColor,
        } as React.CSSProperties
      }>
      <style>{FESTIVE_KEYFRAMES}</style>

      {/* Snow layer */}
      {showSnow && (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
          {flakes.map((flake, i) => {
            const duration = flake.baseDuration / speed;
            const size = Math.max(1, snowSize * flake.scale);
            return (
              <span
                key={i}
                className="xmas-flake absolute rounded-full"
                style={
                  {
                    left: `${flake.left}%`,
                    top: "-6%",
                    width: size,
                    height: size,
                    background: snowColor,
                    opacity: flake.opacity,
                    boxShadow: `0 0 ${size}px ${snowColor}`,
                    "--xmas-drift": `${flake.drift}px`,
                    animation: `xmas-snowfall ${duration}s linear ${-flake.delayFactor * duration}s infinite`,
                  } as React.CSSProperties
                }
              />
            );
          })}
        </div>
      )}

      {/* Candy-cane garland along the top edge */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1.5"
        aria-hidden="true"
        style={{
          background:
            "repeating-linear-gradient(135deg, var(--xmas-ornament) 0 10px, #ffffff 10px 16px, var(--xmas-holly) 16px 26px, #ffffff 26px 32px)",
        }}
      />

      {/* Holly sprigs in the top corners */}
      <HollySprig
        className="pointer-events-none absolute h-8 w-12"
        style={{ top: 8, left: 6, transform: "rotate(-12deg)" }}
      />
      <HollySprig
        className="pointer-events-none absolute h-8 w-12"
        style={{ top: 8, right: 6, transform: "scaleX(-1) rotate(-12deg)" }}
      />

      {children}
    </div>
  );
}
