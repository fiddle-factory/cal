"use client";

import React, { useMemo, useState } from "react";

type ConfettiPiece = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  drift: number;
  spin: number;
  size: number;
  shape: "rect" | "circle";
  colorIndex: number;
};

// Deterministic pseudo-random generator so the layout is stable between renders.
const seeded = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

const buildPieces = (count: number): ConfettiPiece[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    left: seeded(i + 1) * 100,
    delay: seeded(i + 101) * 0.6,
    duration: 0.75 + seeded(i + 201) * 0.5,
    drift: (seeded(i + 301) - 0.5) * 240,
    spin: 360 + seeded(i + 401) * 720,
    size: 0.6 + seeded(i + 501) * 0.8,
    shape: seeded(i + 601) > 0.7 ? "circle" : "rect",
    colorIndex: i % 3,
  }));

const KEYFRAMES = `
@keyframes booking-confetti-fall {
  0% { transform: translate3d(0, -10vh, 0) rotate(0deg); opacity: 0; }
  8% { opacity: 1; }
  100% { transform: translate3d(var(--confetti-drift), 105vh, 0) rotate(var(--confetti-spin)); opacity: 0.9; }
}
@keyframes booking-confetti-burst {
  0% { transform: translate3d(0, 0, 0) scale(0.4); opacity: 0; }
  15% { opacity: 1; }
  100% { transform: translate3d(var(--confetti-burst-x), var(--confetti-burst-y), 0) rotate(var(--confetti-spin)) scale(1); opacity: 0; }
}
`;

/**
 * Celebratory confetti overlay for the booking confirmation page.
 * Pieces burst from the top-center and then rain down once when mounted.
 * Purely decorative: non-interactive and hidden for users who prefer reduced motion.
 */
export function BookingConfetti() {
  const [pieceCount, setPieceCount] = useState(90);
  const [durationSeconds, setDurationSeconds] = useState(3.2);
  const [pieceSize, setPieceSize] = useState(10);
  const [primaryColor, setPrimaryColor] = useState("#111827");
  const [secondaryColor, setSecondaryColor] = useState("#3b82f6");
  const [accentColor, setAccentColor] = useState("#f59e0b");
  const [loop, setLoop] = useState(false);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="BookingConfetti-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.pieceCount === "number") setPieceCount(p.pieceCount);
      if (typeof p.durationSeconds === "number") setDurationSeconds(p.durationSeconds);
      if (typeof p.pieceSize === "number") setPieceSize(p.pieceSize);
      if (typeof p.primaryColor === "string") setPrimaryColor(p.primaryColor);
      if (typeof p.secondaryColor === "string") setSecondaryColor(p.secondaryColor);
      if (typeof p.accentColor === "string") setAccentColor(p.accentColor);
      if (typeof p.loop === "boolean") setLoop(p.loop);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const pieces = useMemo(() => buildPieces(Math.max(0, Math.round(pieceCount))), [pieceCount]);
  const colors = [primaryColor, secondaryColor, accentColor];
  // Re-key so the animation replays whenever a setting changes.
  const replayKey = `${pieceCount}-${durationSeconds}-${pieceSize}-${loop}`;
  const iteration = loop ? "infinite" : "1";

  return (
    <div
      data-config-id="BookingConfetti-controls"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden motion-reduce:hidden">
      <style>{KEYFRAMES}</style>
      <div key={replayKey}>
        {/* Burst from the top-center */}
        {pieces.slice(0, Math.ceil(pieces.length / 3)).map((piece) => {
          const angle = (piece.left / 100) * Math.PI;
          const distance = 120 + piece.size * 160;
          const size = pieceSize * piece.size;
          return (
            <span
              key={`burst-${piece.id}`}
              className={piece.shape === "circle" ? "absolute rounded-full" : "absolute rounded-[2px]"}
              style={
                {
                  left: "50%",
                  top: "18%",
                  width: size,
                  height: piece.shape === "circle" ? size : size * 0.45,
                  backgroundColor: colors[piece.colorIndex],
                  opacity: 0,
                  "--confetti-burst-x": `${Math.cos(angle) * distance * 1.6}px`,
                  "--confetti-burst-y": `${-Math.sin(angle) * distance * 0.6 + 80}px`,
                  "--confetti-spin": `${piece.spin}deg`,
                  animation: `booking-confetti-burst ${durationSeconds * 0.45}s cubic-bezier(0.15, 0.7, 0.3, 1) ${
                    piece.delay * 0.3
                  }s ${iteration} both`,
                } as React.CSSProperties
              }
            />
          );
        })}
        {/* Falling rain */}
        {pieces.map((piece) => {
          const size = pieceSize * piece.size;
          return (
            <span
              key={`fall-${piece.id}`}
              className={piece.shape === "circle" ? "absolute top-0 rounded-full" : "absolute top-0 rounded-[2px]"}
              style={
                {
                  left: `${piece.left}%`,
                  width: size,
                  height: piece.shape === "circle" ? size : size * 0.45,
                  backgroundColor: colors[piece.colorIndex],
                  opacity: 0,
                  "--confetti-drift": `${piece.drift}px`,
                  "--confetti-spin": `${piece.spin}deg`,
                  animation: `booking-confetti-fall ${durationSeconds * piece.duration}s cubic-bezier(0.25, 0.4, 0.55, 1) ${
                    0.2 + piece.delay * durationSeconds * 0.4
                  }s ${iteration} both`,
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
