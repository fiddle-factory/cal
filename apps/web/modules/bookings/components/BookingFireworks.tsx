import type { RefObject } from "react";
import { useEffect, useRef } from "react";

// Design-system visualization tokens (packages/config/theme/tokens.css), with fallbacks.
const COLOR_TOKENS: ReadonlyArray<[string, string]> = [
  ["--cal-bg-visualization-1-emphasis", "hsla(330, 81%, 60%, 1)"],
  ["--cal-bg-visualization-2-emphasis", "hsla(256, 85%, 57%, 1)"],
  ["--cal-bg-visualization-3-emphasis", "hsla(235, 100%, 63%, 1)"],
  ["--cal-bg-visualization-4-emphasis", "hsla(158, 74%, 38%, 1)"],
  ["--cal-bg-visualization-5-emphasis", "hsla(45, 93%, 47%, 1)"],
  ["--cal-bg-visualization-6-emphasis", "hsla(25, 95%, 53%, 1)"],
  ["--cal-bg-visualization-7-emphasis", "hsla(0, 84%, 60%, 1)"],
];

interface Particle {
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface Rocket {
  startAt: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
  exploded: boolean;
}

const ROCKET_FLIGHT_MS = 380;

function readColors(): string[] {
  if (typeof window === "undefined") return COLOR_TOKENS.map(([, fallback]) => fallback);
  const styles = getComputedStyle(document.documentElement);
  return COLOR_TOKENS.map(([token, fallback]) => styles.getPropertyValue(token).trim() || fallback);
}

export interface BookingFireworksProps {
  targetRef: RefObject<HTMLElement>;
  enabled?: boolean;
  /** Number of bursts in the show */
  burstCount?: number;
  /** Sparks per burst */
  particleCount?: number;
  /** Total length of the show in seconds */
  duration?: number;
  /** Spark velocity multiplier */
  speed?: number;
  /** Downward pull on sparks */
  gravity?: number;
}

export function BookingFireworks({
  targetRef,
  enabled = true,
  burstCount = 9,
  particleCount = 48,
  duration = 3,
  speed = 1,
  gravity = 0.06,
}: BookingFireworksProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!enabled || !canvas) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = readColors();
    const pick = () => colors[Math.floor(Math.random() * colors.length)];
    const particles: Particle[] = [];
    const rockets: Rocket[] = [];

    // Place bursts around the perimeter of the card, slightly outside it.
    const rect = targetRef.current?.getBoundingClientRect();
    const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const cy = rect ? rect.top + Math.min(rect.height, window.innerHeight) / 2 : window.innerHeight / 2;
    const rx = (rect ? rect.width / 2 : 240) + 40;
    const ry = (rect ? Math.min(rect.height, window.innerHeight) / 2 : 200) + 20;
    const count = Math.max(1, Math.round(burstCount));
    const spacing = (Math.max(0.5, duration) * 1000 - ROCKET_FLIGHT_MS) / count;
    const start = performance.now();

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.6 - Math.PI / 2;
      const toX = Math.min(window.innerWidth - 24, Math.max(24, cx + Math.cos(angle) * rx));
      const toY = Math.min(window.innerHeight - 24, Math.max(24, cy + Math.sin(angle) * ry));
      rockets.push({
        startAt: start + i * Math.max(0, spacing) + Math.random() * 120,
        fromX: toX + (Math.random() - 0.5) * 40,
        fromY: toY + 140,
        toX,
        toY,
        color: pick(),
        exploded: false,
      });
    }

    const explode = (x: number, y: number, color: string) => {
      const n = Math.max(4, Math.round(particleCount));
      const accent = pick();
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + Math.random() * 0.2;
        const v = (1.6 + Math.random() * 2.6) * speed;
        const life = 50 + Math.random() * 35;
        particles.push({
          x,
          y,
          px: x,
          py: y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v,
          life,
          maxLife: life,
          color: Math.random() < 0.25 ? accent : color,
          size: 1.2 + Math.random() * 1.4,
        });
      }
    };

    let frame = 0;
    const tick = (now: number) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.lineCap = "round";

      for (const r of rockets) {
        if (r.exploded || now < r.startAt) continue;
        const t = Math.min(1, (now - r.startAt) / ROCKET_FLIGHT_MS);
        const ease = 1 - Math.pow(1 - t, 3);
        const x = r.fromX + (r.toX - r.fromX) * ease;
        const y = r.fromY + (r.toY - r.fromY) * ease;
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y + 14);
        ctx.lineTo(x, y);
        ctx.stroke();
        if (t >= 1) {
          r.exploded = true;
          explode(r.toX, r.toY, r.color);
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
        p.life -= 1;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.px - p.vx * 2, p.py - p.vy * 2);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      if (particles.length > 0 || rockets.some((r) => !r.exploded)) {
        frame = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [enabled, burstCount, particleCount, duration, speed, gravity, targetRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-10 h-screen w-screen"
    />
  );
}
