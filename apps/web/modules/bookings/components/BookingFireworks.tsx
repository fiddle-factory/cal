import type { RefObject } from "react";
import { useEffect, useRef } from "react";

/** Design-system visualization tokens used for the burst colors, with fallbacks matching tokens.css. */
const COLOR_TOKENS: Array<[string, string]> = [
  ["--cal-bg-visualization-1-emphasis", "hsla(330, 81%, 60%, 1)"],
  ["--cal-bg-visualization-2-emphasis", "hsla(271, 91%, 65%, 1)"],
  ["--cal-bg-visualization-3-emphasis", "hsla(217, 91%, 60%, 1)"],
  ["--cal-bg-visualization-4-emphasis", "hsla(142, 71%, 45%, 1)"],
  ["--cal-bg-visualization-5-emphasis", "hsla(45, 93%, 47%, 1)"],
  ["--cal-bg-visualization-6-emphasis", "hsla(25, 95%, 53%, 1)"],
  ["--cal-bg-visualization-7-emphasis", "hsla(0, 84%, 60%, 1)"],
];

export interface BookingFireworksProps {
  /** Element the bursts should frame (the confirmation card). */
  targetRef: RefObject<HTMLElement | null>;
  enabled?: boolean;
  burstCount?: number;
  particlesPerBurst?: number;
  durationSeconds?: number;
  gravity?: number;
  particleSize?: number;
  opacity?: number;
}

interface Rocket {
  x: number;
  y: number;
  tx: number;
  ty: number;
  sx: number;
  sy: number;
  progress: number;
  speed: number;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  color: string;
}

function readColors(el: HTMLElement): string[] {
  const styles = getComputedStyle(el);
  return COLOR_TOKENS.map(([token, fallback]) => styles.getPropertyValue(token).trim() || fallback);
}

export function BookingFireworks({
  targetRef,
  enabled = true,
  burstCount = 9,
  particlesPerBurst = 60,
  durationSeconds = 4,
  gravity = 0.05,
  particleSize = 2,
  opacity = 0.9,
}: BookingFireworksProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host || !enabled) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = readColors(host);
    const pick = () => colors[Math.floor(Math.random() * colors.length)];

    let width = 0;
    let height = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = host.clientWidth;
      height = host.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    observer?.observe(host);

    /** Picks a burst point around the card's edges, slightly outside it. */
    const targetPoint = () => {
      const hostRect = host.getBoundingClientRect();
      const card = targetRef.current?.getBoundingClientRect();
      const left = card ? card.left - hostRect.left : width * 0.3;
      const top = card ? card.top - hostRect.top : height * 0.2;
      const cw = card ? card.width : width * 0.4;
      const ch = card ? card.height : height * 0.5;
      const margin = 60;
      const side = Math.random();
      let x: number;
      let y: number;
      if (side < 0.35) {
        // left
        x = left - margin * (0.3 + Math.random());
        y = top + ch * Math.random() * 0.7;
      } else if (side < 0.7) {
        // right
        x = left + cw + margin * (0.3 + Math.random());
        y = top + ch * Math.random() * 0.7;
      } else {
        // above / top corners
        x = left + cw * Math.random();
        y = top - margin * (0.2 + Math.random() * 0.8);
      }
      return {
        x: Math.min(Math.max(x, 24), width - 24),
        y: Math.min(Math.max(y, 24), height - 24),
      };
    };

    const rockets: Rocket[] = [];
    const particles: Particle[] = [];
    const launchWindow = durationSeconds * 1000 * 0.75;
    const schedule = Array.from({ length: Math.max(0, Math.round(burstCount)) }, (_, i) =>
      i === 0 ? 0 : Math.random() * launchWindow
    ).sort((a, b) => a - b);

    const launch = () => {
      const t = targetPoint();
      const sx = t.x + (Math.random() - 0.5) * 80;
      rockets.push({
        x: sx,
        y: height,
        sx,
        sy: height,
        tx: t.x,
        ty: t.y,
        progress: 0,
        speed: 0.025 + Math.random() * 0.015,
        color: pick(),
      });
    };

    const explode = (r: Rocket) => {
      const count = Math.max(1, Math.round(particlesPerBurst));
      const power = 2.2 + Math.random() * 1.6;
      const secondary = Math.random() < 0.5 ? pick() : r.color;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
        const speed = power * (0.45 + Math.random() * 0.55);
        particles.push({
          x: r.tx,
          y: r.ty,
          px: r.tx,
          py: r.ty,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.012 + Math.random() * 0.012,
          color: i % 3 === 0 ? secondary : r.color,
        });
      }
    };

    let raf = 0;
    const start = performance.now();
    let next = 0;
    const frame = (now: number) => {
      const elapsed = now - start;
      while (next < schedule.length && schedule[next] <= elapsed) {
        launch();
        next++;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = "round";

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.progress = Math.min(1, r.progress + r.speed);
        const ease = 1 - Math.pow(1 - r.progress, 3);
        const prevX = r.x;
        const prevY = r.y;
        r.x = r.sx + (r.tx - r.sx) * ease;
        r.y = r.sy + (r.ty - r.sy) * ease;
        ctx.globalAlpha = opacity * 0.8;
        ctx.strokeStyle = r.color;
        ctx.lineWidth = particleSize;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY + (r.sy - r.ty) * 0.02);
        ctx.lineTo(r.x, r.y);
        ctx.stroke();
        if (r.progress >= 1) {
          explode(r);
          rockets.splice(i, 1);
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.px = p.x;
        p.py = p.y;
        p.vx *= 0.97;
        p.vy = p.vy * 0.97 + gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = opacity * p.life;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = particleSize * (0.5 + p.life * 0.5);
        ctx.beginPath();
        ctx.moveTo(p.px - p.vx * 2, p.py - p.vy * 2);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      if (next < schedule.length || rockets.length || particles.length) {
        raf = requestAnimationFrame(frame);
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
      ctx.clearRect(0, 0, width, height);
    };
  }, [targetRef, enabled, burstCount, particlesPerBurst, durationSeconds, gravity, particleSize, opacity]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-0" />;
}
