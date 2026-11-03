import { useEffect, useRef } from "react";

// Celebration palette taken from the design system's visualization tokens.
const TOKEN_VARS = [
  "--cal-bg-visualization-1-emphasis",
  "--cal-bg-visualization-2-emphasis",
  "--cal-bg-visualization-3-emphasis",
  "--cal-bg-visualization-4-emphasis",
  "--cal-bg-visualization-5-emphasis",
  "--cal-bg-visualization-6-emphasis",
  "--cal-bg-visualization-7-emphasis",
];

const FALLBACK_COLORS = [
  "hsla(330, 81%, 60%, 1)",
  "hsla(256, 85%, 57%, 1)",
  "hsla(235, 100%, 63%, 1)",
  "hsla(158, 74%, 38%, 1)",
  "hsla(45, 93%, 47%, 1)",
  "hsla(25, 95%, 53%, 1)",
  "hsla(0, 84%, 60%, 1)",
];

type Rocket = { x: number; y: number; vy: number; targetY: number; color: string };
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  size: number;
  color: string;
};

export interface BookingFireworksProps {
  enabled?: boolean;
  burstCount?: number;
  particleCount?: number;
  speed?: number;
  durationMs?: number;
  opacity?: number;
  loop?: boolean;
}

export function BookingFireworks({
  enabled = true,
  burstCount = 8,
  particleCount = 60,
  speed = 1,
  durationMs = 4000,
  opacity = 0.9,
  loop = false,
}: BookingFireworksProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const styles = getComputedStyle(canvas);
    const colors = TOKEN_VARS.map((name, i) => styles.getPropertyValue(name).trim() || FALLBACK_COLORS[i]);
    const pickColor = () => colors[Math.floor(Math.random() * colors.length)];

    let width = 0;
    let height = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const bursts = Math.max(1, Math.round(burstCount));
    const makeSchedule = () =>
      Array.from({ length: bursts }, (_, i) => (i / bursts) * durationMs * 0.75 + Math.random() * 250).sort(
        (a, b) => a - b
      );

    let schedule = makeSchedule();
    let launched = 0;
    let start = performance.now();
    let last = start;
    let frame = 0;
    const rockets: Rocket[] = [];
    const particles: Particle[] = [];

    const launch = () => {
      const targetY = height * (0.1 + Math.random() * 0.35);
      rockets.push({
        x: width * (0.08 + Math.random() * 0.84),
        y: height,
        vy: -(height - targetY) / (800 / speed),
        targetY,
        color: pickColor(),
      });
    };

    const explode = (rocket: Rocket) => {
      const count = Math.max(4, Math.round(particleCount));
      const secondary = pickColor();
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.2;
        const velocity = (0.08 + Math.random() * 0.17) * speed;
        particles.push({
          x: rocket.x,
          y: rocket.y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          age: 0,
          life: 900 + Math.random() * 700,
          size: 1.5 + Math.random() * 1.5,
          color: Math.random() < 0.7 ? rocket.color : secondary,
        });
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(50, now - last);
      last = now;
      const elapsed = now - start;

      while (launched < schedule.length && elapsed >= schedule[launched]) {
        launch();
        launched++;
      }

      // Fade previous frame to leave short trails while keeping the canvas transparent.
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy * dt;
        ctx.globalAlpha = opacity;
        ctx.fillStyle = r.color;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
        ctx.fill();
        if (r.y <= r.targetY) {
          explode(r);
          rockets.splice(i, 1);
        }
      }

      const drag = Math.pow(0.985, dt / 16);
      const gravity = 0.00012 * speed * speed;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.age += dt;
        if (p.age >= p.life) {
          particles.splice(i, 1);
          continue;
        }
        p.vx *= drag;
        p.vy = p.vy * drag + gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        ctx.globalAlpha = opacity * (1 - p.age / p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      const idle = launched >= schedule.length && rockets.length === 0 && particles.length === 0;
      if (idle) {
        if (!loop) {
          ctx.clearRect(0, 0, width, height);
          return;
        }
        schedule = makeSchedule();
        launched = 0;
        start = now;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, width, height);
    };
  }, [enabled, burstCount, particleCount, speed, durationMs, opacity, loop]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}
