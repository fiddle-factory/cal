"use client";

import * as React from "react";

type ConfettiPiece = {
  id: number;
  left: number;
  delay: number;
  drift: number;
  spin: number;
  widthRatio: number;
  color: string;
  round: boolean;
};

// Deterministic pseudo-random so every render of a given count looks the same.
const seeded = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

export function BookingConfetti() {
  const [pieceCount, setPieceCount] = React.useState(120);
  const [fallDuration, setFallDuration] = React.useState(3.5);
  const [pieceSize, setPieceSize] = React.useState(10);
  const [primaryColor, setPrimaryColor] = React.useState("#292929");
  const [accentColor, setAccentColor] = React.useState("#10b981");
  const [highlightColor, setHighlightColor] = React.useState("#f59e0b");
  const [loop, setLoop] = React.useState(false);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="BookingConfetti-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.pieceCount === "number") setPieceCount(p.pieceCount);
      if (typeof p.fallDuration === "number") setFallDuration(p.fallDuration);
      if (typeof p.pieceSize === "number") setPieceSize(p.pieceSize);
      if (typeof p.primaryColor === "string") setPrimaryColor(p.primaryColor);
      if (typeof p.accentColor === "string") setAccentColor(p.accentColor);
      if (typeof p.highlightColor === "string") setHighlightColor(p.highlightColor);
      if (typeof p.loop === "boolean") setLoop(p.loop);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const pieces = React.useMemo<ConfettiPiece[]>(() => {
    const colors = [primaryColor, accentColor, highlightColor];
    return Array.from({ length: Math.max(0, Math.round(pieceCount)) }, (_, i) => ({
      id: i,
      left: seeded(i + 1) * 100,
      delay: seeded(i + 101) * 1.2,
      drift: (seeded(i + 201) - 0.5) * 240,
      spin: (seeded(i + 301) > 0.5 ? 1 : -1) * (360 + seeded(i + 401) * 720),
      widthRatio: 0.5 + seeded(i + 501) * 0.6,
      color: colors[i % colors.length],
      round: seeded(i + 601) > 0.75,
    }));
  }, [pieceCount, primaryColor, accentColor, highlightColor]);

  return (
    <div
      aria-hidden="true"
      data-config-id="BookingConfetti-controls"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <style>{`
        @keyframes booking-confetti-fall {
          0% { transform: translate3d(0, -10vh, 0) rotate(0deg); opacity: 0; }
          8% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translate3d(var(--confetti-drift), 110vh, 0) rotate(var(--confetti-spin)); opacity: 0; }
        }
      `}</style>
      {pieces.map((piece) => (
        <span
          key={`${piece.id}-${loop ? "loop" : "once"}`}
          className="absolute top-0 block motion-reduce:hidden"
          style={
            {
              left: `${piece.left}%`,
              width: pieceSize * piece.widthRatio,
              height: piece.round ? pieceSize * piece.widthRatio : pieceSize * 0.45,
              borderRadius: piece.round ? "9999px" : "2px",
              backgroundColor: piece.color,
              opacity: 0,
              "--confetti-drift": `${piece.drift}px`,
              "--confetti-spin": `${piece.spin}deg`,
              animation: `booking-confetti-fall ${fallDuration * (0.75 + seeded(piece.id + 701) * 0.5)}s cubic-bezier(0.25, 0.6, 0.45, 1) ${piece.delay}s ${loop ? "infinite" : "1"} both`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

export default BookingConfetti;
