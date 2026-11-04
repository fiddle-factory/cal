"use client";

import React, { useEffect, useRef, useState } from "react";

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

const GRAVITY = 0.04;

/**
 * Decorative fireworks shown behind the booking confirmation card.
 * Purely visual: pointer-events are disabled and it is hidden from assistive tech.
 */
export function BookingConfirmationFireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [primaryColor, setPrimaryColor] = useState("#292929");
  const [accentColor, setAccentColor] = useState("#f59e0b");
  const [burstCount, setBurstCount] = useState(8);
  const [particlesPerBurst, setParticlesPerBurst] = useState(60);
  const [speed, setSpeed] = useState(1);
  const [opacity, setOpacity] = useState(0.9);
  const [loop, setLoop] = useState(false);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="BookingConfirmationFireworks-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.primaryColor === "string") setPrimaryColor(p.primaryColor);
      if (typeof p.accentColor === "string") setAccentColor(p.accentColor);
      if (typeof p.burstCount === "number") setBurstCount(p.burstCount);
      if (typeof p.particlesPerBurst === "number") setParticlesPerBurst(p.particlesPerBurst);
      if (typeof p.speed === "number") setSpeed(p.speed);
      if (typeof p.opacity === "number") setOpacity(p.opacity);
      if (typeof p.loop === "boolean") setLoop(p.loop);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const colors = [primaryColor, accentColor];
    const particles: Particle[] = [];
    const rockets: Rocket[] = [];
    let launched = 0;
    let frame = 0;
    let rafId = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const launchInterval = Math.max(6, Math.round(28 / speed));

    const launch = () => {
      rockets.push({
        x: width * (0.1 + Math.random() * 0.8),
        y: height,
        vy: -(7 + Math.random() * 3) * speed,
        targetY: height * (0.12 + Math.random() * 0.4),
        color: colors[launched % colors.length],
      });
      launched += 1;
    };

    const explode = (rocket: Rocket) => {
      for (let i = 0; i < particlesPerBurst; i++) {
        const angle = (Math.PI * 2 * i) / particlesPerBurst;
        const velocity = (1.5 + Math.random() * 2.5) * speed;
        particles.push({
          x: rocket.x,
          y: rocket.y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          life: 0,
          maxLife: (60 + Math.random() * 30) / speed,
          color: Math.random() > 0.3 ? rocket.color : colors[(launched + i) % colors.length],
          size: 1.5 + Math.random() * 1.5,
        });
      }
    };

    const tick = () => {
      frame += 1;
      ctx.clearRect(0, 0, width, height);

      const shouldLaunch = loop || launched < burstCount;
      if (shouldLaunch && frame % launchInterval === 0) launch();

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy;
        ctx.globalAlpha = 1;
        ctx.fillStyle = r.color;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
        ctx.fill();
        if (r.y <= r.targetY) {
          explode(r);
          rockets.splice(i, 1);
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += 1;
        p.vx *= 0.98;
        p.vy = p.vy * 0.98 + GRAVITY * speed;
        p.x += p.vx;
        p.y += p.vy;
        const alpha = 1 - p.life / p.maxLife;
        if (alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (shouldLaunch || rockets.length > 0 || particles.length > 0) {
        rafId = window.requestAnimationFrame(tick);
      }
    };
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [primaryColor, accentColor, burstCount, particlesPerBurst, speed, loop]);

  return (
    <div
      data-config-id="BookingConfirmationFireworks-controls"
      data-testid="booking-confirmation-fireworks"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity }}>
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}

export default BookingConfirmationFireworks;
