import React from "react";
import type { CSSProperties } from "react";

type Burst = {
  /** Horizontal position in % of the celebration layer */
  x: number;
  /** Vertical position in % of the celebration layer */
  y: number;
  /** Start offset in seconds */
  delay: number;
  /** Design system color tokens used by the particles of this burst */
  colors: [string, string];
};

const token = (name: string, fallback: string) => `var(--cal-${name}, ${fallback})`;

const PINK = token("bg-visualization-1-emphasis", "hsl(330, 81%, 60%)");
const VIOLET = token("bg-visualization-2-emphasis", "hsl(256, 85%, 57%)");
const BLUE = token("bg-visualization-3-emphasis", "hsl(235, 100%, 63%)");
const GREEN = token("bg-visualization-4-emphasis", "hsl(158, 74%, 38%)");
const YELLOW = token("bg-visualization-5-emphasis", "hsl(45, 93%, 47%)");
const ORANGE = token("bg-visualization-6-emphasis", "hsl(25, 95%, 53%)");

const BURSTS: Burst[] = [
  { x: 14, y: 18, delay: 0, colors: [GREEN, YELLOW] },
  { x: 86, y: 14, delay: 0.35, colors: [VIOLET, PINK] },
  { x: 50, y: 6, delay: 0.7, colors: [BLUE, GREEN] },
  { x: 8, y: 52, delay: 1.05, colors: [ORANGE, YELLOW] },
  { x: 92, y: 48, delay: 1.4, colors: [PINK, BLUE] },
  { x: 20, y: 82, delay: 1.75, colors: [YELLOW, VIOLET] },
  { x: 80, y: 80, delay: 2.1, colors: [GREEN, ORANGE] },
];

const KEYFRAMES = `
@keyframes cal-firework-particle {
  0% { transform: translate(-50%, -50%) translate(0, 0) scale(1); opacity: 0; }
  6% { opacity: 1; }
  65% { opacity: 1; }
  100% { transform: translate(-50%, -50%) translate(var(--fw-dx), calc(var(--fw-dy) + var(--fw-fall))) scale(0.3); opacity: 0; }
}
@keyframes cal-firework-flash {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
  8% { opacity: 0.5; }
  45% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .cal-fireworks { display: none; }
}
`;

export function FireworksCelebration() {
  const [showFireworks, setShowFireworks] = React.useState(true);
  const [loop, setLoop] = React.useState(true);
  const [burstDuration, setBurstDuration] = React.useState(1.6);
  const [particleCount, setParticleCount] = React.useState(14);
  const [burstRadius, setBurstRadius] = React.useState(90);
  const [particleSize, setParticleSize] = React.useState(6);
  const [fireworksOpacity, setFireworksOpacity] = React.useState(0.9);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="FireworksCelebration-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.showFireworks === "boolean") setShowFireworks(p.showFireworks);
      if (typeof p.loop === "boolean") setLoop(p.loop);
      if (typeof p.burstDuration === "number") setBurstDuration(p.burstDuration);
      if (typeof p.particleCount === "number") setParticleCount(p.particleCount);
      if (typeof p.burstRadius === "number") setBurstRadius(p.burstRadius);
      if (typeof p.particleSize === "number") setParticleSize(p.particleSize);
      if (typeof p.fireworksOpacity === "number") setFireworksOpacity(p.fireworksOpacity);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const count = Math.max(1, Math.round(particleCount));
  // Remount the bursts when the timing changes so the show replays from the start.
  const replayKey = `${loop}-${burstDuration}-${count}`;

  return (
    <div
      data-config-id="FireworksCelebration-controls"
      aria-hidden="true"
      className="cal-fireworks pointer-events-none absolute inset-0 z-0 overflow-hidden"
      style={{ opacity: showFireworks ? fireworksOpacity : 0 }}>
      <style>{KEYFRAMES}</style>
      {showFireworks &&
        BURSTS.map((burst, burstIndex) => {
          const iterations = loop ? "infinite" : 1;
          const flashStyle: CSSProperties = {
            left: `${burst.x}%`,
            top: `${burst.y}%`,
            width: burstRadius * 1.6,
            height: burstRadius * 1.6,
            background: `radial-gradient(circle, ${burst.colors[0]} 0%, transparent 65%)`,
            animation: `cal-firework-flash ${burstDuration}s ease-out ${burst.delay}s ${iterations} both`,
          };
          return (
            <React.Fragment key={`${replayKey}-${burstIndex}`}>
              <span className="absolute rounded-full" style={flashStyle} />
              {Array.from({ length: count }, (_, i) => {
                const angle = (i / count) * Math.PI * 2 + burstIndex * 0.4;
                // Deterministic variation so bursts look organic without randomness between renders.
                const spread = 0.7 + (((i * 37 + burstIndex * 11) % 10) / 10) * 0.3;
                const distance = burstRadius * spread;
                const style = {
                  left: `${burst.x}%`,
                  top: `${burst.y}%`,
                  width: particleSize,
                  height: particleSize,
                  backgroundColor: burst.colors[i % 2],
                  boxShadow: `0 0 ${particleSize * 1.5}px ${burst.colors[i % 2]}`,
                  "--fw-dx": `${Math.cos(angle) * distance}px`,
                  "--fw-dy": `${Math.sin(angle) * distance}px`,
                  "--fw-fall": `${burstRadius * 0.25}px`,
                  animation: `cal-firework-particle ${burstDuration}s cubic-bezier(0.15, 0.7, 0.3, 1) ${
                    burst.delay
                  }s ${iterations} both`,
                } as CSSProperties;
                return <span key={i} className="absolute rounded-full" style={style} />;
              })}
            </React.Fragment>
          );
        })}
    </div>
  );
}
