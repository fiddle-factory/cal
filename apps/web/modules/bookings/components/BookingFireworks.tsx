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

type BookingFireworksProps = {
  children: React.ReactNode;
};

const GRAVITY = 0.035;
const FRICTION = 0.985;

/**
 * Celebratory fireworks rendered on a canvas behind its children.
 * The canvas never captures pointer events, so the wrapped content stays fully interactive.
 */
export function BookingFireworks({ children }: BookingFireworksProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const [enabled, setEnabled] = React.useState(true);
  const [primaryColor, setPrimaryColor] = React.useState("#3b82f6");
  const [secondaryColor, setSecondaryColor] = React.useState("#f59e0b");
  const [accentColor, setAccentColor] = React.useState("#ec4899");
  const [burstsPerSecond, setBurstsPerSecond] = React.useState(1.2);
  const [particleCount, setParticleCount] = React.useState(60);
  const [opacity, setOpacity] = React.useState(0.9);

  // Latest values are read inside the animation loop without restarting it.
  const settingsRef = React.useRef({ primaryColor, secondaryColor, accentColor, burstsPerSecond, particleCount });
  settingsRef.current = { primaryColor, secondaryColor, accentColor, burstsPerSecond, particleCount };

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="BookingFireworks-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.enabled === "boolean") setEnabled(p.enabled);
      if (typeof p.primaryColor === "string") setPrimaryColor(p.primaryColor);
      if (typeof p.secondaryColor === "string") setSecondaryColor(p.secondaryColor);
      if (typeof p.accentColor === "string") setAccentColor(p.accentColor);
      if (typeof p.burstsPerSecond === "number") setBurstsPerSecond(p.burstsPerSecond);
      if (typeof p.particleCount === "number") setParticleCount(p.particleCount);
      if (typeof p.opacity === "number") setOpacity(p.opacity);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  React.useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let width = 0;
    let height = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    const rockets: Rocket[] = [];
    const particles: Particle[] = [];
    let frame = 0;
    let last = performance.now();
    let spawnAccumulator = 0.8; // launch the first rocket almost immediately

    const pickColor = () => {
      const { primaryColor: a, secondaryColor: b, accentColor: c } = settingsRef.current;
      const colors = [a, b, c];
      return colors[Math.floor(Math.random() * colors.length)];
    };

    const launch = () => {
      // Favour the sides so bursts frame the card instead of hiding behind it.
      const side = Math.random() < 0.5 ? 0.05 + Math.random() * 0.3 : 0.65 + Math.random() * 0.3;
      rockets.push({
        x: width * side,
        y: height,
        vy: -(height * 0.012 + 4 + Math.random() * 2),
        targetY: height * (0.12 + Math.random() * 0.35),
        color: pickColor(),
      });
    };

    const explode = (rocket: Rocket) => {
      const count = Math.max(8, Math.round(settingsRef.current.particleCount));
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
        const speed = 1.5 + Math.random() * 3;
        const maxLife = 60 + Math.random() * 40;
        particles.push({
          x: rocket.x,
          y: rocket.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: maxLife,
          maxLife,
          color: Math.random() < 0.8 ? rocket.color : pickColor(),
          size: 1.5 + Math.random() * 1.5,
        });
      }
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      spawnAccumulator += dt * settingsRef.current.burstsPerSecond;
      while (spawnAccumulator >= 1) {
        spawnAccumulator -= 1;
        launch();
      }

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy;
        r.vy *= 0.99;
        ctx.globalAlpha = 1;
        ctx.fillStyle = r.color;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
        ctx.fill();
        if (r.y <= r.targetY || r.vy > -1) {
          explode(r);
          rockets.splice(i, 1);
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vx *= FRICTION;
        p.vy = p.vy * FRICTION + GRAVITY;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      ctx.clearRect(0, 0, width, height);
    };
  }, [enabled]);

  return (
    <div ref={containerRef} data-config-id="BookingFireworks-controls" className="relative min-h-screen">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{ opacity: enabled ? opacity : 0 }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default BookingFireworks;
