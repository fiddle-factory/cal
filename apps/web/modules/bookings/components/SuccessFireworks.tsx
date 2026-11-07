"use client";

import React from "react";
import type { CSSProperties } from "react";

type Burst = { x: number; y: number; delay: number; scale: number };

// Bursts are positioned relative to the center of the success checkmark circle.
const BURSTS: Burst[] = [
  { x: 0, y: 0, delay: 0, scale: 1 },
  { x: -40, y: -14, delay: 0.35, scale: 0.6 },
  { x: 42, y: -8, delay: 0.6, scale: 0.65 },
  { x: -22, y: 22, delay: 0.9, scale: 0.5 },
  { x: 26, y: 24, delay: 1.1, scale: 0.5 },
];

const FIREWORKS_CSS = `
@keyframes cal-firework-particle {
  0% { transform: rotate(var(--fw-angle)) translateY(0) scaleY(0.3); opacity: 0; }
  12% { opacity: 1; }
  70% { opacity: 0.9; }
  100% { transform: rotate(var(--fw-angle)) translateY(calc(var(--fw-radius) * -1)) scaleY(1); opacity: 0; }
}
@keyframes cal-firework-flash {
  0% { transform: translate(-50%, -50%) scale(0.2); opacity: 0.7; }
  100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .cal-success-fireworks { display: none; }
}
`;

export function SuccessFireworks() {
  const [burstColor, setBurstColor] = React.useState("#22c55e");
  const [accentColor, setAccentColor] = React.useState("#facc15");
  const [speed, setSpeed] = React.useState(1.2);
  const [particleCount, setParticleCount] = React.useState(12);
  const [burstRadius, setBurstRadius] = React.useState(44);
  const [loop, setLoop] = React.useState(false);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="SuccessFireworks-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.burstColor === "string") setBurstColor(p.burstColor);
      if (typeof p.accentColor === "string") setAccentColor(p.accentColor);
      if (typeof p.speed === "number") setSpeed(p.speed);
      if (typeof p.particleCount === "number") setParticleCount(p.particleCount);
      if (typeof p.burstRadius === "number") setBurstRadius(p.burstRadius);
      if (typeof p.loop === "boolean") setLoop(p.loop);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const count = Math.max(3, Math.round(particleCount));
  const iteration = loop ? "infinite" : "1";

  return (
    <div
      aria-hidden="true"
      data-config-id="SuccessFireworks-controls"
      className="cal-success-fireworks pointer-events-none absolute left-1/2 top-1/2 -z-10 h-0 w-0">
      <style>{FIREWORKS_CSS}</style>
      {/* Remount on tuning so the animation replays with the new values */}
      <div key={`${speed}-${count}-${burstRadius}-${loop}`}>
        {BURSTS.map((burst, burstIndex) => {
          const radius = burstRadius * burst.scale;
          const delay = burst.delay * speed;
          return (
            <div
              key={burstIndex}
              className="absolute"
              style={{ left: burst.x, top: burst.y, width: 0, height: 0 }}>
              <span
                className="absolute left-0 top-0 rounded-full"
                style={{
                  width: radius * 1.4,
                  height: radius * 1.4,
                  background: `radial-gradient(circle, ${burstIndex % 2 ? accentColor : burstColor}55 0%, transparent 70%)`,
                  opacity: 0,
                  animation: `cal-firework-flash ${speed * 0.6}s ease-out ${delay}s ${iteration} both`,
                }}
              />
              {Array.from({ length: count }).map((_, i) => {
                const color = (i + burstIndex) % 2 === 0 ? burstColor : accentColor;
                const style = {
                  "--fw-angle": `${(360 / count) * i}deg`,
                  "--fw-radius": `${radius}px`,
                  width: 3,
                  height: Math.max(6, radius * 0.28),
                  marginLeft: -1.5,
                  background: `linear-gradient(to top, transparent, ${color})`,
                  transformOrigin: "50% 0%",
                  opacity: 0,
                  animation: `cal-firework-particle ${speed}s cubic-bezier(0.15, 0.7, 0.3, 1) ${delay}s ${iteration} both`,
                } as CSSProperties;
                return <span key={i} className="absolute left-0 top-0 rounded-full" style={style} />;
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SuccessFireworks;
