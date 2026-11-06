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
};

type Rocket = {
  x: number;
  y: number;
  vy: number;
  targetY: number;
  color: string;
};

const hexToRgb = (hex: string) => {
  const value = hex.replace("#", "");
  const n = Number.parseInt(value.length === 3 ? value.replace(/./g, "$&$&") : value, 16);
  if (Number.isNaN(n)) return "255, 255, 255";
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
};

/**
 * Decorative fireworks overlay used to celebrate a confirmed booking.
 * Renders on a pointer-events-none canvas so the page content stays fully interactive.
 */
export function BookingFireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [accentColor, setAccentColor] = useState("#f59e0b");
  const [burstsPerSecond, setBurstsPerSecond] = useState(1.2);
  const [particleCount, setParticleCount] = useState(60);
  const [fireworksOpacity, setFireworksOpacity] = useState(0.85);
  const [gravity, setGravity] = useState(0.05);
  const [showFireworks, setShowFireworks] = useState(true);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="BookingFireworks-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.primaryColor === "string") setPrimaryColor(p.primaryColor);
      if (typeof p.accentColor === "string") setAccentColor(p.accentColor);
      if (typeof p.burstsPerSecond === "number") setBurstsPerSecond(p.burstsPerSecond);
      if (typeof p.particleCount === "number") setParticleCount(p.particleCount);
      if (typeof p.fireworksOpacity === "number") setFireworksOpacity(p.fireworksOpacity);
      if (typeof p.gravity === "number") setGravity(p.gravity);
      if (typeof p.showFireworks === "boolean") setShowFireworks(p.showFireworks);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !showFireworks) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion =
      typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const palette = [primaryColor, accentColor, "#ffffff"].map(hexToRgb);
    const rockets: Rocket[] = [];
    const particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let lastTime = performance.now();
    let spawnAccumulator = 0.6; // fire the first rocket almost immediately

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const launch = () => {
      // Keep bursts toward the sides and top so the confirmation card stays readable.
      const side = Math.random() < 0.5;
      const x = side ? width * (0.05 + Math.random() * 0.22) : width * (0.73 + Math.random() * 0.22);
      rockets.push({
        x,
        y: height,
        vy: -(height * 0.012 + Math.random() * 3),
        targetY: height * (0.12 + Math.random() * 0.3),
        color: palette[Math.floor(Math.random() * palette.length)],
      });
    };

    const explode = (rocket: Rocket) => {
      const count = Math.max(4, Math.round(particleCount));
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
        const speed = 1.5 + Math.random() * 2.5;
        particles.push({
          x: rocket.x,
          y: rocket.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 55 + Math.random() * 30,
          color: Math.random() < 0.75 ? rocket.color : palette[Math.floor(Math.random() * palette.length)],
        });
      }
    };

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      spawnAccumulator += dt * burstsPerSecond;
      while (spawnAccumulator >= 1) {
        spawnAccumulator -= 1;
        launch();
      }

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy;
        r.vy *= 0.985;
        ctx.fillStyle = `rgba(${r.color}, 0.9)`;
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
        p.life += 1;
        p.vx *= 0.97;
        p.vy = p.vy * 0.97 + gravity;
        p.x += p.vx;
        p.y += p.vy;
        const alpha = 1 - p.life / p.maxLife;
        if (alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      ctx.clearRect(0, 0, width, height);
    };
  }, [primaryColor, accentColor, burstsPerSecond, particleCount, gravity, showFireworks]);

  return (
    <div
      aria-hidden="true"
      data-config-id="BookingFireworks-controls"
      className="pointer-events-none fixed inset-0 z-50"
      style={{ opacity: showFireworks ? fireworksOpacity : 0 }}>
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}

export default BookingFireworks;
