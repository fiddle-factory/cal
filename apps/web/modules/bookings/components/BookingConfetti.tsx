"use client";

import * as React from "react";

type ConfettiPiece = {
  id: number;
  left: number;
  delay: number;
  drift: number;
  spin: number;
  width: number;
  height: number;
  colorIndex: number;
  round: boolean;
};

const SECONDARY_COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#ec4899"];

// Deterministic pseudo-random sequence so server and client render the same pieces.
const seeded = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

const buildPieces = (count: number, size: number): ConfettiPiece[] =>
  Array.from({ length: count }, (_, i) => {
    const r = (n: number) => seeded(i * 7 + n);
    return {
      id: i,
      left: r(1) * 100,
      delay: r(2) * 0.6,
      drift: (r(3) - 0.5) * 160,
      spin: (r(4) > 0.5 ? 1 : -1) * (360 + r(5) * 720),
      width: size * (0.6 + r(6) * 0.6),
      height: size * (0.9 + r(7) * 0.9),
      colorIndex: Math.floor(r(8) * (SECONDARY_COLORS.length + 1)),
      round: r(9) > 0.75,
    };
  });

export function BookingConfetti() {
  const [pieceCount, setPieceCount] = React.useState(80);
  const [duration, setDuration] = React.useState(3.2);
  const [pieceSize, setPieceSize] = React.useState(8);
  const [accentColor, setAccentColor] = React.useState("#292929");
  const [loop, setLoop] = React.useState(false);
  const [runKey, setRunKey] = React.useState(0);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="BookingConfetti-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.pieceCount === "number") setPieceCount(p.pieceCount);
      if (typeof p.duration === "number") setDuration(p.duration);
      if (typeof p.pieceSize === "number") setPieceSize(p.pieceSize);
      if (typeof p.accentColor === "string") setAccentColor(p.accentColor);
      if (typeof p.loop === "boolean") setLoop(p.loop);
      setRunKey((k) => k + 1);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const pieces = React.useMemo(() => buildPieces(pieceCount, pieceSize), [pieceCount, pieceSize]);
  const colors = [accentColor, ...SECONDARY_COLORS];

  return (
    <div
      aria-hidden="true"
      data-config-id="BookingConfetti-controls"
      data-testid="booking-confetti"
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden motion-reduce:hidden">
      <style>{`
        @keyframes booking-confetti-fall {
          0% { top: -6%; opacity: 0; }
          8% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 104%; opacity: 0; }
        }
        @keyframes booking-confetti-sway {
          0% { transform: translate3d(0, 0, 0) rotate(0deg); }
          100% { transform: translate3d(var(--confetti-drift), 0, 0) rotate(var(--confetti-spin)); }
        }
      `}</style>
      {pieces.map((piece) => (
        <span
          key={`${runKey}-${piece.id}`}
          className="absolute block"
          style={{
            left: `${piece.left}%`,
            top: "-6%",
            opacity: 0,
            animation: `booking-confetti-fall ${duration}s cubic-bezier(0.25, 0.6, 0.45, 1) ${piece.delay}s ${
              loop ? "infinite" : "1"
            } forwards`,
          }}>
          <span
            className="block"
            style={
              {
                width: piece.width,
                height: piece.round ? piece.width : piece.height,
                borderRadius: piece.round ? "9999px" : "2px",
                backgroundColor: colors[piece.colorIndex % colors.length],
                "--confetti-drift": `${piece.drift}px`,
                "--confetti-spin": `${piece.spin}deg`,
                animation: `booking-confetti-sway ${duration}s ease-out ${piece.delay}s ${
                  loop ? "infinite" : "1"
                } both`,
              } as React.CSSProperties
            }
          />
        </span>
      ))}
    </div>
  );
}

export default BookingConfetti;
