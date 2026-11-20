import type { CSSProperties } from "react";
import React, { useState } from "react";

export type SeasonalTheme = "christmas";

/**
 * Overrides the Cal design tokens for everything inside the card so existing
 * utilities (bg-default, text-emphasis, border-subtle, …) pick up the
 * cozy evergreen & gold palette.
 */
export const christmasThemeStyle = {
  "--cal-bg": "#13362A",
  "--cal-bg-muted": "#13362A",
  "--cal-bg-subtle": "#1B4636",
  "--cal-bg-emphasis": "#25563F",
  "--cal-bg-success": "rgba(230, 195, 106, 0.16)",
  "--cal-text": "#F4ECDA",
  "--cal-text-emphasis": "#E9C873",
  "--cal-text-subtle": "#D3C7A8",
  "--cal-text-muted": "#AFA386",
  "--cal-border": "rgba(233, 200, 115, 0.55)",
  "--cal-border-subtle": "rgba(233, 200, 115, 0.3)",
  "--cal-border-booker": "#C9A24A",
  boxShadow: "0 0 0 4px rgba(122, 28, 40, 0.9), 0 0 0 5px rgba(201, 162, 74, 0.6), 0 24px 48px -16px rgba(0, 0, 0, 0.45)",
} as CSSProperties;

const BULB_COLORS = ["#E2453C", "#F2C14E", "#4CB97A", "#FFF1CC"];
const SWAGS = 6;
const WIRE_TOP = 4;
const WIRE_DIP = 24;

// Points along a quadratic swag from (0, WIRE_TOP) through control (0.5, WIRE_DIP) to (1, WIRE_TOP)
const swagY = (t: number) => (1 - t) ** 2 * WIRE_TOP + 2 * t * (1 - t) * WIRE_DIP + t ** 2 * WIRE_TOP;

const BULBS = Array.from({ length: SWAGS }, (_, swag) =>
  [0.25, 0.5, 0.75].map((t) => ({ x: ((swag + t) / SWAGS) * 100, y: swagY(t) }))
).flat();

const WIRE_PATH = Array.from({ length: SWAGS }, (_, swag) => {
  const x0 = (swag / SWAGS) * 400;
  const x1 = ((swag + 1) / SWAGS) * 400;
  return `${swag === 0 ? `M${x0},${WIRE_TOP}` : ""} Q${(x0 + x1) / 2},${WIRE_DIP} ${x1},${WIRE_TOP}`;
}).join(" ");

export function ChristmasLights() {
  const [twinkleSpeed, setTwinkleSpeed] = useState(1.6);
  const [glowSize, setGlowSize] = useState(8);
  const [bulbSize, setBulbSize] = useState(9);
  const [twinkle, setTwinkle] = useState(true);
  const [wireColor, setWireColor] = useState("#C9A24A");

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="ChristmasLights-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.twinkleSpeed === "number") setTwinkleSpeed(p.twinkleSpeed);
      if (typeof p.glowSize === "number") setGlowSize(p.glowSize);
      if (typeof p.bulbSize === "number") setBulbSize(p.bulbSize);
      if (typeof p.twinkle === "boolean") setTwinkle(p.twinkle);
      if (typeof p.wireColor === "string") setWireColor(p.wireColor);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  return (
    <div
      data-config-id="ChristmasLights-controls"
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-10">
      <style>{`
        @keyframes cal-xmas-twinkle {
          0%, 100% { opacity: 1; filter: brightness(1.1); }
          50% { opacity: 0.35; filter: brightness(0.7); }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-xmas-bulb] { animation: none !important; }
        }
      `}</style>
      <svg
        className="absolute inset-x-0 top-0 h-[30px] w-full"
        viewBox="0 0 400 30"
        preserveAspectRatio="none"
        fill="none">
        <path d={WIRE_PATH} stroke={wireColor} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      </svg>
      {BULBS.map((bulb, i) => {
        const color = BULB_COLORS[i % BULB_COLORS.length];
        return (
          <span
            key={i}
            className="absolute flex flex-col items-center"
            style={{ left: `${bulb.x}%`, top: bulb.y - 1, transform: `translateX(-50%) rotate(${i % 2 ? 8 : -8}deg)` }}>
            <span className="block h-[4px] w-[5px] rounded-[1px]" style={{ backgroundColor: wireColor }} />
            <span
              data-xmas-bulb
              className="block rounded-full"
              style={{
                width: bulbSize,
                height: bulbSize * 1.35,
                backgroundColor: color,
                boxShadow: `0 0 ${glowSize}px ${glowSize / 3}px ${color}`,
                animation:
                  twinkle
                    ? `cal-xmas-twinkle ${twinkleSpeed * (0.8 + ((i * 7) % 5) * 0.1)}s ease-in-out ${
                        ((i * 3) % 7) * 0.23
                      }s infinite`
                    : undefined,
              }}
            />
          </span>
        );
      })}
    </div>
  );
}
