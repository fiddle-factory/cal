"use client";

import React, { useMemo, useState } from "react";

const CONFIG_ID = "BookingConfetti-controls";

type Particle = {
  id: number;
  left: number;
  delay: number;
  durationFactor: number;
  drift: number;
  rotation: number;
  sizeFactor: number;
  colorIndex: number;
  shape: "rect" | "circle" | "strip";
};

// Deterministic pseudo-random so the layout is stable between renders.
function seeded(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function buildParticles(amount: number): Particle[] {
  const shapes: Particle["shape"][] = ["rect", "circle", "strip"];
  return Array.from({ length: amount }, (_, i) => ({
    id: i,
    left: seeded(i + 1) * 100,
    delay: seeded(i + 101) * 0.6,
    durationFactor: 0.7 + seeded(i + 201) * 0.6,
    drift: (seeded(i + 301) - 0.5) * 240,
    rotation: 360 + seeded(i + 401) * 720,
    sizeFactor: 0.6 + seeded(i + 501) * 0.8,
    colorIndex: i % 3,
    shape: shapes[i % shapes.length],
  }));
}

export function BookingConfetti() {
  const [amount, setAmount] = useState(120);
  const [duration, setDuration] = useState(3.5);
  const [particleSize, setParticleSize] = useState(10);
  const [colorPrimary, setColorPrimary] = useState("#22c55e");
  const [colorSecondary, setColorSecondary] = useState("#3b82f6");
  const [colorAccent, setColorAccent] = useState("#f59e0b");
  const [loop, setLoop] = useState(false);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector(`[data-config-id="${CONFIG_ID}"]`);
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.amount === "number") setAmount(p.amount);
      if (typeof p.duration === "number") setDuration(p.duration);
      if (typeof p.particleSize === "number") setParticleSize(p.particleSize);
      if (typeof p.colorPrimary === "string") setColorPrimary(p.colorPrimary);
      if (typeof p.colorSecondary === "string") setColorSecondary(p.colorSecondary);
      if (typeof p.colorAccent === "string") setColorAccent(p.colorAccent);
      if (typeof p.loop === "boolean") setLoop(p.loop);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const count = Math.max(0, Math.round(amount));
  const particles = useMemo(() => buildParticles(count), [count]);
  const colors = [colorPrimary, colorSecondary, colorAccent];
  // Remount the particles when tuning so the burst replays with the new values.
  const replayKey = `${count}-${duration}-${particleSize}-${loop}`;

  return (
    <div
      data-config-id={CONFIG_ID}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      <style>{`
        @keyframes booking-confetti-fall {
          0% { transform: translate3d(0, -10vh, 0) rotate(0deg); opacity: 0; }
          8% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translate3d(var(--confetti-drift), 105vh, 0) rotate(var(--confetti-rotation)); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .booking-confetti-piece { animation: none !important; display: none; }
        }
      `}</style>
      <div key={replayKey}>
        {particles.map((particle) => {
          const size = particleSize * particle.sizeFactor;
          const width = particle.shape === "strip" ? size * 0.4 : size;
          const height = particle.shape === "strip" ? size * 1.6 : particle.shape === "rect" ? size * 0.6 : size;
          return (
            <span
              key={particle.id}
              className="booking-confetti-piece absolute top-0 block"
              style={
                {
                  left: `${particle.left}%`,
                  width,
                  height,
                  backgroundColor: colors[particle.colorIndex],
                  borderRadius: particle.shape === "circle" ? "9999px" : "2px",
                  opacity: 0,
                  animationName: "booking-confetti-fall",
                  animationDuration: `${duration * particle.durationFactor}s`,
                  animationDelay: `${particle.delay * duration * 0.4}s`,
                  animationTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  animationIterationCount: loop ? "infinite" : 1,
                  animationFillMode: "forwards",
                  "--confetti-drift": `${particle.drift}px`,
                  "--confetti-rotation": `${particle.rotation}deg`,
                } as React.CSSProperties
              }
            />
          );
        })}
      </div>
    </div>
  );
}

export default BookingConfetti;
