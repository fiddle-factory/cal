"use client";

import * as React from "react";

const CONFETTI_COLORS = [
  "var(--cal-bg-visualization-1-emphasis)",
  "var(--cal-bg-visualization-2-emphasis)",
  "var(--cal-bg-visualization-3-emphasis)",
  "var(--cal-bg-visualization-4-emphasis)",
  "var(--cal-bg-visualization-5-emphasis)",
  "var(--cal-bg-visualization-6-emphasis)",
  "var(--cal-bg-visualization-7-emphasis)",
];

const CONFETTI_KEYFRAMES = `
@keyframes cal-booking-confetti-fall {
  0% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 1; }
  80% { opacity: 1; }
  100% { transform: translate3d(var(--confetti-drift), 110vh, 0) rotate(var(--confetti-spin)); opacity: 0; }
}
`;

type ConfettiPiece = {
  id: number;
  left: number;
  delay: number;
  durationFactor: number;
  drift: number;
  spin: number;
  widthFactor: number;
  heightFactor: number;
  round: boolean;
  color: string;
};

function createPieces(count: number, spread: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: 50 + (Math.random() - 0.5) * spread,
    delay: Math.random() * 0.8,
    durationFactor: 0.75 + Math.random() * 0.5,
    drift: (Math.random() - 0.5) * 240,
    spin: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 720),
    widthFactor: 0.6 + Math.random() * 0.6,
    heightFactor: 0.4 + Math.random() * 0.8,
    round: Math.random() > 0.7,
    color: CONFETTI_COLORS[id % CONFETTI_COLORS.length],
  }));
}

/**
 * One-shot celebratory confetti overlay. Plays once when mounted, never blocks
 * interaction and is hidden for users who prefer reduced motion.
 */
export function BookingConfetti() {
  const [confettiEnabled, setConfettiEnabled] = React.useState(true);
  const [pieceCount, setPieceCount] = React.useState(120);
  const [fallDuration, setFallDuration] = React.useState(3.2);
  const [pieceSize, setPieceSize] = React.useState(10);
  const [spread, setSpread] = React.useState(100);
  const [pieces, setPieces] = React.useState<ConfettiPiece[]>([]);

  // Generate on the client only (random values would mismatch during hydration).
  // Regenerating also replays the burst whenever the tuning values change.
  React.useEffect(() => {
    setPieces(createPieces(pieceCount, spread));
  }, [pieceCount, spread, fallDuration, pieceSize, confettiEnabled]);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="SourceRouteStory-main-0"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.confettiEnabled === "boolean") setConfettiEnabled(p.confettiEnabled);
      if (typeof p.pieceCount === "number") setPieceCount(p.pieceCount);
      if (typeof p.fallDuration === "number") setFallDuration(p.fallDuration);
      if (typeof p.pieceSize === "number") setPieceSize(p.pieceSize);
      if (typeof p.spread === "number") setSpread(p.spread);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  if (!confettiEnabled || pieces.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden motion-reduce:hidden">
      <style>{CONFETTI_KEYFRAMES}</style>
      {pieces.map((piece) => (
        <span
          key={`${piece.id}-${fallDuration}-${pieceSize}`}
          className="absolute block"
          style={
            {
              top: -2 * pieceSize,
              left: `${piece.left}%`,
              width: pieceSize * piece.widthFactor,
              height: piece.round ? pieceSize * piece.widthFactor : pieceSize * piece.heightFactor,
              borderRadius: piece.round ? "9999px" : "2px",
              backgroundColor: piece.color,
              "--confetti-drift": `${piece.drift}px`,
              "--confetti-spin": `${piece.spin}deg`,
              animation: `cal-booking-confetti-fall ${fallDuration * piece.durationFactor}s cubic-bezier(0.25, 0.6, 0.45, 1) ${piece.delay}s both`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
