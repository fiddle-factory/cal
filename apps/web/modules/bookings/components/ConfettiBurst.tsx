"use client";

import { useEffect, useRef } from "react";

// Design-system tokens (visualization emphasis palette + brand). Fallbacks mirror tokens.css.
const CONFETTI_TOKENS: ReadonlyArray<[string, string]> = [
  ["--cal-bg-visualization-1-emphasis", "hsla(330, 81%, 60%, 1)"],
  ["--cal-bg-visualization-2-emphasis", "hsla(256, 85%, 57%, 1)"],
  ["--cal-bg-visualization-3-emphasis", "hsla(235, 100%, 63%, 1)"],
  ["--cal-bg-visualization-4-emphasis", "hsla(158, 74%, 38%, 1)"],
  ["--cal-bg-visualization-5-emphasis", "hsla(45, 93%, 47%, 1)"],
  ["--cal-bg-visualization-6-emphasis", "hsla(25, 95%, 53%, 1)"],
  ["--cal-bg-visualization-7-emphasis", "hsla(0, 84%, 60%, 1)"],
];

function resolveTokenColors(): string[] {
  const styles = getComputedStyle(document.documentElement);
  return CONFETTI_TOKENS.map(([token, fallback]) => styles.getPropertyValue(token).trim() || fallback);
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  spin: number;
  tilt: number;
  tiltSpeed: number;
  color: string;
  shape: "rect" | "circle";
}

export interface ConfettiBurstProps {
  /** Number of confetti pieces. */
  particleCount?: number;
  /** Total effect duration in milliseconds. */
  durationMs?: number;
  /** Launch speed multiplier. */
  spread?: number;
  /** Change to replay the effect. */
  replayKey?: string | number;
}

export function ConfettiBurst({
  particleCount = 120,
  durationMs = 3200,
  spread = 1,
  replayKey,
}: ConfettiBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = resolveTokenColors();
    const dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const count = Math.max(0, Math.round(particleCount));
    const particles: Particle[] = Array.from({ length: count }, (_, i) => {
      // Two cannons from the lower-left and lower-right corners aiming inward and up.
      const fromLeft = i % 2 === 0;
      const angle = (fromLeft ? -60 : -120) * (Math.PI / 180) + (Math.random() - 0.5) * 0.7;
      const speed = (9 + Math.random() * 8) * spread * Math.min(1.4, Math.max(0.7, height / 800));
      return {
        x: fromLeft ? width * 0.05 : width * 0.95,
        y: height * 0.95,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 6 + Math.random() * 6,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.3,
        tilt: Math.random() * Math.PI * 2,
        tiltSpeed: 0.05 + Math.random() * 0.1,
        color: colors[i % colors.length],
        shape: Math.random() < 0.7 ? "rect" : "circle",
      };
    });

    const gravity = 0.28;
    const drag = 0.985;
    const start = performance.now();
    let last = start;
    let frame = 0;

    const draw = (now: number) => {
      const elapsed = now - start;
      const step = Math.min(2, (now - last) / 16.67);
      last = now;
      ctx.clearRect(0, 0, width, height);

      const fadeStart = durationMs * 0.7;
      const alpha = elapsed < fadeStart ? 1 : Math.max(0, 1 - (elapsed - fadeStart) / (durationMs - fadeStart));
      ctx.globalAlpha = alpha;

      for (const p of particles) {
        p.vx *= Math.pow(drag, step);
        p.vy = p.vy * Math.pow(drag, step) + gravity * step;
        p.x += (p.vx + Math.sin(p.tilt) * 0.6) * step;
        p.y += p.vy * step;
        p.rotation += p.spin * step;
        p.tilt += p.tiltSpeed * step;
        if (p.y > height + 20) continue;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        if (p.shape === "rect") {
          ctx.scale(1, Math.cos(p.tilt));
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (elapsed < durationMs) {
        frame = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, width, height);
    };
  }, [particleCount, durationMs, spread, replayKey]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 h-full w-full motion-reduce:hidden"
    />
  );
}
