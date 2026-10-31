import React, { useEffect, useMemo, useRef, useState } from "react";

// Design system tokens used for confetti pieces
const CONFETTI_COLORS = [
  "var(--cal-bg-semantic-success-emphasis)",
  "var(--cal-bg-semantic-info-emphasis)",
  "var(--cal-bg-semantic-attention-emphasis)",
  "var(--cal-bg-semantic-error-emphasis)",
  "var(--cal-brand)",
  "var(--cal-bg-semantic-success-subtle)",
  "var(--cal-bg-semantic-info-subtle)",
];

const CONFIG_ID = "SourceRouteStory-main-0";

interface Piece {
  left: number;
  delay: number;
  drift: number;
  rotate: number;
  scale: number;
  color: string;
  round: boolean;
  durationJitter: number;
}

function createPieces(count: number): Piece[] {
  return Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    drift: Math.random() * 2 - 1,
    rotate: (Math.random() * 2 - 1) * 900,
    scale: 0.6 + Math.random() * 0.8,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    round: Math.random() < 0.3,
    durationJitter: 0.75 + Math.random() * 0.5,
  }));
}

export function ConfettiBurst() {
  const [pieceCount, setPieceCount] = useState(120);
  const [duration, setDuration] = useState(3.5);
  const [pieceSize, setPieceSize] = useState(10);
  const [drift, setDrift] = useState(120);
  const [loop, setLoop] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector(`[data-config-id="${CONFIG_ID}"]`);
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.pieceCount === "number") setPieceCount(p.pieceCount);
      if (typeof p.duration === "number") setDuration(p.duration);
      if (typeof p.pieceSize === "number") setPieceSize(p.pieceSize);
      if (typeof p.drift === "number") setDrift(p.drift);
      if (typeof p.loop === "boolean") setLoop(p.loop);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const pieces = useMemo(() => createPieces(Math.max(0, Math.round(pieceCount))), [pieceCount]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || reducedMotion) return;
    const nodes = Array.from(container.children) as HTMLElement[];
    const animations = nodes.map((node, i) => {
      const piece = pieces[i];
      if (!piece) return null;
      const x = piece.drift * drift;
      return node.animate(
        [
          { transform: "translate3d(0, 0, 0) rotate(0deg)", opacity: 1 },
          {
            transform: `translate3d(${x * 0.6}px, 55vh, 0) rotate(${piece.rotate * 0.5}deg)`,
            opacity: 1,
            offset: 0.55,
          },
          { transform: `translate3d(${x}px, 115vh, 0) rotate(${piece.rotate}deg)`, opacity: 0 },
        ],
        {
          duration: duration * piece.durationJitter * 1000,
          delay: piece.delay * 1000,
          easing: "cubic-bezier(0.25, 0.6, 0.45, 1)",
          iterations: loop ? Infinity : 1,
          fill: "both",
        }
      );
    });
    return () => animations.forEach((a) => a?.cancel());
  }, [pieces, duration, drift, loop, reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((piece, i) => (
        <span
          key={i}
          className="absolute block"
          style={{
            top: -24,
            left: `${piece.left}%`,
            width: pieceSize * piece.scale,
            height: piece.round ? pieceSize * piece.scale : pieceSize * piece.scale * 0.45,
            borderRadius: piece.round ? "9999px" : "1px",
            backgroundColor: piece.color,
          }}
        />
      ))}
    </div>
  );
}
