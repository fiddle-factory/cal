"use client";

import React from "react";

const CONFETTI_COLORS = ["#F59E0B", "#EF4444", "#3B82F6", "#10B981", "#A855F7", "#EC4899", "#FACC15"];

const RIBBON_GRADIENT = `linear-gradient(90deg, ${CONFETTI_COLORS.join(", ")})`;

const KEYFRAMES = `
@keyframes nyc-burst {
  0% { transform: translate(-50%, -50%) translate(0, 0) rotate(0deg) scale(0.3); opacity: 0; }
  10% { opacity: 1; }
  55% { transform: translate(-50%, -50%) translate(var(--nyc-x), var(--nyc-y)) rotate(calc(var(--nyc-r) * 0.6)) scale(1); opacity: 1; }
  100% { transform: translate(-50%, -50%) translate(calc(var(--nyc-x) * 1.15), calc(var(--nyc-y) + var(--nyc-fall))) rotate(var(--nyc-r)) scale(0.9); opacity: 0; }
}
@keyframes nyc-glow {
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(1.9); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .nyc-piece, .nyc-glow { animation: none !important; opacity: 0 !important; }
}
`;

/** Thin multicolor ribbon along the top edge of the confirmation card. */
export function NewYearRibbon() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-1"
      style={{ background: RIBBON_GRADIENT }}
    />
  );
}

/** Looping confetti burst rendered behind the success badge. Parent must be positioned. */
export function NewYearConfetti() {
  const [pieceCount, setPieceCount] = React.useState(28);
  const [burstDuration, setBurstDuration] = React.useState(2.8);
  const [spread, setSpread] = React.useState(90);
  const [pieceSize, setPieceSize] = React.useState(8);
  const [glowColor, setGlowColor] = React.useState("#F59E0B");
  const [showGlow, setShowGlow] = React.useState(true);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="NewYearConfetti-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.pieceCount === "number") setPieceCount(p.pieceCount);
      if (typeof p.burstDuration === "number") setBurstDuration(p.burstDuration);
      if (typeof p.spread === "number") setSpread(p.spread);
      if (typeof p.pieceSize === "number") setPieceSize(p.pieceSize);
      if (typeof p.glowColor === "string") setGlowColor(p.glowColor);
      if (typeof p.showGlow === "boolean") setShowGlow(p.showGlow);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const pieces = Array.from({ length: Math.max(0, Math.round(pieceCount)) }, (_, i) => {
    // Deterministic pseudo-random spread (golden angle) so SSR and client match.
    const angle = ((i * 137.508) % 360) * (Math.PI / 180);
    const distance = spread * (0.55 + ((i * 37) % 45) / 100);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance * 0.6;
    const fall = spread * (0.35 + ((i * 53) % 30) / 100);
    const rotation = (i % 2 === 0 ? 1 : -1) * (180 + ((i * 71) % 360));
    const delay = ((i % 9) / 9) * burstDuration;
    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    const shape = i % 3;
    return { i, x, y, fall, rotation, delay, color, shape };
  });

  return (
    <div
      aria-hidden="true"
      data-config-id="NewYearConfetti-controls"
      className="pointer-events-none absolute inset-0 z-0">
      <style>{KEYFRAMES}</style>
      {showGlow && (
        <span
          className="nyc-glow absolute inset-0 rounded-full"
          style={{
            backgroundColor: glowColor,
            animation: `nyc-glow ${burstDuration * 0.6}s ease-out infinite`,
          }}
        />
      )}
      <div className="absolute left-1/2 top-1/2 h-0 w-0">
        {pieces.map((p) => {
          const style = {
            "--nyc-x": `${p.x}px`,
            "--nyc-y": `${p.y}px`,
            "--nyc-fall": `${p.fall}px`,
            "--nyc-r": `${p.rotation}deg`,
            animation: `nyc-burst ${burstDuration}s cubic-bezier(0.2, 0.7, 0.3, 1) ${p.delay}s infinite both`,
          } as React.CSSProperties;
          if (p.shape === 2) {
            const starSize = pieceSize * 1.4;
            return (
              <svg
                key={p.i}
                className="nyc-piece absolute left-0 top-0"
                width={starSize}
                height={starSize}
                viewBox="0 0 24 24"
                style={style}>
                <path
                  fill={p.color}
                  d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7.1L12 17.3 5.8 21l1.6-7.1L2 9.2l7.1-.6z"
                />
              </svg>
            );
          }
          return (
            <span
              key={p.i}
              className="nyc-piece absolute left-0 top-0"
              style={{
                ...style,
                width: p.shape === 0 ? pieceSize : pieceSize * 0.7,
                height: p.shape === 0 ? pieceSize * 0.45 : pieceSize * 0.7,
                borderRadius: p.shape === 0 ? 1 : 9999,
                backgroundColor: p.color,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
