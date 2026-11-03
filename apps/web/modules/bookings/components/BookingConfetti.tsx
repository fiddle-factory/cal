import React, { useMemo, useState } from "react";

// Confetti colors come from the design system's visualization + brand tokens so they follow the theme.
const CONFETTI_COLORS = [
  "var(--cal-bg-visualization-1-emphasis)",
  "var(--cal-bg-visualization-2-emphasis)",
  "var(--cal-bg-visualization-3-emphasis)",
  "var(--cal-bg-visualization-4-emphasis)",
  "var(--cal-bg-visualization-5-emphasis)",
  "var(--cal-bg-visualization-6-emphasis)",
  "var(--cal-bg-visualization-7-emphasis)",
];

const CONFETTI_STYLES = `
@keyframes cal-confetti-burst {
  0% {
    transform: translate3d(0, 0, 0) rotate(0deg);
    opacity: 1;
  }
  18% {
    transform: translate3d(var(--confetti-x), var(--confetti-rise), 0) rotate(calc(var(--confetti-spin) * 0.25));
    opacity: 1;
  }
  85% {
    opacity: 1;
  }
  100% {
    transform: translate3d(calc(var(--confetti-x) * 1.35 + var(--confetti-sway)), 105vh, 0) rotate(var(--confetti-spin));
    opacity: 0;
  }
}
@keyframes cal-confetti-flutter {
  0%, 100% { transform: rotateX(0deg) scaleY(1); }
  50% { transform: rotateX(70deg) scaleY(0.4); }
}
@media (prefers-reduced-motion: reduce) {
  .cal-confetti { display: none; }
}
`;

// Deterministic PRNG so server and client render the same pieces.
function createRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

export function BookingConfetti() {
  const [confettiEnabled, setConfettiEnabled] = useState(true);
  const [particleCount, setParticleCount] = useState(90);
  const [durationSec, setDurationSec] = useState(3.5);
  const [spread, setSpread] = useState(420);
  const [particleSize, setParticleSize] = useState(9);
  const [loop, setLoop] = useState(false);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="BookingConfetti-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.confettiEnabled === "boolean") setConfettiEnabled(p.confettiEnabled);
      if (typeof p.particleCount === "number") setParticleCount(p.particleCount);
      if (typeof p.durationSec === "number") setDurationSec(p.durationSec);
      if (typeof p.spread === "number") setSpread(p.spread);
      if (typeof p.particleSize === "number") setParticleSize(p.particleSize);
      if (typeof p.loop === "boolean") setLoop(p.loop);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const pieces = useMemo(() => {
    const random = createRandom(42);
    return Array.from({ length: Math.round(particleCount) }, (_, index) => {
      const angle = random() * Math.PI - Math.PI / 2; // spread across the upper half
      const distance = (0.35 + random() * 0.65) * spread;
      const isCircle = random() > 0.7;
      const sizeFactor = 0.6 + random() * 0.8;
      return {
        id: index,
        color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
        x: Math.sin(angle) * distance,
        rise: -(80 + random() * 0.5 * spread),
        sway: (random() - 0.5) * 120,
        spin: (random() > 0.5 ? 1 : -1) * (360 + random() * 720),
        delay: random() * 0.35,
        durationFactor: 0.8 + random() * 0.4,
        flutter: 0.4 + random() * 0.6,
        width: particleSize * sizeFactor,
        height: isCircle ? particleSize * sizeFactor : particleSize * sizeFactor * 0.45,
        radius: isCircle ? "9999px" : "1px",
      };
    });
  }, [particleCount, spread, particleSize]);

  return (
    <div
      data-config-id="BookingConfetti-controls"
      aria-hidden="true"
      className="cal-confetti pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <style>{CONFETTI_STYLES}</style>
      {confettiEnabled && (
        <div
          key={`${durationSec}-${loop}-${particleCount}-${spread}-${particleSize}`}
          className="absolute"
          style={{ left: "50%", top: "18%" }}>
          {pieces.map((piece) => (
            <span
              key={piece.id}
              className="absolute left-0 top-0 block"
              style={
                {
                  "--confetti-x": `${piece.x}px`,
                  "--confetti-rise": `${piece.rise}px`,
                  "--confetti-sway": `${piece.sway}px`,
                  "--confetti-spin": `${piece.spin}deg`,
                  opacity: 0,
                  animationName: "cal-confetti-burst",
                  animationDuration: `${durationSec * piece.durationFactor}s`,
                  animationDelay: `${piece.delay}s`,
                  animationTimingFunction: "cubic-bezier(0.2, 0.6, 0.35, 1)",
                  animationIterationCount: loop ? "infinite" : 1,
                  animationFillMode: "both",
                } as React.CSSProperties
              }>
              <span
                className="block"
                style={{
                  width: piece.width,
                  height: piece.height,
                  borderRadius: piece.radius,
                  backgroundColor: piece.color,
                  animation: `cal-confetti-flutter ${piece.flutter}s ease-in-out infinite`,
                }}
              />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
