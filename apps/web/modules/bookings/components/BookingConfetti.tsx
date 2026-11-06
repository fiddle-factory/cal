"use client";

import * as React from "react";

type ConfettiPiece = {
  left: number;
  delay: number;
  drift: number;
  spin: number;
  width: number;
  height: number;
  colorIndex: number;
  round: boolean;
};

// Deterministic pseudo-random so the layout is stable between renders.
const seeded = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

const buildPieces = (count: number): ConfettiPiece[] =>
  Array.from({ length: count }, (_, i) => ({
    left: seeded(i + 1) * 100,
    delay: seeded(i + 101) * 1.2,
    drift: (seeded(i + 201) - 0.5) * 160,
    spin: 360 + seeded(i + 301) * 720,
    width: 6 + seeded(i + 401) * 6,
    height: 8 + seeded(i + 501) * 8,
    colorIndex: i % 3,
    round: seeded(i + 601) > 0.75,
  }));

const KEYFRAMES = `
@keyframes cal-booking-confetti-fall {
  0% { transform: translate3d(0, -10vh, 0) rotate(0deg); opacity: 0; }
  8% { opacity: 1; }
  80% { opacity: 1; }
  100% { transform: translate3d(var(--confetti-drift), 105vh, 0) rotate(var(--confetti-spin)); opacity: 0; }
}
`;

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
};

/**
 * Celebratory confetti overlay for the booking confirmation page.
 * Purely decorative: it never captures pointer events and is hidden from assistive tech.
 */
export function BookingConfetti() {
  const [colorA, setColorA] = React.useState("#3b82f6");
  const [colorB, setColorB] = React.useState("#22c55e");
  const [colorC, setColorC] = React.useState("#f59e0b");
  const [pieceCount, setPieceCount] = React.useState(80);
  const [fallDuration, setFallDuration] = React.useState(3.5);
  const [confettiOpacity, setConfettiOpacity] = React.useState(0.9);
  const [loop, setLoop] = React.useState(false);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="BookingConfetti-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.colorA === "string") setColorA(p.colorA);
      if (typeof p.colorB === "string") setColorB(p.colorB);
      if (typeof p.colorC === "string") setColorC(p.colorC);
      if (typeof p.pieceCount === "number") setPieceCount(p.pieceCount);
      if (typeof p.fallDuration === "number") setFallDuration(p.fallDuration);
      if (typeof p.confettiOpacity === "number") setConfettiOpacity(p.confettiOpacity);
      if (typeof p.loop === "boolean") setLoop(p.loop);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const pieces = React.useMemo(() => buildPieces(Math.max(0, Math.round(pieceCount))), [pieceCount]);
  const colors = [colorA, colorB, colorC];
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div
      aria-hidden="true"
      data-config-id="BookingConfetti-controls"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      style={{ opacity: confettiOpacity }}>
      <style>{KEYFRAMES}</style>
      {!prefersReducedMotion && pieces.map((piece, i) => (
        <span
          // Re-key on loop/duration changes so the animation restarts with new settings.
          key={`${i}-${loop ? "loop" : "once"}-${fallDuration}`}
          className="absolute top-0 block"
          style={
            {
              left: `${piece.left}%`,
              width: piece.width,
              height: piece.round ? piece.width : piece.height,
              backgroundColor: colors[piece.colorIndex],
              borderRadius: piece.round ? "9999px" : "2px",
              opacity: 0,
              "--confetti-drift": `${piece.drift}px`,
              "--confetti-spin": `${piece.spin}deg`,
              animationName: "cal-booking-confetti-fall",
              animationDuration: `${fallDuration}s`,
              animationDelay: `${piece.delay}s`,
              animationTimingFunction: "cubic-bezier(0.25, 0.6, 0.45, 1)",
              animationIterationCount: loop ? "infinite" : 1,
              animationFillMode: "forwards",
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

export default BookingConfetti;
