import React, { useEffect, useRef, useState } from "react";

// Vivid accents from the design system's visualization palette (same in light and dark themes).
const CONFETTI_COLORS = [
  "var(--cal-bg-visualization-1-emphasis)",
  "var(--cal-bg-visualization-2-emphasis)",
  "var(--cal-bg-visualization-3-emphasis)",
  "var(--cal-bg-visualization-4-emphasis)",
  "var(--cal-bg-visualization-5-emphasis)",
  "var(--cal-bg-visualization-6-emphasis)",
  "var(--cal-bg-visualization-7-emphasis)",
];

/**
 * One-shot confetti burst that plays when mounted. Purely decorative: it never
 * intercepts pointer events, is hidden from assistive tech, fades out completely
 * and is skipped for users who prefer reduced motion.
 */
export function BookingConfetti() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [confettiEnabled, setConfettiEnabled] = useState(true);
  const [pieceCount, setPieceCount] = useState(120);
  const [durationMs, setDurationMs] = useState(3600);
  const [pieceSize, setPieceSize] = useState(10);
  const [spread, setSpread] = useState(160);
  const [pieceOpacity, setPieceOpacity] = useState(0.9);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="SourceRouteStory-main-0"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.confettiEnabled === "boolean") setConfettiEnabled(p.confettiEnabled);
      if (typeof p.pieceCount === "number") setPieceCount(p.pieceCount);
      if (typeof p.durationMs === "number") setDurationMs(p.durationMs);
      if (typeof p.pieceSize === "number") setPieceSize(p.pieceSize);
      if (typeof p.spread === "number") setSpread(p.spread);
      if (typeof p.pieceOpacity === "number") setPieceOpacity(p.pieceOpacity);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !confettiEnabled) return;
    if (typeof container.animate !== "function") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const { height } = container.getBoundingClientRect();
    const fragment = document.createDocumentFragment();
    const pieces: { el: HTMLSpanElement; keyframes: Keyframe[]; options: KeyframeAnimationOptions }[] = [];

    for (let i = 0; i < pieceCount; i++) {
      const el = document.createElement("span");
      const isDot = Math.random() < 0.3;
      const size = pieceSize * (0.6 + Math.random() * 0.8);
      Object.assign(el.style, {
        position: "absolute",
        top: "0",
        left: `${Math.random() * 100}%`,
        width: `${size}px`,
        height: `${isDot ? size : size * 0.45}px`,
        borderRadius: isDot ? "9999px" : "2px",
        backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        opacity: "0",
        willChange: "transform, opacity",
      });
      fragment.appendChild(el);

      const drift = (Math.random() - 0.5) * spread * 2;
      const rotation = (Math.random() - 0.5) * 1440;
      const tilt = Math.random() * 360;
      pieces.push({
        el,
        keyframes: [
          { transform: `translate3d(0, -24px, 0) rotate(${tilt}deg)`, opacity: pieceOpacity },
          {
            transform: `translate3d(${drift * 0.6}px, ${height * 0.6}px, 0) rotate(${tilt + rotation * 0.6}deg)`,
            opacity: pieceOpacity,
            offset: 0.6,
          },
          {
            transform: `translate3d(${drift}px, ${height + 24}px, 0) rotate(${tilt + rotation}deg)`,
            opacity: 0,
          },
        ],
        options: {
          duration: durationMs * (0.65 + Math.random() * 0.35),
          delay: Math.random() * durationMs * 0.3,
          easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          fill: "both",
        },
      });
    }

    container.appendChild(fragment);
    const animations = pieces.map(({ el, keyframes, options }) => el.animate(keyframes, options));

    return () => {
      animations.forEach((animation) => animation.cancel());
      container.replaceChildren();
    };
  }, [confettiEnabled, pieceCount, durationMs, pieceSize, spread, pieceOpacity]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    />
  );
}
