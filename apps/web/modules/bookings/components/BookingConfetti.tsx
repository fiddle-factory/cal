import { useEffect, useMemo, useRef, useState } from "react";

// Design-system tokens (with light-theme fallbacks) used for confetti pieces.
const CONFETTI_COLORS = [
  "var(--cal-brand, #111827)",
  "var(--cal-bg-semantic-success-emphasis, #19a974)",
  "var(--cal-text-semantic-attention, #9a3412)",
  "var(--cal-bg-semantic-info-emphasis, #0c1773)",
  "var(--cal-text-semantic-success, #096638)",
  "var(--cal-brand-emphasis, #0f0f0f)",
];

export interface BookingConfettiProps {
  /** Number of confetti pieces. */
  count?: number;
  /** Fall duration in seconds (each piece varies around this). */
  duration?: number;
  /** Turns the effect on or off. */
  enabled?: boolean;
}

interface Piece {
  left: number;
  width: number;
  height: number;
  color: string;
  round: boolean;
  delay: number;
  durationFactor: number;
  drift: number;
  rotate: number;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/**
 * Lightweight, dependency-free confetti burst that plays once on mount.
 * Non-interactive (pointer-events: none) and skipped when the user prefers reduced motion.
 */
export function BookingConfetti({ count = 80, duration = 3, enabled = true }: BookingConfettiProps) {
  const reducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [finished, setFinished] = useState(false);

  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: Math.max(0, Math.round(count)) }, () => {
        const size = 6 + Math.random() * 6;
        const round = Math.random() < 0.3;
        return {
          left: Math.random() * 100,
          width: size,
          height: round ? size : size * 0.45,
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          round,
          delay: Math.random() * 0.6,
          durationFactor: 0.7 + Math.random() * 0.6,
          drift: (Math.random() - 0.5) * 200,
          rotate: (Math.random() - 0.5) * 1440,
        };
      }),
    [count]
  );

  const active = enabled && !reducedMotion && pieces.length > 0;

  useEffect(() => {
    setFinished(false);
  }, [pieces, duration, enabled]);

  useEffect(() => {
    const container = containerRef.current;
    if (!active || !container || typeof container.animate !== "function") return;
    const nodes = Array.from(container.children) as HTMLElement[];
    const animations = nodes.map((node, i) => {
      const piece = pieces[i];
      return node.animate(
        [
          { transform: "translate3d(0, -10vh, 0) rotate(0deg)", opacity: 1 },
          { opacity: 1, offset: 0.75 },
          {
            transform: `translate3d(${piece.drift}px, 105vh, 0) rotate(${piece.rotate}deg)`,
            opacity: 0,
          },
        ],
        {
          duration: Math.max(0.3, duration) * piece.durationFactor * 1000,
          delay: piece.delay * 1000,
          easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          fill: "both",
        }
      );
    });
    let cancelled = false;
    Promise.all(animations.map((a) => a.finished))
      .then(() => {
        if (!cancelled) setFinished(true);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      animations.forEach((a) => a.cancel());
    };
  }, [active, pieces, duration]);

  if (!active || finished) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((piece, i) => (
        <span
          key={i}
          className="absolute top-0 block"
          style={{
            left: `${piece.left}%`,
            width: piece.width,
            height: piece.height,
            backgroundColor: piece.color,
            borderRadius: piece.round ? "9999px" : "2px",
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}
