"use client";

import classNames from "classnames";
import React from "react";
import type { CSSProperties, ReactNode } from "react";

const MAX_SNOWFLAKES = 80;

// Deterministic pseudo-random values so server and client render the same flakes.
const seeded = (index: number, salt: number) => {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const SNOWFLAKES = Array.from({ length: MAX_SNOWFLAKES }, (_, index) => ({
  left: seeded(index, 1) * 100,
  size: 6 + seeded(index, 2) * 14,
  delay: -seeded(index, 3) * 20,
  durationFactor: 0.7 + seeded(index, 4) * 0.6,
  drift: (seeded(index, 5) - 0.5) * 80,
  opacity: 0.45 + seeded(index, 6) * 0.5,
  isCrystal: seeded(index, 7) > 0.55,
}));

export const SnowflakeGlyph = ({ className, style }: { className?: string; style?: CSSProperties }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
    aria-hidden="true">
    <path d="M12 2v20M4.93 6l14.14 12M19.07 6 4.93 18" />
    <path d="m9.5 3.5 2.5 2 2.5-2M9.5 20.5l2.5-2 2.5 2" />
    <path d="m4.2 9.4 3 .5-.8-3.1M19.8 14.6l-3-.5.8 3.1" />
    <path d="m19.8 9.4-3 .5.8-3.1M4.2 14.6l3-.5-.8 3.1" />
  </svg>
);

const winterStyles = `
.winter-wonderland {
  position: relative;
  isolation: isolate;
}
.winter-wonderland.winter-backdrop {
  background:
    radial-gradient(120% 60% at 50% 0%, color-mix(in srgb, var(--winter-ice) 28%, transparent) 0%, transparent 70%),
    linear-gradient(180deg, #e8f4fd 0%, #f3f9fe 55%, #ffffff 100%);
}
.dark .winter-wonderland.winter-backdrop {
  background:
    radial-gradient(120% 60% at 50% 0%, color-mix(in srgb, var(--winter-ice) 22%, transparent) 0%, transparent 70%),
    linear-gradient(180deg, #0a1628 0%, #0d1d33 55%, #0b1220 100%);
}
.winter-wonderland .winter-content {
  position: relative;
  z-index: 1;
}
.winter-wonderland .winter-card {
  position: relative;
  background-color: rgba(255, 255, 255, 0.82);
  border-color: color-mix(in srgb, var(--winter-ice) 55%, transparent);
  -webkit-backdrop-filter: blur(10px) saturate(1.2);
  backdrop-filter: blur(10px) saturate(1.2);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.6) inset,
    0 24px 60px -24px color-mix(in srgb, var(--winter-ice) calc(var(--winter-glow) * 100%), transparent);
}
.dark .winter-wonderland .winter-card {
  background-color: rgba(15, 26, 44, 0.78);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.06) inset,
    0 24px 60px -24px color-mix(in srgb, var(--winter-ice) calc(var(--winter-glow) * 100%), transparent);
}
.winter-wonderland .winter-card .border-subtle {
  border-color: color-mix(in srgb, var(--winter-ice) 35%, transparent);
}
.winter-wonderland .winter-frost-edge {
  position: absolute;
  inset: 0 0 auto 0;
  height: 6px;
  background: linear-gradient(90deg, transparent, var(--winter-ice), #ffffff, var(--winter-ice), transparent);
  opacity: 0.85;
}
.winter-wonderland .winter-badge {
  background: radial-gradient(circle at 30% 30%, #ffffff 0%, color-mix(in srgb, var(--winter-ice) 45%, #ffffff) 100%);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--winter-ice) 18%, transparent);
}
.winter-wonderland .winter-calendar-link {
  transition: border-color 150ms ease, box-shadow 150ms ease, color 150ms ease;
}
.winter-wonderland .winter-calendar-link:hover {
  border-color: var(--winter-ice);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--winter-ice) 20%, transparent);
}
.winter-snow {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}
.winter-snowflake {
  position: absolute;
  top: -24px;
  animation-name: winter-snowfall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform;
}
@keyframes winter-snowfall {
  0% { transform: translate3d(0, -5vh, 0) rotate(0deg); }
  50% { transform: translate3d(calc(var(--drift) * 1px), 50vh, 0) rotate(180deg); }
  100% { transform: translate3d(0, 105vh, 0) rotate(360deg); }
}
@media (prefers-reduced-motion: reduce) {
  .winter-snowflake { animation: none; top: calc(var(--rest-top) * 1%); }
}
`;

type WinterWonderlandProps = {
  children: ReactNode;
  className?: string;
  showBackdrop?: boolean;
  "data-testid"?: string;
};

export function WinterWonderland({
  children,
  className,
  showBackdrop = true,
  "data-testid": dataTestId,
}: WinterWonderlandProps) {
  const [snowfall, setSnowfall] = React.useState(true);
  const [snowflakeCount, setSnowflakeCount] = React.useState(40);
  const [fallDuration, setFallDuration] = React.useState(14);
  const [snowColor, setSnowColor] = React.useState("#ffffff");
  const [iceColor, setIceColor] = React.useState("#7cc4f0");
  const [frostGlow, setFrostGlow] = React.useState(0.45);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="WinterWonderland-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.snowfall === "boolean") setSnowfall(p.snowfall);
      if (typeof p.snowflakeCount === "number") setSnowflakeCount(p.snowflakeCount);
      if (typeof p.fallDuration === "number") setFallDuration(p.fallDuration);
      if (typeof p.snowColor === "string") setSnowColor(p.snowColor);
      if (typeof p.iceColor === "string") setIceColor(p.iceColor);
      if (typeof p.frostGlow === "number") setFrostGlow(p.frostGlow);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const flakes = SNOWFLAKES.slice(0, Math.max(0, Math.min(MAX_SNOWFLAKES, Math.round(snowflakeCount))));

  return (
    <div
      data-config-id="WinterWonderland-controls"
      data-testid={dataTestId}
      className={classNames("winter-wonderland", showBackdrop && "winter-backdrop", className)}
      style={{ "--winter-ice": iceColor, "--winter-glow": frostGlow } as CSSProperties}>
      <style>{winterStyles}</style>
      {showBackdrop && snowfall && (
        <div className="winter-snow" aria-hidden="true">
          {flakes.map((flake, index) => (
            <span
              key={index}
              className="winter-snowflake"
              style={
                {
                  left: `${flake.left}%`,
                  width: flake.size,
                  height: flake.size,
                  opacity: flake.opacity,
                  color: snowColor,
                  animationDuration: `${fallDuration * flake.durationFactor}s`,
                  animationDelay: `${flake.delay * (fallDuration / 14)}s`,
                  filter: `drop-shadow(0 0 2px ${iceColor})`,
                  "--drift": flake.drift,
                  "--rest-top": (index * 37) % 100,
                } as CSSProperties
              }>
              {flake.isCrystal ? (
                <SnowflakeGlyph className="h-full w-full" />
              ) : (
                <span
                  className="block h-1/2 w-1/2 rounded-full"
                  style={{ backgroundColor: snowColor, margin: "25%" }}
                />
              )}
            </span>
          ))}
        </div>
      )}
      <div className="winter-content h-full">{children}</div>
    </div>
  );
}

export default WinterWonderland;
