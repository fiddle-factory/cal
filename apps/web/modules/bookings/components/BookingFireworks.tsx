"use client";

import React, { useState } from "react";
import type { CSSProperties } from "react";

// Burst anchor points (percent of the layer), weighted towards the sides so bursts frame the card.
const BURST_POSITIONS: { top: number; left: number }[] = [
  { top: 18, left: 7 },
  { top: 22, left: 93 },
  { top: 62, left: 4 },
  { top: 55, left: 96 },
  { top: 4, left: 30 },
  { top: 6, left: 72 },
  { top: 88, left: 9 },
  { top: 84, left: 91 },
];

const PARTICLES_PER_BURST = 14;
// Burst radius in px at size 1.
const BASE_BURST_RADIUS = 70;

const clampPercent = (value: number) => Math.max(2, Math.min(98, value));

const KEYFRAMES = `
@keyframes cal-fw-particle {
  0% { transform: rotate(var(--fw-angle)) translateY(0) scaleY(0.3); opacity: 0; }
  8% { opacity: 1; }
  65% { opacity: 1; }
  100% { transform: rotate(var(--fw-angle)) translateY(calc(var(--fw-distance) * -1)) scaleY(1); opacity: 0; }
}
@keyframes cal-fw-flash {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
  10% { opacity: 0.9; }
  40% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
}
`;

/**
 * Decorative CSS-only fireworks rendered behind the booking confirmation card.
 * Hidden for users who prefer reduced motion.
 */
export function BookingFireworks() {
  const [colorA, setColorA] = useState("#fbbf24");
  const [colorB, setColorB] = useState("#f472b6");
  const [colorC, setColorC] = useState("#60a5fa");
  const [burstCount, setBurstCount] = useState(6);
  const [duration, setDuration] = useState(2.4);
  const [size, setSize] = useState(1);
  const [loop, setLoop] = useState(false);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="BookingFireworks-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.colorA === "string") setColorA(p.colorA);
      if (typeof p.colorB === "string") setColorB(p.colorB);
      if (typeof p.colorC === "string") setColorC(p.colorC);
      if (typeof p.burstCount === "number") setBurstCount(p.burstCount);
      if (typeof p.duration === "number") setDuration(p.duration);
      if (typeof p.size === "number") setSize(p.size);
      if (typeof p.loop === "boolean") setLoop(p.loop);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const colors = [colorA, colorB, colorC];
  const iterations = loop ? "infinite" : 2;
  const bursts = BURST_POSITIONS.slice(0, Math.max(0, Math.min(BURST_POSITIONS.length, burstCount)));
  // Overall size: scales burst radius, particle dimensions and how far bursts spread from the centre.
  const scale = Math.max(0.1, size);
  const burstRadius = BASE_BURST_RADIUS * scale;
  const particleWidth = 3 * scale;
  const particleHeight = 10 * scale;
  // Replay the animation when tuning values so changes are visible even after a non-looping run ended.
  const replayKey = `${size}-${duration}-${burstCount}-${loop}`;

  return (
    <div
      data-config-id="BookingFireworks-controls"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden motion-reduce:hidden">
      <style>{KEYFRAMES}</style>
      <React.Fragment key={replayKey}>
      {bursts.map((pos, burstIndex) => {
        const color = colors[burstIndex % colors.length];
        const delay = (burstIndex * duration) / Math.max(bursts.length, 1) / 1.5;
        const timing: CSSProperties = {
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          animationIterationCount: iterations,
          animationFillMode: "both",
        };
        return (
          <div
            key={`${pos.top}-${pos.left}`}
            className="absolute h-0 w-0"
            style={{
              top: `${clampPercent(50 + (pos.top - 50) * scale)}%`,
              left: `${clampPercent(50 + (pos.left - 50) * scale)}%`,
            }}>
            <span
              className="absolute left-0 top-0 rounded-full"
              style={{
                ...timing,
                width: burstRadius * 0.9,
                height: burstRadius * 0.9,
                background: `radial-gradient(circle, ${color}99 0%, ${color}00 70%)`,
                animationName: "cal-fw-flash",
                animationTimingFunction: "ease-out",
              }}
            />
            {Array.from({ length: PARTICLES_PER_BURST }).map((_, particleIndex) => {
              const angle = (360 / PARTICLES_PER_BURST) * particleIndex;
              const particleColor = particleIndex % 3 === 0 ? colors[(burstIndex + 1) % colors.length] : color;
              return (
                <span
                  key={particleIndex}
                  className="absolute rounded-full"
                  style={
                    {
                      ...timing,
                      left: -particleWidth / 2,
                      top: -particleHeight,
                      width: particleWidth,
                      height: particleHeight,
                      transformOrigin: "50% 100%",
                      background: `linear-gradient(to top, ${particleColor}00, ${particleColor})`,
                      boxShadow: `0 0 ${6 * scale}px ${particleColor}`,
                      animationName: "cal-fw-particle",
                      animationTimingFunction: "cubic-bezier(0.15, 0.7, 0.3, 1)",
                      "--fw-angle": `${angle}deg`,
                      "--fw-distance": `${burstRadius * (particleIndex % 2 === 0 ? 1 : 0.8)}px`,
                    } as CSSProperties
                  }
                />
              );
            })}
          </div>
        );
      })}
      </React.Fragment>
    </div>
  );
}

export default BookingFireworks;
