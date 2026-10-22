import React from "react";

// Confetti colors come from the design system's visualization + brand tokens.
const CONFETTI_COLORS = [
  "var(--cal-bg-visualization-1-emphasis)",
  "var(--cal-bg-visualization-2-emphasis)",
  "var(--cal-bg-visualization-3-emphasis)",
  "var(--cal-bg-visualization-4-emphasis)",
  "var(--cal-bg-visualization-5-emphasis)",
  "var(--cal-bg-visualization-6-emphasis)",
  "var(--cal-bg-visualization-7-emphasis)",
];

const CONFETTI_KEYFRAMES = `
@keyframes cal-confetti-fall {
  0% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 1; }
  80% { opacity: 1; }
  100% { transform: translate3d(var(--confetti-drift), 110vh, 0) rotate(var(--confetti-spin)); opacity: 0; }
}
@keyframes cal-confetti-flutter {
  0%, 100% { transform: rotateX(0deg) scaleY(1); }
  50% { transform: rotateX(180deg) scaleY(0.4); }
}
@media (prefers-reduced-motion: reduce) {
  .cal-confetti { display: none; }
}
`;

// Deterministic pseudo-random so every piece keeps its path across re-renders.
function seeded(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export function BookingConfetti() {
  const [showConfetti, setShowConfetti] = React.useState(true);
  const [confettiCount, setConfettiCount] = React.useState(120);
  const [confettiDuration, setConfettiDuration] = React.useState(3.5);
  const [pieceSize, setPieceSize] = React.useState(10);
  const [confettiSpread, setConfettiSpread] = React.useState(160);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="SourceRouteStory-main-0"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.showConfetti === "boolean") setShowConfetti(p.showConfetti);
      if (typeof p.confettiCount === "number") setConfettiCount(p.confettiCount);
      if (typeof p.confettiDuration === "number") setConfettiDuration(p.confettiDuration);
      if (typeof p.pieceSize === "number") setPieceSize(p.pieceSize);
      if (typeof p.confettiSpread === "number") setConfettiSpread(p.confettiSpread);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const pieces = React.useMemo(
    () =>
      Array.from({ length: Math.max(0, Math.round(confettiCount)) }, (_, i) => {
        const r1 = seeded(i + 1);
        const r2 = seeded(i + 101);
        const r3 = seeded(i + 211);
        const r4 = seeded(i + 307);
        return {
          left: r1 * 100,
          delay: r2 * 0.8,
          durationFactor: 0.75 + r3 * 0.5,
          drift: (r4 - 0.5) * 2,
          spin: (r1 > 0.5 ? 1 : -1) * (360 + r2 * 720),
          color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          isRound: r3 > 0.75,
          aspect: 0.4 + r4 * 0.6,
        };
      }),
    [confettiCount]
  );

  if (!showConfetti) return null;

  // Re-keying replays the burst whenever a tunable changes.
  const burstKey = `${confettiCount}-${confettiDuration}-${pieceSize}-${confettiSpread}`;

  return (
    <div
      key={burstKey}
      className="cal-confetti pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden="true">
      <style>{CONFETTI_KEYFRAMES}</style>
      {pieces.map((piece, i) => (
        <span
          key={i}
          className="absolute block"
          style={
            {
              left: `${piece.left}%`,
              top: -2 * pieceSize,
              "--confetti-drift": `${piece.drift * confettiSpread}px`,
              "--confetti-spin": `${piece.spin}deg`,
              animation: `cal-confetti-fall ${confettiDuration * piece.durationFactor}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${piece.delay}s both`,
            } as React.CSSProperties
          }>
          <span
            className="block"
            style={{
              width: pieceSize,
              height: piece.isRound ? pieceSize : pieceSize * piece.aspect,
              borderRadius: piece.isRound ? "9999px" : 2,
              backgroundColor: piece.color,
              animation: `cal-confetti-flutter ${0.6 + piece.aspect}s ease-in-out ${piece.delay}s infinite`,
            }}
          />
        </span>
      ))}
    </div>
  );
}
