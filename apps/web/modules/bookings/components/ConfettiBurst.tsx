import { useEffect, useMemo, useRef } from "react";

// Design-system visualization colors (theme-aware CSS variables)
const CONFETTI_COLORS = [
  "var(--cal-bg-visualization-1-emphasis)",
  "var(--cal-bg-visualization-2-emphasis)",
  "var(--cal-bg-visualization-3-emphasis)",
  "var(--cal-bg-visualization-4-emphasis)",
  "var(--cal-bg-visualization-5-emphasis)",
  "var(--cal-bg-visualization-6-emphasis)",
  "var(--cal-bg-visualization-7-emphasis)",
];

export interface ConfettiBurstProps {
  enabled?: boolean;
  count?: number;
  /** Duration in milliseconds */
  duration?: number;
  /** Max travel distance in px */
  spread?: number;
  /** Base particle size in px */
  size?: number;
}

// Deterministic pseudo-random generator so server and client render the same particles
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function ConfettiBurst({
  enabled = true,
  count = 60,
  duration = 1800,
  spread = 260,
  size = 8,
}: ConfettiBurstProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const particles = useMemo(() => {
    const rand = seededRandom(42);
    return Array.from({ length: Math.max(0, Math.round(count)) }, (_, i) => {
      // Mostly upward fan, slightly wider than a semicircle
      const angle = -Math.PI / 2 + (rand() - 0.5) * Math.PI * 1.3;
      const distance = spread * (0.45 + rand() * 0.55);
      return {
        id: i,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
        rotate: (rand() - 0.5) * 1080,
        scale: 0.6 + rand() * 0.8,
        isCircle: rand() > 0.65,
        delay: rand() * 120,
      };
    });
  }, [count, spread]);

  useEffect(() => {
    const container = containerRef.current;
    if (!enabled || !container || typeof container.animate !== "function") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const pieces = Array.from(container.children) as HTMLElement[];
    const animations = pieces.map((piece, i) => {
      const p = particles[i];
      const fall = spread * 0.6;
      return piece.animate(
        [
          { transform: "translate(-50%, -50%) translate(0, 0) rotate(0deg) scale(0.3)", opacity: 1 },
          {
            transform: `translate(-50%, -50%) translate(${p.dx}px, ${p.dy}px) rotate(${p.rotate * 0.6}deg) scale(${p.scale})`,
            opacity: 1,
            offset: 0.35,
          },
          {
            transform: `translate(-50%, -50%) translate(${p.dx * 1.25}px, ${p.dy + fall}px) rotate(${p.rotate}deg) scale(${p.scale})`,
            opacity: 0,
          },
        ],
        {
          duration,
          delay: p.delay,
          easing: "cubic-bezier(0.2, 0.7, 0.4, 1)",
          fill: "both",
        }
      );
    });

    return () => animations.forEach((a) => a.cancel());
    // size is included so tweaking it replays the burst
  }, [enabled, particles, duration, spread, size]);

  if (!enabled) return null;

  return (
    <div ref={containerRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute left-1/2"
          style={{
            top: "50%",
            width: size,
            height: p.isCircle ? size : size * 0.45,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? "9999px" : "1px",
            opacity: 0,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
}
