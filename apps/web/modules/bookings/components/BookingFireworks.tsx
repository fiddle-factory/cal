"use client";

import * as React from "react";

type BookingFireworksProps = {
  children: React.ReactNode;
};

// Burst origins (percent of the viewport) arranged around the centered confirmation card.
const BURST_POSITIONS: ReadonlyArray<{ left: number; top: number }> = [
  { left: 14, top: 22 },
  { left: 86, top: 18 },
  { left: 20, top: 72 },
  { left: 82, top: 68 },
  { left: 50, top: 7 },
  { left: 8, top: 46 },
  { left: 92, top: 44 },
  { left: 50, top: 92 },
];

const KEYFRAMES = `
@keyframes cal-firework-particle {
  0% { transform: translate(0, 0) scale(1); opacity: 0; }
  8% { opacity: 1; }
  65% { opacity: 1; }
  100% { transform: translate(var(--cal-fw-dx), calc(var(--cal-fw-dy) + 24px)) scale(0.2); opacity: 0; }
}
@keyframes cal-firework-flash {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
  10% { transform: translate(-50%, -50%) scale(1); opacity: 0.9; }
  40% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
  100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
}
`;

/**
 * Celebratory fireworks rendered behind (and around) the booking confirmation card.
 * The bursts are decorative only and are hidden for users who prefer reduced motion.
 */
export function BookingFireworks({ children }: BookingFireworksProps) {
  const [burstColor, setBurstColor] = React.useState("#f59e0b");
  const [accentColor, setAccentColor] = React.useState("#ec4899");
  const [burstCount, setBurstCount] = React.useState(6);
  const [particleCount, setParticleCount] = React.useState(14);
  const [duration, setDuration] = React.useState(1.6);
  const [spread, setSpread] = React.useState(90);
  const [repeat, setRepeat] = React.useState(true);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="BookingFireworks-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.burstColor === "string") setBurstColor(p.burstColor);
      if (typeof p.accentColor === "string") setAccentColor(p.accentColor);
      if (typeof p.burstCount === "number") setBurstCount(p.burstCount);
      if (typeof p.particleCount === "number") setParticleCount(p.particleCount);
      if (typeof p.duration === "number") setDuration(p.duration);
      if (typeof p.spread === "number") setSpread(p.spread);
      if (typeof p.repeat === "boolean") setRepeat(p.repeat);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const bursts = BURST_POSITIONS.slice(0, Math.max(1, Math.min(BURST_POSITIONS.length, burstCount)));
  const iterations = repeat ? "infinite" : "1";
  const replayKey = [burstColor, accentColor, burstCount, particleCount, duration, spread, repeat].join("|");

  return (
    <div data-config-id="BookingFireworks-controls" className="relative isolate min-h-screen overflow-hidden">
      <style>{KEYFRAMES}</style>
      <div key={replayKey} aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 motion-reduce:hidden">
        {bursts.map((position, burstIndex) => {
          const delay = burstIndex * duration * 0.35;
          // Slightly vary the radius of each burst so they don't look identical.
          const radius = spread * (0.8 + ((burstIndex * 37) % 40) / 100);
          return (
            <div
              key={`${position.left}-${position.top}`}
              className="absolute"
              style={{ left: `${position.left}%`, top: `${position.top}%` }}>
              <span
                className="absolute left-0 top-0 block rounded-full"
                style={{
                  width: radius * 0.5,
                  height: radius * 0.5,
                  background: `radial-gradient(circle, ${burstIndex % 2 ? accentColor : burstColor}66 0%, transparent 70%)`,
                  animation: `cal-firework-flash ${duration}s ease-out ${delay}s ${iterations} both`,
                }}
              />
              {Array.from({ length: particleCount }, (_, particleIndex) => {
                const angle = (particleIndex / particleCount) * Math.PI * 2 + burstIndex * 0.4;
                const dx = Math.cos(angle) * radius;
                const dy = Math.sin(angle) * radius;
                const color = (particleIndex + burstIndex) % 2 === 0 ? burstColor : accentColor;
                const style = {
                  "--cal-fw-dx": `${dx.toFixed(1)}px`,
                  "--cal-fw-dy": `${dy.toFixed(1)}px`,
                  width: 6,
                  height: 6,
                  marginLeft: -3,
                  marginTop: -3,
                  backgroundColor: color,
                  boxShadow: `0 0 8px 1px ${color}`,
                  animation: `cal-firework-particle ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s ${iterations} both`,
                } as React.CSSProperties;
                return <span key={particleIndex} className="absolute left-0 top-0 block rounded-full" style={style} />;
              })}
            </div>
          );
        })}
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default BookingFireworks;
