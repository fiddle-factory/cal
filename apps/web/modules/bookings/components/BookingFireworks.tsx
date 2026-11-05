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
  const [burstSize, setBurstSize] = useState(70);
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
      if (typeof p.burstSize === "number") setBurstSize(p.burstSize);
      if (typeof p.loop === "boolean") setLoop(p.loop);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const colors = [colorA, colorB, colorC];
  const iterations = loop ? "infinite" : 2;
  const bursts = BURST_POSITIONS.slice(0, Math.max(0, Math.min(BURST_POSITIONS.length, burstCount)));

  return (
    <div
      data-config-id="BookingFireworks-controls"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden motion-reduce:hidden">
      <style>{KEYFRAMES}</style>
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
            style={{ top: `${pos.top}%`, left: `${pos.left}%` }}>
            <span
              className="absolute left-0 top-0 rounded-full"
              style={{
                ...timing,
                width: burstSize * 0.9,
                height: burstSize * 0.9,
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
                      left: -1.5,
                      top: -10,
                      width: 3,
                      height: 10,
                      transformOrigin: "50% 100%",
                      background: `linear-gradient(to top, ${particleColor}00, ${particleColor})`,
                      boxShadow: `0 0 6px ${particleColor}`,
                      animationName: "cal-fw-particle",
                      animationTimingFunction: "cubic-bezier(0.15, 0.7, 0.3, 1)",
                      "--fw-angle": `${angle}deg`,
                      "--fw-distance": `${burstSize * (particleIndex % 2 === 0 ? 1 : 0.8)}px`,
                    } as CSSProperties
                  }
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default BookingFireworks;
