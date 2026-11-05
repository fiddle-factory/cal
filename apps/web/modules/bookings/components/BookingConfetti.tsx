"use client";

import React, { useMemo, useState } from "react";

const CONFETTI_KEYFRAMES = `
@keyframes cal-confetti-fall {
  0% { top: -8%; opacity: 0; transform: translateX(0) rotate(0deg) scale(0.6); }
  8% { opacity: 1; transform: translateX(calc(var(--confetti-drift) * 0.15)) rotate(calc(var(--confetti-rotate) * 0.1)) scale(1); }
  80% { opacity: 1; }
  100% { top: 105%; opacity: 0; transform: translateX(var(--confetti-drift)) rotate(var(--confetti-rotate)) scale(1); }
}
@keyframes cal-confetti-sway {
  0%, 100% { margin-left: 0; }
  50% { margin-left: var(--confetti-sway); }
}
@media (prefers-reduced-motion: reduce) {
  [data-booking-confetti-piece] { display: none; }
}
`;

// Deterministic pseudo-random so server and client render the same pieces.
const seeded = (index: number, salt: number) => {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export function BookingConfetti() {
  const [showConfetti, setShowConfetti] = useState(true);
  const [pieceCount, setPieceCount] = useState(60);
  const [duration, setDuration] = useState(3.2);
  const [pieceSize, setPieceSize] = useState(8);
  const [primaryColor, setPrimaryColor] = useState("#22c55e");
  const [secondaryColor, setSecondaryColor] = useState("#3b82f6");
  const [accentColor, setAccentColor] = useState("#f59e0b");

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="BookingConfetti-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.showConfetti === "boolean") setShowConfetti(p.showConfetti);
      if (typeof p.pieceCount === "number") setPieceCount(p.pieceCount);
      if (typeof p.duration === "number") setDuration(p.duration);
      if (typeof p.pieceSize === "number") setPieceSize(p.pieceSize);
      if (typeof p.primaryColor === "string") setPrimaryColor(p.primaryColor);
      if (typeof p.secondaryColor === "string") setSecondaryColor(p.secondaryColor);
      if (typeof p.accentColor === "string") setAccentColor(p.accentColor);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const pieces = useMemo(() => {
    const colors = [primaryColor, secondaryColor, accentColor];
    return Array.from({ length: Math.max(0, Math.round(pieceCount)) }, (_, i) => {
      const shape = Math.floor(seeded(i, 1) * 3);
      const size = pieceSize * (0.7 + seeded(i, 2) * 0.6);
      return {
        key: i,
        left: `${seeded(i, 3) * 100}%`,
        width: shape === 2 ? size * 0.5 : size,
        height: shape === 1 ? size : shape === 2 ? size * 1.6 : size * 0.6,
        borderRadius: shape === 1 ? "9999px" : "2px",
        color: colors[i % colors.length],
        delay: seeded(i, 4) * duration * 0.45,
        fallDuration: duration * (0.7 + seeded(i, 5) * 0.5),
        drift: `${(seeded(i, 6) - 0.5) * 120}px`,
        sway: `${(seeded(i, 7) - 0.5) * 30}px`,
        rotate: `${(seeded(i, 8) > 0.5 ? 1 : -1) * (360 + seeded(i, 9) * 540)}deg`,
      };
    });
  }, [pieceCount, duration, pieceSize, primaryColor, secondaryColor, accentColor]);

  // Remount pieces when a setting changes so the burst replays.
  const replayKey = `${pieceCount}-${duration}-${pieceSize}-${primaryColor}-${secondaryColor}-${accentColor}`;

  return (
    <div
      data-config-id="BookingConfetti-controls"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      <style>{CONFETTI_KEYFRAMES}</style>
      {showConfetti && (
        <div key={replayKey} className="absolute inset-0">
          {pieces.map((piece) => (
            <span
              key={piece.key}
              data-booking-confetti-piece=""
              className="absolute block"
              style={
                {
                  left: piece.left,
                  top: "-8%",
                  opacity: 0,
                  width: piece.width,
                  height: piece.height,
                  borderRadius: piece.borderRadius,
                  backgroundColor: piece.color,
                  "--confetti-drift": piece.drift,
                  "--confetti-sway": piece.sway,
                  "--confetti-rotate": piece.rotate,
                  animation: `cal-confetti-fall ${piece.fallDuration}s cubic-bezier(0.25, 0.6, 0.45, 1) ${piece.delay}s 1 forwards, cal-confetti-sway ${piece.fallDuration / 3}s ease-in-out ${piece.delay}s 3`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default BookingConfetti;
