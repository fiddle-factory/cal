"use client";

import React, { useEffect, useMemo, useState } from "react";

type ConfettiPiece = {
  id: number;
  left: number;
  driftX: number;
  rotate: number;
  delay: number;
  durationJitter: number;
  colorIndex: number;
  shape: "rect" | "circle";
  widthRatio: number;
};

// Deterministic pseudo-random so the layout is stable across renders
function seeded(index: number, salt: number): number {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export type ConfettiBurstProps = {
  pieceCount?: number;
  duration?: number;
  spread?: number;
  pieceSize?: number;
  accentColor?: string;
  loop?: boolean;
};

const PALETTE = ["#16a34a", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6"];

export function ConfettiBurst(props: ConfettiBurstProps) {
  const [pieceCount, setPieceCount] = useState(props.pieceCount ?? 90);
  const [duration, setDuration] = useState(props.duration ?? 3.2);
  const [spread, setSpread] = useState(props.spread ?? 220);
  const [pieceSize, setPieceSize] = useState(props.pieceSize ?? 9);
  const [accentColor, setAccentColor] = useState(props.accentColor ?? "#16a34a");
  const [loop, setLoop] = useState(props.loop ?? false);
  const [runKey, setRunKey] = useState(0);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="ConfettiBurst-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.pieceCount === "number") setPieceCount(p.pieceCount);
      if (typeof p.duration === "number") setDuration(p.duration);
      if (typeof p.spread === "number") setSpread(p.spread);
      if (typeof p.pieceSize === "number") setPieceSize(p.pieceSize);
      if (typeof p.accentColor === "string") setAccentColor(p.accentColor);
      if (typeof p.loop === "boolean") setLoop(p.loop);
      setRunKey((k) => k + 1);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const pieces = useMemo<ConfettiPiece[]>(() => {
    const count = Math.max(0, Math.round(pieceCount));
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: 20 + seeded(i, 1) * 60,
      driftX: (seeded(i, 2) - 0.5) * 2,
      rotate: 360 + seeded(i, 3) * 720,
      delay: seeded(i, 4) * 0.6,
      durationJitter: 0.75 + seeded(i, 5) * 0.5,
      colorIndex: Math.floor(seeded(i, 6) * (PALETTE.length + 1)),
      shape: seeded(i, 7) > 0.7 ? "circle" : "rect",
      widthRatio: 0.6 + seeded(i, 8) * 0.6,
    }));
  }, [pieceCount]);

  const colors = [accentColor, ...PALETTE];

  return (
    <div
      data-config-id="ConfettiBurst-controls"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <style>{`
        @keyframes cal-confetti-fall {
          0% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 0; }
          8% { opacity: 1; }
          30% { transform: translate3d(calc(var(--drift) * 0.6), 18vh, 0) rotate(calc(var(--rot) * 0.35)); }
          85% { opacity: 1; }
          100% { transform: translate3d(var(--drift), 110vh, 0) rotate(var(--rot)); opacity: 0; }
        }
      `}</style>
      {!reducedMotion &&
        pieces.map((piece) => (
          <span
            key={`${runKey}-${piece.id}`}
            style={
              {
                position: "absolute",
                top: "-4vh",
                left: `${piece.left}%`,
                width: `${pieceSize * piece.widthRatio}px`,
                height: piece.shape === "circle" ? `${pieceSize * piece.widthRatio}px` : `${pieceSize * 1.6}px`,
                borderRadius: piece.shape === "circle" ? "9999px" : "2px",
                backgroundColor: colors[piece.colorIndex % colors.length],
                "--drift": `${piece.driftX * spread}px`,
                "--rot": `${piece.rotate}deg`,
                animationName: "cal-confetti-fall",
                animationDuration: `${duration * piece.durationJitter}s`,
                animationDelay: `${piece.delay}s`,
                animationTimingFunction: "cubic-bezier(0.25, 0.6, 0.45, 1)",
                animationFillMode: "both",
                animationIterationCount: loop ? "infinite" : 1,
                willChange: "transform, opacity",
              } as React.CSSProperties
            }
          />
        ))}
    </div>
  );
}

export default ConfettiBurst;
