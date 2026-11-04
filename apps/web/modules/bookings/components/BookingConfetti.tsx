"use client";

import * as React from "react";

type ConfettiPiece = {
  id: number;
  left: number;
  dx: number;
  rise: number;
  rotation: number;
  delay: number;
  durationJitter: number;
  colorIndex: number;
  shape: "rect" | "circle" | "strip";
};

// Deterministic pseudo-random so pieces are stable across renders.
const seeded = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

const buildPieces = (count: number): ConfettiPiece[] =>
  Array.from({ length: count }, (_, i) => {
    const shapeRoll = seeded(i + 7);
    return {
      id: i,
      left: 50 + (seeded(i + 1) - 0.5) * 20,
      dx: seeded(i + 2) - 0.5,
      rise: 15 + seeded(i + 3) * 25,
      rotation: (seeded(i + 4) - 0.5) * 1440,
      delay: seeded(i + 5) * 0.5,
      durationJitter: 0.75 + seeded(i + 6) * 0.5,
      colorIndex: i % 3,
      shape: shapeRoll < 0.5 ? "rect" : shapeRoll < 0.8 ? "strip" : "circle",
    };
  });

const KEYFRAMES = `
@keyframes cal-booking-confetti {
  0% { opacity: 0; transform: translate3d(0, 0, 0) rotate(0deg); }
  6% { opacity: 1; }
  25% { transform: translate3d(calc(var(--confetti-dx) * 0.55), calc(var(--confetti-rise) * -1), 0) rotate(calc(var(--confetti-rot) * 0.3)); }
  85% { opacity: 1; }
  100% { opacity: 0; transform: translate3d(var(--confetti-dx), 80vh, 0) rotate(var(--confetti-rot)); }
}
`;

export function BookingConfetti() {
  const [pieceCount, setPieceCount] = React.useState(90);
  const [fallDuration, setFallDuration] = React.useState(3.2);
  const [pieceSize, setPieceSize] = React.useState(9);
  const [burstSpread, setBurstSpread] = React.useState(90);
  const [primaryColor, setPrimaryColor] = React.useState("#292929");
  const [secondaryColor, setSecondaryColor] = React.useState("#3b82f6");
  const [tertiaryColor, setTertiaryColor] = React.useState("#f59e0b");

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="BookingConfetti-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.pieceCount === "number") setPieceCount(p.pieceCount);
      if (typeof p.fallDuration === "number") setFallDuration(p.fallDuration);
      if (typeof p.pieceSize === "number") setPieceSize(p.pieceSize);
      if (typeof p.burstSpread === "number") setBurstSpread(p.burstSpread);
      if (typeof p.primaryColor === "string") setPrimaryColor(p.primaryColor);
      if (typeof p.secondaryColor === "string") setSecondaryColor(p.secondaryColor);
      if (typeof p.tertiaryColor === "string") setTertiaryColor(p.tertiaryColor);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const pieces = React.useMemo(() => buildPieces(Math.max(0, Math.round(pieceCount))), [pieceCount]);
  const colors = [primaryColor, secondaryColor, tertiaryColor];
  // Replay the burst whenever a tuning value changes.
  const replayKey = `${pieceCount}-${fallDuration}-${pieceSize}-${burstSpread}`;

  return (
    <div
      aria-hidden="true"
      data-config-id="BookingConfetti-controls"
      data-testid="booking-confetti"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden motion-reduce:hidden">
      <style>{KEYFRAMES}</style>
      <div key={replayKey} className="absolute inset-0">
        {pieces.map((piece) => {
          const width = piece.shape === "strip" ? pieceSize * 0.45 : pieceSize;
          const height = piece.shape === "strip" ? pieceSize * 1.6 : piece.shape === "rect" ? pieceSize * 0.6 : pieceSize;
          return (
            <span
              key={piece.id}
              className="absolute block"
              style={
                {
                  left: `${piece.left}%`,
                  top: "28%",
                  width,
                  height,
                  backgroundColor: colors[piece.colorIndex],
                  borderRadius: piece.shape === "circle" ? "9999px" : "2px",
                  opacity: 0,
                  animation: `cal-booking-confetti ${fallDuration * piece.durationJitter}s cubic-bezier(0.2, 0.6, 0.4, 1) ${piece.delay}s both`,
                  "--confetti-dx": `${piece.dx * burstSpread}vw`,
                  "--confetti-rise": `${piece.rise}vh`,
                  "--confetti-rot": `${piece.rotation}deg`,
                } as React.CSSProperties
              }
            />
          );
        })}
      </div>
    </div>
  );
}

export default BookingConfetti;
