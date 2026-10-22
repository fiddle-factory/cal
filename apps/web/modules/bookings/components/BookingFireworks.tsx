import type { CSSProperties } from "react";
import { useMemo } from "react";

// Design-system visualization palette (packages/config/theme/tokens.css)
const FIREWORK_COLORS = [
  "var(--cal-bg-visualization-1-emphasis)",
  "var(--cal-bg-visualization-2-emphasis)",
  "var(--cal-bg-visualization-3-emphasis)",
  "var(--cal-bg-visualization-4-emphasis)",
  "var(--cal-bg-visualization-5-emphasis)",
  "var(--cal-bg-visualization-6-emphasis)",
  "var(--cal-bg-visualization-7-emphasis)",
];

// Burst positions (percent of the screen) kept to the sides and top so the card stays clear
const BURST_POSITIONS: Array<[number, number]> = [
  [14, 30],
  [86, 24],
  [22, 62],
  [80, 58],
  [50, 10],
  [8, 46],
  [92, 42],
  [32, 16],
  [68, 14],
  [50, 88],
];

const ROCKET_DURATION = 0.6;

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

export interface BookingFireworksProps {
  burstCount: number;
  particleCount: number;
  duration: number;
  particleSize: number;
  opacity: number;
}

export function BookingFireworks({
  burstCount,
  particleCount,
  duration,
  particleSize,
  opacity,
}: BookingFireworksProps) {
  const bursts = useMemo(() => {
    const random = seededRandom(42);
    return Array.from({ length: Math.max(0, Math.round(burstCount)) }, (_, burstIndex) => {
      const [x, y] = BURST_POSITIONS[burstIndex % BURST_POSITIONS.length];
      const delay = burstIndex * 0.35 + random() * 0.15;
      const color = FIREWORK_COLORS[burstIndex % FIREWORK_COLORS.length];
      const accent = FIREWORK_COLORS[(burstIndex + 3) % FIREWORK_COLORS.length];
      const radius = 70 + random() * 50;
      const count = Math.max(1, Math.round(particleCount));
      const particles = Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + random() * 0.2;
        const distance = radius * (0.7 + random() * 0.3);
        return {
          dx: Math.cos(angle) * distance,
          dy: Math.sin(angle) * distance,
          color: i % 3 === 0 ? accent : color,
        };
      });
      return { x, y, delay, color, particles };
    });
  }, [burstCount, particleCount]);

  return (
    <div
      className="cal-fireworks pointer-events-none absolute inset-0 overflow-hidden"
      style={{ opacity }}
      aria-hidden="true">
      <style>{`
        @keyframes cal-firework-rocket {
          0% { transform: translate(-50%, var(--rise)); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: translate(-50%, 0); opacity: 0; }
        }
        @keyframes cal-firework-flash {
          0% { transform: translate(-50%, -50%) scale(0.2); opacity: 0; }
          20% { opacity: 0.35; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
        @keyframes cal-firework-particle {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
          8% { opacity: 1; }
          70% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.8); opacity: 0.9; }
          100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy) + 28px)) scale(0.3); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cal-fireworks { display: none; }
        }
      `}</style>
      {bursts.map((burst, burstIndex) => (
        <div
          key={burstIndex}
          className="absolute"
          style={{ left: `${burst.x}%`, top: `${burst.y}%`, width: 0, height: 0 }}>
          <span
            className="absolute rounded-full"
            style={
              {
                width: 3,
                height: 14,
                left: 0,
                top: 0,
                background: burst.color,
                "--rise": "40vh",
                animation: `cal-firework-rocket ${ROCKET_DURATION}s ease-out ${burst.delay}s both`,
              } as CSSProperties
            }
          />
          <span
            className="absolute rounded-full"
            style={{
              width: 180,
              height: 180,
              left: 0,
              top: 0,
              background: `radial-gradient(circle, ${burst.color} 0%, transparent 65%)`,
              animation: `cal-firework-flash ${duration * 0.6}s ease-out ${burst.delay + ROCKET_DURATION}s both`,
            }}
          />
          {burst.particles.map((particle, i) => (
            <span
              key={i}
              className="absolute rounded-full"
              style={
                {
                  width: particleSize,
                  height: particleSize,
                  left: 0,
                  top: 0,
                  background: particle.color,
                  boxShadow: `0 0 ${particleSize * 2}px ${particle.color}`,
                  "--dx": `${particle.dx}px`,
                  "--dy": `${particle.dy}px`,
                  animation: `cal-firework-particle ${duration}s cubic-bezier(0.15, 0.7, 0.3, 1) ${
                    burst.delay + ROCKET_DURATION
                  }s both`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      ))}
    </div>
  );
}
