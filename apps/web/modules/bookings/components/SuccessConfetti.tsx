import React, { useMemo, useState } from "react";

const CONFIG_ID = "SuccessConfetti-controls";

// Deterministic pseudo-random so renders are stable across re-renders.
const seeded = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

/**
 * Decorative confetti burst rendered around the booking success checkmark.
 * Pure CSS: pieces burst outward from the circle centre, then drift down and fade.
 */
export function SuccessConfetti() {
  const [confettiCount, setConfettiCount] = useState(36);
  const [confettiSpread, setConfettiSpread] = useState(90);
  const [confettiDuration, setConfettiDuration] = useState(1.8);
  const [confettiSize, setConfettiSize] = useState(7);
  const [confettiColor1, setConfettiColor1] = useState("#22c55e");
  const [confettiColor2, setConfettiColor2] = useState("#3b82f6");
  const [confettiColor3, setConfettiColor3] = useState("#f59e0b");

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector(`[data-config-id="${CONFIG_ID}"]`);
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.confettiCount === "number") setConfettiCount(p.confettiCount);
      if (typeof p.confettiSpread === "number") setConfettiSpread(p.confettiSpread);
      if (typeof p.confettiDuration === "number") setConfettiDuration(p.confettiDuration);
      if (typeof p.confettiSize === "number") setConfettiSize(p.confettiSize);
      if (typeof p.confettiColor1 === "string") setConfettiColor1(p.confettiColor1);
      if (typeof p.confettiColor2 === "string") setConfettiColor2(p.confettiColor2);
      if (typeof p.confettiColor3 === "string") setConfettiColor3(p.confettiColor3);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const pieces = useMemo(() => {
    const colors = [confettiColor1, confettiColor2, confettiColor3];
    const count = Math.max(0, Math.round(confettiCount));
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / Math.max(count, 1)) * Math.PI * 2 + seeded(i + 1) * 0.6;
      const distance = confettiSpread * (0.55 + seeded(i + 11) * 0.45);
      const dx = Math.cos(angle) * distance;
      // Bias the burst upward a little so pieces arc before falling.
      const dy = Math.sin(angle) * distance * 0.75 - confettiSpread * 0.2;
      const fall = confettiSpread * (0.5 + seeded(i + 23) * 0.6);
      const rot = Math.round((seeded(i + 37) - 0.5) * 1080);
      const delay = seeded(i + 51) * confettiDuration * 0.15;
      const shape = i % 3;
      return {
        key: i,
        color: colors[i % colors.length],
        width: shape === 2 ? confettiSize * 0.45 : confettiSize,
        height: shape === 0 ? confettiSize * 0.6 : confettiSize,
        radius: shape === 1 ? "9999px" : "1px",
        dx,
        dy,
        fall,
        rot,
        delay,
      };
    });
  }, [
    confettiCount,
    confettiSpread,
    confettiDuration,
    confettiSize,
    confettiColor1,
    confettiColor2,
    confettiColor3,
  ]);

  // Re-key so the burst replays whenever a parameter changes.
  const runKey = `${confettiCount}-${confettiSpread}-${confettiDuration}-${confettiSize}-${confettiColor1}-${confettiColor2}-${confettiColor3}`;

  return (
    <span
      data-config-id={CONFIG_ID}
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0 motion-reduce:hidden">
      <style>{`
        @keyframes cal-success-confetti {
          0% { transform: translate(-50%, -50%) scale(0.2) rotate(0deg); opacity: 0; }
          8% { opacity: 1; }
          35% { transform: translate(calc(-50% + var(--cf-dx)), calc(-50% + var(--cf-dy))) scale(1) rotate(calc(var(--cf-rot) * 0.4)); opacity: 1; }
          100% { transform: translate(calc(-50% + var(--cf-dx) * 1.15), calc(-50% + var(--cf-dy) + var(--cf-fall))) scale(0.9) rotate(var(--cf-rot)); opacity: 0; }
        }
      `}</style>
      <span key={runKey} className="absolute left-0 top-0">
        {pieces.map((p) => (
          <span
            key={p.key}
            className="absolute left-0 top-0"
            style={
              {
                width: `${p.width}px`,
                height: `${p.height}px`,
                backgroundColor: p.color,
                borderRadius: p.radius,
                opacity: 0,
                "--cf-dx": `${p.dx.toFixed(1)}px`,
                "--cf-dy": `${p.dy.toFixed(1)}px`,
                "--cf-fall": `${p.fall.toFixed(1)}px`,
                "--cf-rot": `${p.rot}deg`,
                animation: `cal-success-confetti ${confettiDuration}s cubic-bezier(0.22, 0.8, 0.36, 1) ${p.delay.toFixed(
                  2
                )}s both`,
              } as React.CSSProperties
            }
          />
        ))}
      </span>
    </span>
  );
}

export default SuccessConfetti;
