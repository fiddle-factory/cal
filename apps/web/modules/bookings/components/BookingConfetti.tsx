import React, { useEffect, useMemo, useRef, useState } from "react";

// Confetti palette taken from the design system's visualization tokens.
const CONFETTI_COLORS = [
  "var(--cal-bg-visualization-1-emphasis)",
  "var(--cal-bg-visualization-2-emphasis)",
  "var(--cal-bg-visualization-3-emphasis)",
  "var(--cal-bg-visualization-4-emphasis)",
  "var(--cal-bg-visualization-5-emphasis)",
  "var(--cal-bg-visualization-6-emphasis)",
];

// Small deterministic PRNG so pieces are stable between renders.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      setReduced(false);
      return;
    }
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function BookingConfetti({ configId = "SourceRouteStory-main-0" }: { configId?: string }) {
  const [confettiEnabled, setConfettiEnabled] = useState(true);
  const [pieceCount, setPieceCount] = useState(80);
  const [durationMs, setDurationMs] = useState(3200);
  const [pieceSize, setPieceSize] = useState(10);
  const [spread, setSpread] = useState(120);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector(`[data-config-id="${configId}"]`);
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.confettiEnabled === "boolean") setConfettiEnabled(p.confettiEnabled);
      if (typeof p.pieceCount === "number") setPieceCount(p.pieceCount);
      if (typeof p.durationMs === "number") setDurationMs(p.durationMs);
      if (typeof p.pieceSize === "number") setPieceSize(p.pieceSize);
      if (typeof p.spread === "number") setSpread(p.spread);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, [configId]);
  // geneditor-listener-end

  const prefersReducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const pieces = useMemo(() => {
    const rand = mulberry32(20240611);
    return Array.from({ length: Math.max(0, Math.round(pieceCount)) }, (_, i) => ({
      left: rand() * 100,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      drift: (rand() - 0.5) * 2,
      rotate: 360 + rand() * 720,
      delay: rand() * 0.35,
      speed: 0.75 + rand() * 0.5,
      aspect: rand() > 0.5 ? 0.45 : 1,
      round: rand() > 0.7,
    }));
  }, [pieceCount]);

  const active = confettiEnabled && !prefersReducedMotion;

  useEffect(() => {
    const container = containerRef.current;
    if (!active || !container) return;
    const height = container.clientHeight || window.innerHeight;
    const nodes = Array.from(container.children) as HTMLElement[];
    const animations = nodes.map((node, i) => {
      const piece = pieces[i];
      const duration = durationMs * piece.speed;
      return node.animate(
        [
          { transform: "translate3d(0, -5vh, 0) rotate(0deg)", opacity: 1 },
          {
            transform: `translate3d(${piece.drift * spread * 0.6}px, ${height * 0.6}px, 0) rotate(${piece.rotate * 0.6}deg)`,
            opacity: 1,
            offset: 0.7,
          },
          {
            transform: `translate3d(${piece.drift * spread}px, ${height + 40}px, 0) rotate(${piece.rotate}deg)`,
            opacity: 0,
          },
        ],
        {
          duration,
          delay: piece.delay * durationMs,
          easing: "cubic-bezier(0.25, 0.6, 0.45, 1)",
          fill: "both",
        }
      );
    });
    return () => animations.forEach((a) => a.cancel());
  }, [active, pieces, durationMs, spread]);

  if (!active) return null;

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
            width: pieceSize,
            height: pieceSize * piece.aspect,
            backgroundColor: piece.color,
            borderRadius: piece.round ? "9999px" : "2px",
            transform: "translate3d(0, -5vh, 0)",
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}
