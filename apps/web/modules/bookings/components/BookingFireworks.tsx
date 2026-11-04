"use client";

import * as React from "react";
import type { ReactNode } from "react";

type Particle = {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
};

type BookingFireworksProps = {
  children: ReactNode;
};

const GRAVITY = 0.04;
const DRAG = 0.985;

/**
 * Celebratory fireworks bursts rendered on a canvas behind the wrapped content.
 * The content stays fully interactive; the canvas ignores pointer events.
 */
export function BookingFireworks({ children }: BookingFireworksProps) {
  const [fireworksEnabled, setFireworksEnabled] = React.useState(true);
  const [primaryColor, setPrimaryColor] = React.useState("#3b82f6");
  const [secondaryColor, setSecondaryColor] = React.useState("#f59e0b");
  const [accentColor, setAccentColor] = React.useState("#10b981");
  const [burstInterval, setBurstInterval] = React.useState(700);
  const [particleCount, setParticleCount] = React.useState(48);
  const [particleSize, setParticleSize] = React.useState(2.5);

  const hostRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="BookingFireworks-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.fireworksEnabled === "boolean") setFireworksEnabled(p.fireworksEnabled);
      if (typeof p.primaryColor === "string") setPrimaryColor(p.primaryColor);
      if (typeof p.secondaryColor === "string") setSecondaryColor(p.secondaryColor);
      if (typeof p.accentColor === "string") setAccentColor(p.accentColor);
      if (typeof p.burstInterval === "number") setBurstInterval(p.burstInterval);
      if (typeof p.particleCount === "number") setParticleCount(p.particleCount);
      if (typeof p.particleSize === "number") setParticleSize(p.particleSize);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  React.useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas || !fireworksEnabled) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const colors = [primaryColor, secondaryColor, accentColor];
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let lastBurst = 0;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    const burst = () => {
      // Favor the sides and the top so bursts frame the confirmation card.
      const side = Math.random();
      const x =
        side < 0.4
          ? width * (0.05 + Math.random() * 0.25)
          : side < 0.8
          ? width * (0.7 + Math.random() * 0.25)
          : width * (0.3 + Math.random() * 0.4);
      const y = height * (0.08 + Math.random() * 0.45);
      const color = colors[Math.floor(Math.random() * colors.length)];
      const count = Math.max(1, Math.round(particleCount));
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
        const speed = 1.5 + Math.random() * 2.5;
        const maxLife = 55 + Math.random() * 35;
        particles.push({
          x,
          y,
          prevX: x,
          prevY: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: maxLife,
          maxLife,
          color: Math.random() < 0.2 ? colors[Math.floor(Math.random() * colors.length)] : color,
        });
      }
    };

    const tick = (time: number) => {
      if (time - lastBurst > burstInterval) {
        burst();
        lastBurst = time;
      }
      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = "round";
      particles = particles.filter((particle) => particle.life > 0);
      for (const particle of particles) {
        particle.prevX = particle.x;
        particle.prevY = particle.y;
        particle.vx *= DRAG;
        particle.vy = particle.vy * DRAG + GRAVITY;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 1;
        ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = particleSize;
        ctx.beginPath();
        ctx.moveTo(particle.prevX - particle.vx * 2, particle.prevY - particle.vy * 2);
        ctx.lineTo(particle.x, particle.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(tick);
    };
    burst();
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      ctx.clearRect(0, 0, width, height);
    };
  }, [fireworksEnabled, primaryColor, secondaryColor, accentColor, burstInterval, particleCount, particleSize]);

  return (
    <div ref={hostRef} data-config-id="BookingFireworks-controls" className="relative min-h-screen">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full"
        style={{ display: fireworksEnabled ? "block" : "none" }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default BookingFireworks;
