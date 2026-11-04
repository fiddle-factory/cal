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

const CONFIG_ID = "BookingFireworks-controls";
const ONE_SHOT_DURATION_MS = 4500;

export function BookingFireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [speed, setSpeed] = useState(1);
  const [intensity, setIntensity] = useState(1.5);
  const [particleCount, setParticleCount] = useState(70);
  const [primaryColor, setPrimaryColor] = useState("#f59e0b");
  const [secondaryColor, setSecondaryColor] = useState("#ec4899");
  const [accentColor, setAccentColor] = useState("#3b82f6");
  const [loop, setLoop] = useState(false);

  // Latest values read by the animation loop without restarting it.
  const settingsRef = useRef({ speed, intensity, particleCount, primaryColor, secondaryColor, accentColor, loop });
  settingsRef.current = { speed, intensity, particleCount, primaryColor, secondaryColor, accentColor, loop };

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="BookingFireworks-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.speed === "number") setSpeed(p.speed);
      if (typeof p.intensity === "number") setIntensity(p.intensity);
      if (typeof p.particleCount === "number") setParticleCount(p.particleCount);
      if (typeof p.primaryColor === "string") setPrimaryColor(p.primaryColor);
      if (typeof p.secondaryColor === "string") setSecondaryColor(p.secondaryColor);
      if (typeof p.accentColor === "string") setAccentColor(p.accentColor);
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
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

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
    window.addEventListener("resize", resize);

    const rockets: Rocket[] = [];
    const particles: Particle[] = [];
    const start = performance.now();
    let last = start;
    let spawnAccumulator = 1; // launch one rocket right away
    let frame = 0;

    const pickColor = () => {
      const { primaryColor: a, secondaryColor: b, accentColor: c } = settingsRef.current;
      const colors = [a, b, c];
      return colors[Math.floor(Math.random() * colors.length)];
    };

    const explode = (x: number, y: number, color: string) => {
      const count = Math.max(1, Math.round(settingsRef.current.particleCount));
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
        const velocity = 1.5 + Math.random() * 3;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          life: 0,
          maxLife: 55 + Math.random() * 35,
          color: Math.random() < 0.8 ? color : pickColor(),
          size: 1.5 + Math.random() * 1.5,
        });
      }
    };

    const tick = (now: number) => {
      const s = settingsRef.current;
      const dt = Math.min(now - last, 50);
      last = now;
      const step = (dt / 16.67) * s.speed;
      const spawning = s.loop || now - start < ONE_SHOT_DURATION_MS;

      if (spawning) {
        spawnAccumulator += (dt / 1000) * s.intensity * s.speed;
        while (spawnAccumulator >= 1) {
          spawnAccumulator -= 1;
          rockets.push({
            x: width * (0.1 + Math.random() * 0.8),
            y: height,
            vy: -(height / 70) * (0.8 + Math.random() * 0.4),
            targetY: height * (0.1 + Math.random() * 0.4),
            color: pickColor(),
          });
        }
      }

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy * step;
        ctx.fillStyle = r.color;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
        ctx.fill();
        if (r.y <= r.targetY) {
          explode(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vx *= Math.pow(0.97, step);
        p.vy = p.vy * Math.pow(0.97, step) + 0.05 * step;
        p.x += p.vx * step;
        p.y += p.vy * step;
        p.life += step;
        const remaining = 1 - p.life / p.maxLife;
        if (remaining <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = remaining;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      if (spawning || rockets.length || particles.length) {
        frame = requestAnimationFrame(tick);
      } else {
        frame = 0;
      }
    };

    frame = requestAnimationFrame(tick);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
    // Restart the show when looping is toggled so it can be replayed.
  }, [loop]);

  return (
    <div data-config-id={CONFIG_ID} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}

export default BookingFireworks;
