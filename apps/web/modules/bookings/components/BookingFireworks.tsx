"use client";

import * as React from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
};

type Rocket = {
  x: number;
  y: number;
  vy: number;
  targetY: number;
  color: string;
};

export type BookingFireworksProps = {
  className?: string;
};

/**
 * Decorative, non-interactive fireworks layer. Place it behind content
 * (absolute, inset-0) to celebrate a successful booking.
 */
export function BookingFireworks({ className }: BookingFireworksProps) {
  const [primaryColor, setPrimaryColor] = React.useState("#f59e0b");
  const [secondaryColor, setSecondaryColor] = React.useState("#ec4899");
  const [accentColor, setAccentColor] = React.useState("#3b82f6");
  const [burstsPerSecond, setBurstsPerSecond] = React.useState(1.2);
  const [particleCount, setParticleCount] = React.useState(60);
  const [burstSize, setBurstSize] = React.useState(1);
  const [loop, setLoop] = React.useState(true);

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const settingsRef = React.useRef({
    colors: [primaryColor, secondaryColor, accentColor],
    burstsPerSecond,
    particleCount,
    burstSize,
    loop,
  });
  settingsRef.current = {
    colors: [primaryColor, secondaryColor, accentColor],
    burstsPerSecond,
    particleCount,
    burstSize,
    loop,
  };

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="BookingFireworks-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.primaryColor === "string") setPrimaryColor(p.primaryColor);
      if (typeof p.secondaryColor === "string") setSecondaryColor(p.secondaryColor);
      if (typeof p.accentColor === "string") setAccentColor(p.accentColor);
      if (typeof p.burstsPerSecond === "number") setBurstsPerSecond(p.burstsPerSecond);
      if (typeof p.particleCount === "number") setParticleCount(p.particleCount);
      if (typeof p.burstSize === "number") setBurstSize(p.burstSize);
      if (typeof p.loop === "boolean") setLoop(p.loop);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const rockets: Rocket[] = [];
    const particles: Particle[] = [];
    const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

    const launch = () => {
      const { colors } = settingsRef.current;
      // Favour the sides so bursts frame the card rather than hide under it.
      const side = Math.random() < 0.5 ? 0 : 1;
      const x = side === 0 ? width * (0.05 + Math.random() * 0.3) : width * (0.65 + Math.random() * 0.3);
      rockets.push({
        x,
        y: height,
        vy: -(height * 0.012 + Math.random() * height * 0.004),
        targetY: height * (0.12 + Math.random() * 0.35),
        color: pick(colors),
      });
    };

    const explode = (rocket: Rocket) => {
      const { colors, particleCount: count, burstSize: size } = settingsRef.current;
      const n = Math.max(4, Math.round(count));
      for (let i = 0; i < n; i++) {
        const angle = (Math.PI * 2 * i) / n + Math.random() * 0.2;
        const speed = (1.5 + Math.random() * 2.5) * size;
        const maxLife = 50 + Math.random() * 30;
        particles.push({
          x: rocket.x,
          y: rocket.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: maxLife,
          maxLife,
          color: Math.random() < 0.7 ? rocket.color : pick(colors),
          size: 1.5 + Math.random() * 1.5,
        });
      }
    };

    // Opening salvo as the confirmation card appears.
    let launched = 0;
    const openingBursts = reduceMotion ? 1 : 3;
    for (let i = 0; i < openingBursts; i++) {
      launch();
      launched++;
    }

    let frame = 0;
    let last = performance.now();
    let sinceLaunch = 0;

    const tick = (now: number) => {
      const dt = Math.min(now - last, 50);
      last = now;
      const { burstsPerSecond: rate, loop: shouldLoop } = settingsRef.current;

      sinceLaunch += dt;
      const interval = 1000 / Math.max(rate, 0.05);
      const canLaunch = !reduceMotion && (shouldLoop || launched < 6);
      if (canLaunch && sinceLaunch >= interval) {
        sinceLaunch = 0;
        launch();
        launched++;
      }

      const step = dt / 16.67;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy * step;
        ctx.beginPath();
        ctx.fillStyle = r.color;
        ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
        ctx.fill();
        if (r.y <= r.targetY) {
          explode(r);
          rockets.splice(i, 1);
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vx *= 0.97;
        p.vy = p.vy * 0.97 + 0.05 * step;
        p.x += p.vx * step;
        p.y += p.vy * step;
        p.life -= step;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      data-config-id="BookingFireworks-controls"
      className={className ?? "pointer-events-none absolute inset-0 overflow-hidden"}>
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}

export default BookingFireworks;
