import { useEffect, useRef } from "react";

// Celebration colors come from the design system's visualization palette.
const PALETTE_TOKENS: Array<[string, string]> = [
  ["--cal-bg-visualization-1-emphasis", "hsla(330, 81%, 60%, 1)"],
  ["--cal-bg-visualization-2-emphasis", "hsla(256, 85%, 57%, 1)"],
  ["--cal-bg-visualization-3-emphasis", "hsla(235, 100%, 63%, 1)"],
  ["--cal-bg-visualization-4-emphasis", "hsla(158, 74%, 38%, 1)"],
  ["--cal-bg-visualization-5-emphasis", "hsla(45, 93%, 47%, 1)"],
  ["--cal-bg-visualization-6-emphasis", "hsla(25, 95%, 53%, 1)"],
  ["--cal-bg-visualization-7-emphasis", "hsla(0, 84%, 60%, 1)"],
];

function readPalette(): string[] {
  if (typeof window === "undefined") return PALETTE_TOKENS.map(([, fallback]) => fallback);
  const styles = window.getComputedStyle(document.documentElement);
  return PALETTE_TOKENS.map(([token, fallback]) => styles.getPropertyValue(token).trim() || fallback);
}

interface Rocket {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetY: number;
  color: string;
}

interface Spark {
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

export interface BookingFireworksProps {
  /** Number of fireworks launched during the show. */
  burstCount: number;
  /** Sparks per explosion. */
  particleCount: number;
  /** Total length of the show, in seconds. */
  durationSeconds: number;
  /** Velocity multiplier for rockets and sparks. */
  speed: number;
}

export function BookingFireworks({ burstCount, particleCount, durationSeconds, speed }: BookingFireworksProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const palette = readPalette();
    const pick = () => palette[Math.floor(Math.random() * palette.length)];
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

    const durationMs = Math.max(0.5, durationSeconds) * 1000;
    const launchWindow = durationMs * 0.7;
    const launches = Array.from({ length: Math.max(1, Math.round(burstCount)) }, (_, i, arr) =>
      arr.length === 1 ? 0 : (launchWindow * i) / (arr.length - 1) + Math.random() * 120
    );
    let launched = 0;
    const rockets: Rocket[] = [];
    const sparks: Spark[] = [];

    const launch = () => {
      const x = width * (0.15 + Math.random() * 0.7);
      const targetY = height * (0.12 + Math.random() * 0.33);
      rockets.push({
        x,
        y: height,
        vx: (Math.random() - 0.5) * 1.5 * speed,
        vy: -(9 + Math.random() * 3) * speed,
        targetY,
        color: pick(),
      });
    };

    const explode = (rocket: Rocket) => {
      const count = Math.max(4, Math.round(particleCount));
      const secondary = pick();
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
        const velocity = (1.5 + Math.random() * 3.5) * speed;
        const maxLife = 50 + Math.random() * 30;
        sparks.push({
          x: rocket.x,
          y: rocket.y,
          px: rocket.x,
          py: rocket.y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          life: maxLife,
          maxLife,
          color: Math.random() < 0.75 ? rocket.color : secondary,
          size: 1.5 + Math.random() * 1.5,
        });
      }
    };

    let frame = 0;
    let last = performance.now();
    const start = last;

    const tick = (now: number) => {
      const elapsed = now - start;
      // Normalize to ~60fps steps so motion is consistent across refresh rates.
      const step = Math.min(3, (now - last) / 16.67);
      last = now;

      while (launched < launches.length && elapsed >= launches[launched]) {
        launch();
        launched++;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";
      ctx.lineCap = "round";

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        const px = r.x;
        const py = r.y;
        r.x += r.vx * step;
        r.y += r.vy * step;
        r.vy += 0.12 * speed * step;
        ctx.globalAlpha = 1;
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(px - r.vx * 2, py - r.vy * 2);
        ctx.lineTo(r.x, r.y);
        ctx.stroke();
        if (r.y <= r.targetY || r.vy >= 0) {
          explode(r);
          rockets.splice(i, 1);
        }
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.px = s.x;
        s.py = s.y;
        s.vx *= Math.pow(0.97, step);
        s.vy = s.vy * Math.pow(0.97, step) + 0.06 * speed * step;
        s.x += s.vx * step;
        s.y += s.vy * step;
        s.life -= step;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        const alpha = Math.max(0, s.life / s.maxLife);
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.size * (0.6 + alpha * 0.6);
        ctx.beginPath();
        ctx.moveTo(s.px - s.vx * 2, s.py - s.vy * 2);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      const finished = launched >= launches.length && rockets.length === 0 && sparks.length === 0;
      if (finished && elapsed >= launchWindow) {
        ctx.clearRect(0, 0, width, height);
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, width, height);
    };
  }, [burstCount, particleCount, durationSeconds, speed]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
    />
  );
}
