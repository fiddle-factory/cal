import { useEffect, useRef } from "react";

// Design system visualization tokens, with fallbacks matching the light theme values.
const COLOR_TOKENS: [string, string][] = [
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
}

interface Rocket {
  x: number;
  y: number;
  px: number;
  py: number;
  vy: number;
  targetY: number;
  color: string;
}

export interface BookingFireworksProps {
  enabled?: boolean;
  loop?: boolean;
  /** Milliseconds between launches */
  interval?: number;
  /** Sparks per burst */
  particleCount?: number;
  /** Spark line width in px */
  sparkSize?: number;
  /** Multiplier for burst speed */
  speed?: number;
}

export function BookingFireworks({
  enabled = true,
  loop = true,
  interval = 900,
  particleCount = 60,
  sparkSize = 2,
  speed = 1,
}: BookingFireworksProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const styles = getComputedStyle(canvas);
    const colors = COLOR_TOKENS.map(([token, fallback]) => styles.getPropertyValue(token).trim() || fallback);
    const pickColor = () => colors[Math.floor(Math.random() * colors.length)];

    let width = 0;
    let height = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    resizeObserver?.observe(canvas);

    const rockets: Rocket[] = [];
    const particles: Particle[] = [];
    // Show a few bursts once when not looping.
    let launchesLeft = loop ? Infinity : 5;

    const launch = () => {
      if (launchesLeft <= 0 || width === 0) return;
      launchesLeft -= 1;
      const x = width * (0.1 + Math.random() * 0.8);
      rockets.push({
        x,
        y: height,
        px: x,
        py: height,
        vy: -(height * 0.018 + Math.random() * 3) * speed,
        targetY: height * (0.12 + Math.random() * 0.35),
        color: pickColor(),
      });
    };

    const explode = (x: number, y: number, color: string) => {
      const secondary = pickColor();
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.2;
        const velocity = (1.5 + Math.random() * 3.5) * speed;
        const maxLife = 50 + Math.random() * 30;
        particles.push({
          x,
          y,
          px: x,
          py: y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          life: maxLife,
          maxLife,
          color: Math.random() < 0.75 ? color : secondary,
        });
      }
    };

    launch();
    const launchTimer = window.setInterval(launch, Math.max(150, interval));

    let frame = 0;
    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = "round";

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.px = r.x;
        r.py = r.y;
        r.y += r.vy;
        r.vy *= 0.985;
        ctx.globalAlpha = 1;
        ctx.strokeStyle = r.color;
        ctx.lineWidth = sparkSize;
        ctx.beginPath();
        ctx.moveTo(r.x, r.py + 8);
        ctx.lineTo(r.x, r.y);
        ctx.stroke();
        if (r.y <= r.targetY || r.vy > -1) {
          explode(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.px = p.x;
        p.py = p.y;
        p.vx *= 0.96;
        p.vy = p.vy * 0.96 + 0.06;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = sparkSize;
        ctx.beginPath();
        ctx.moveTo(p.px - p.vx * 2, p.py - p.vy * 2);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);

    return () => {
      window.clearInterval(launchTimer);
      window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      ctx.clearRect(0, 0, width, height);
    };
  }, [enabled, loop, interval, particleCount, sparkSize, speed]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 h-full w-full" />;
}
