"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

// Deterministic pseudo-random so the burst looks the same on every render.
const seeded = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

const CONFETTI_KEYFRAMES = `
@keyframes booking-confetti-fall {
  0% { transform: translate3d(0, -12vh, 0) rotate(0deg); opacity: 1; }
  80% { opacity: 1; }
  100% { transform: translate3d(var(--confetti-drift), 105vh, 0) rotate(var(--confetti-spin)); opacity: 0; }
}
@keyframes booking-confetti-flutter {
  0%, 100% { transform: rotateY(0deg); }
  50% { transform: rotateY(180deg); }
}
@media (prefers-reduced-motion: reduce) {
  [data-booking-confetti] { display: none; }
}
`;

export function BookingConfetti() {
  const [pieceCount, setPieceCount] = useState(90);
  const [fallDuration, setFallDuration] = useState(3.2);
  const [pieceSize, setPieceSize] = useState(9);
  const [primaryColor, setPrimaryColor] = useState("#292929");
  const [accentColor, setAccentColor] = useState("#22c55e");
  const [highlightColor, setHighlightColor] = useState("#f59e0b");
  const [loop, setLoop] = useState(false);

  // geneditor-listener-start
  useEffect(() => {
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

  const colors = [primaryColor, accentColor, highlightColor, "#3b82f6", "#ec4899"];
  const count = Math.max(0, Math.round(pieceCount));
  // Remount pieces when tuning so the burst replays with the new values.
  const burstKey = `${count}-${fallDuration}-${pieceSize}-${loop}`;

  return (
    <div
      data-config-id="BookingConfetti-controls"
      data-booking-confetti
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      <style>{CONFETTI_KEYFRAMES}</style>
      <div key={burstKey} className="absolute inset-x-0 top-0 mx-auto h-full max-w-3xl">
        {Array.from({ length: count }, (_, i) => {
          const r1 = seeded(i + 1);
          const r2 = seeded(i + 101);
          const r3 = seeded(i + 211);
          const isStrip = r3 > 0.55;
          const size = pieceSize * (0.7 + r2 * 0.6);
          return (
            <span
              key={i}
              className="absolute top-0 block"
              style={
                {
                  left: `${r1 * 100}%`,
                  "--confetti-drift": `${(r2 - 0.5) * 220}px`,
                  "--confetti-spin": `${(r3 > 0.5 ? 1 : -1) * (360 + r1 * 540)}deg`,
                  animation: `booking-confetti-fall ${fallDuration * (0.75 + r2 * 0.5)}s cubic-bezier(0.25, 0.6, 0.45, 1) ${r3 * fallDuration * 0.45}s ${loop ? "infinite" : "1"} both`,
                } as CSSProperties
              }>
              <span
                className="block"
                style={{
                  width: isStrip ? size * 0.45 : size,
                  height: isStrip ? size * 1.6 : size,
                  borderRadius: r1 > 0.8 ? "9999px" : "2px",
                  backgroundColor: colors[i % colors.length],
                  animation: `booking-confetti-flutter ${0.6 + r1 * 0.8}s ease-in-out infinite`,
                }}
              />
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default BookingConfetti;
