import { useEffect, useRef } from "react";

// Semantic emphasis colors from the Cal.com design tokens (success, info, attention, error).
export const FIREWORKS_TOKEN_COLORS = ["#19a974", "#8197f8", "#fb923c", "#f87272"];

export interface BookingFireworksProps {
  enabled?: boolean;
  /** Seconds during which rockets keep launching. */
  duration?: number;
  /** Number of rockets launched over the duration. */
  burstCount?: number;
  /** Sparks per explosion. */
  particleCount?: number;
  /** Spark radius in px. */
  particleSize?: number;
  /** Accent color mixed in with the token palette. */
  primaryColor?: string;
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
  vx: number;
  vy: number;
  life: number;
  decay: number;
  color: string;
}

const GRAVITY = 0.045;
const FRICTION = 0.985;

export function BookingFireworks({
  enabled = true,
  duration = 4,
  burstCount = 8,
  particleCount = 60,
  particleSize = 2.5,
  primaryColor = FIREWORKS_TOKEN_COLORS[0],
}: BookingFireworksProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!enabled || !canvas) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const palette = [primaryColor, ...FIREWORKS_TOKEN_COLORS.filter((c) => c !== primaryColor)];
    const dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;
    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const rockets: Rocket[] = [];
    const sparks: Spark[] = [];
    const total = Math.max(1, Math.round(burstCount));
    const durationMs = Math.max(0.5, duration) * 1000;
    const launchTimes = Array.from({ length: total }, (_, i) =>
      Math.max(0, (i / total) * durationMs + (Math.random() - 0.5) * (durationMs / total) * 0.6)
    ).sort((a, b) => a - b);
    let launched = 0;
    const start = performance.now();
    let frame = 0;

    const launch = () => {
      const x = width * (0.15 + Math.random() * 0.7);
      const targetY = height * (0.12 + Math.random() * 0.35);
      const distance = height - targetY;
      rockets.push({
        x,
        y: height,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -Math.sqrt(2 * GRAVITY * distance) * 1.05,
        targetY,
        color: palette[Math.floor(Math.random() * palette.length)],
      });
    };

    const explode = (r: Rocket) => {
      const count = Math.max(4, Math.round(particleCount));
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
        const speed = 1.5 + Math.random() * 2.5;
        sparks.push({
          x: r.x,
          y: r.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.008 + Math.random() * 0.01,
          color: Math.random() < 0.8 ? r.color : palette[Math.floor(Math.random() * palette.length)],
        });
      }
    };

    const tick = (now: number) => {
      const elapsed = now - start;
      while (launched < launchTimes.length && elapsed >= launchTimes[launched]) {
        launch();
        launched++;
      }

      // Fade previous frame to leave short trails on a transparent canvas.
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.x += r.vx;
        r.y += r.vy;
        r.vy += GRAVITY;
        ctx.globalAlpha = 1;
        ctx.fillStyle = r.color;
        ctx.beginPath();
        ctx.arc(r.x, r.y, particleSize * 0.9, 0, Math.PI * 2);
        ctx.fill();
        if (r.vy >= 0 || r.y <= r.targetY) {
          explode(r);
          rockets.splice(i, 1);
        }
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.vx *= FRICTION;
        s.vy = s.vy * FRICTION + GRAVITY;
        s.x += s.vx;
        s.y += s.vy;
        s.life -= s.decay;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = s.life;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, particleSize * Math.max(0.4, s.life), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (launched < launchTimes.length || rockets.length > 0 || sparks.length > 0) {
        frame = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, width, height);
    };
  }, [enabled, duration, burstCount, particleCount, particleSize, primaryColor]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
