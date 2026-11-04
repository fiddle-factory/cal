import React from "react";

const CONFIG_ID = "BookingConfetti-controls";

// Deterministic pseudo-random value in [0, 1) so server and client renders match.
function seeded(index: number, salt: number): number {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Decorative confetti layer. Renders behind its sibling content (which should sit at a higher
 * z-index) and never intercepts pointer events. Hidden for users who prefer reduced motion.
 */
export function BookingConfetti() {
  const [confettiCount, setConfettiCount] = React.useState(80);
  const [confettiDuration, setConfettiDuration] = React.useState(3.5);
  const [confettiSize, setConfettiSize] = React.useState(10);
  const [confettiLoop, setConfettiLoop] = React.useState(false);
  const [confettiColorA, setConfettiColorA] = React.useState("#3b82f6");
  const [confettiColorB, setConfettiColorB] = React.useState("#22c55e");
  const [confettiColorC, setConfettiColorC] = React.useState("#f59e0b");

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector(`[data-config-id="${CONFIG_ID}"]`);
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.confettiCount === "number") setConfettiCount(p.confettiCount);
      if (typeof p.confettiDuration === "number") setConfettiDuration(p.confettiDuration);
      if (typeof p.confettiSize === "number") setConfettiSize(p.confettiSize);
      if (typeof p.confettiLoop === "boolean") setConfettiLoop(p.confettiLoop);
      if (typeof p.confettiColorA === "string") setConfettiColorA(p.confettiColorA);
      if (typeof p.confettiColorB === "string") setConfettiColorB(p.confettiColorB);
      if (typeof p.confettiColorC === "string") setConfettiColorC(p.confettiColorC);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const colors = [confettiColorA, confettiColorB, confettiColorC];
  const count = Math.max(0, Math.round(confettiCount));

  const pieces = Array.from({ length: count }, (_, i) => {
    const left = seeded(i, 1) * 100;
    const delay = seeded(i, 2) * confettiDuration * 0.5;
    const pieceDuration = confettiDuration * (0.75 + seeded(i, 3) * 0.5);
    const drift = (seeded(i, 4) - 0.5) * 240;
    const rotate = (seeded(i, 5) > 0.5 ? 1 : -1) * (360 + seeded(i, 6) * 720);
    const scale = 0.6 + seeded(i, 7) * 0.8;
    const shape = i % 3;
    const width = confettiSize * scale;
    const height = shape === 0 ? width * 0.4 : width;
    return (
      <span
        key={i}
        className="cal-confetti-piece absolute top-0 block"
        style={
          {
            left: `${left}%`,
            width: `${width}px`,
            height: `${height}px`,
            backgroundColor: colors[i % colors.length],
            borderRadius: shape === 2 ? "9999px" : "2px",
            animationDuration: `${pieceDuration}s`,
            animationDelay: `${delay}s`,
            animationIterationCount: confettiLoop ? "infinite" : 1,
            "--confetti-drift": `${drift}px`,
            "--confetti-rotate": `${rotate}deg`,
          } as React.CSSProperties
        }
      />
    );
  });

  return (
    <div
      data-config-id={CONFIG_ID}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <style>{`
        @keyframes cal-confetti-fall {
          0% { transform: translate3d(0, -5vh, 0) rotate(0deg); opacity: 0; }
          8% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translate3d(var(--confetti-drift), 105vh, 0) rotate(var(--confetti-rotate)); opacity: 0; }
        }
        .cal-confetti-piece {
          opacity: 0;
          animation-name: cal-confetti-fall;
          animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          animation-fill-mode: both;
          will-change: transform, opacity;
        }
        @media (prefers-reduced-motion: reduce) {
          .cal-confetti-piece { display: none; }
        }
      `}</style>
      <div key={`${count}-${confettiDuration}-${confettiLoop}`} className="absolute inset-0">
        {pieces}
      </div>
    </div>
  );
}
