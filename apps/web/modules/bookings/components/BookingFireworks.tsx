import type { CSSProperties } from "react";

// Vivid design-system tokens (packages/config/theme/tokens.css), with fallbacks matching their light values.
const FIREWORK_COLORS = [
  "var(--cal-bg-visualization-1-emphasis, hsla(330, 81%, 60%, 1))",
  "var(--cal-bg-visualization-2-emphasis, hsla(256, 85%, 57%, 1))",
  "var(--cal-bg-visualization-3-emphasis, hsla(235, 100%, 63%, 1))",
  "var(--cal-bg-visualization-4-emphasis, hsla(158, 74%, 38%, 1))",
  "var(--cal-bg-visualization-5-emphasis, hsla(45, 93%, 47%, 1))",
  "var(--cal-bg-visualization-6-emphasis, hsla(25, 95%, 53%, 1))",
  "var(--cal-bg-visualization-7-emphasis, hsla(0, 84%, 60%, 1))",
];

// Burst positions around the card (percent of the page), staggered in time.
const BURSTS = [
  { x: 14, y: 18, delay: 0, scale: 1, color: 0 },
  { x: 86, y: 22, delay: 0.35, scale: 1.1, color: 4 },
  { x: 50, y: 6, delay: 0.7, scale: 0.9, color: 2 },
  { x: 10, y: 58, delay: 1.05, scale: 0.85, color: 3 },
  { x: 90, y: 62, delay: 1.4, scale: 0.95, color: 6 },
  { x: 28, y: 36, delay: 1.75, scale: 0.8, color: 1 },
  { x: 72, y: 40, delay: 2.1, scale: 0.9, color: 5 },
  { x: 50, y: 82, delay: 2.45, scale: 1, color: 0 },
];

const KEYFRAMES = `
@keyframes cal-firework-particle {
  0% { transform: rotate(var(--fw-angle)) translateX(0) scaleX(0.4); opacity: 0; }
  8% { opacity: 1; }
  65% { opacity: 1; }
  100% { transform: rotate(var(--fw-angle)) translateX(var(--fw-distance)) translateY(var(--fw-drop)) scaleX(0.15); opacity: 0; }
}
@keyframes cal-firework-flash {
  0% { transform: scale(0); opacity: 0; }
  10% { transform: scale(1); opacity: 0.9; }
  100% { transform: scale(2.4); opacity: 0; }
}
`;

export interface BookingFireworksProps {
  /** Seconds a single burst takes to expand and fade. */
  duration: number;
  burstCount: number;
  particleCount: number;
  /** Maximum burst radius in px. */
  spread: number;
  /** Particle thickness in px. */
  particleSize: number;
  loop: boolean;
}

export function BookingFireworks({
  duration,
  burstCount,
  particleCount,
  spread,
  particleSize,
  loop,
}: BookingFireworksProps) {
  const bursts = BURSTS.slice(0, Math.max(0, Math.min(BURSTS.length, Math.round(burstCount))));
  const particles = Math.max(1, Math.round(particleCount));
  const iterations = loop ? "infinite" : 2;
  // Keep bursts spaced relative to the burst duration.
  const timeScale = duration / 1.4;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden">
      <style>{KEYFRAMES}</style>
      {bursts.map((burst, burstIndex) => {
        const color = FIREWORK_COLORS[burst.color % FIREWORK_COLORS.length];
        const accent = FIREWORK_COLORS[(burst.color + 3) % FIREWORK_COLORS.length];
        const delay = burst.delay * timeScale;
        const radius = spread * burst.scale;
        const animationTiming = `${duration}s cubic-bezier(0.15, 0.6, 0.3, 1) ${delay}s ${iterations} both`;

        return (
          <div
            key={burstIndex}
            className="absolute h-0 w-0"
            style={{ left: `${burst.x}%`, top: `${burst.y}%` }}>
            <span
              className="absolute rounded-full"
              style={{
                width: particleSize * 6,
                height: particleSize * 6,
                left: -particleSize * 3,
                top: -particleSize * 3,
                background: color,
                filter: `blur(${particleSize}px)`,
                animation: `cal-firework-flash ${duration * 0.5}s ease-out ${delay}s ${iterations} both`,
              }}
            />
            {Array.from({ length: particles }).map((_, i) => {
              const angle = (360 / particles) * i + burstIndex * 11;
              const isAccent = i % 3 === 0;
              const distance = radius * (isAccent ? 0.7 : 1);
              return (
                <span
                  key={i}
                  className="absolute left-0 rounded-full"
                  style={
                    {
                      "--fw-angle": `${angle}deg`,
                      "--fw-distance": `${distance}px`,
                      "--fw-drop": `${particleSize * 2}px`,
                      width: particleSize * 4,
                      height: particleSize,
                      top: -particleSize / 2,
                      transformOrigin: "left center",
                      background: isAccent ? accent : color,
                      animation: `cal-firework-particle ${animationTiming}`,
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
