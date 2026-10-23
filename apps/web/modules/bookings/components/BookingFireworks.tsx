import { useEffect, useRef, useState } from "react";

export interface BookingFireworksProps {
  /** Animation speed multiplier (1 = normal). */
  speed?: number;
  /** Number of firework bursts in the celebration. */
  burstCount?: number;
  /** Number of particles in each burst. */
  particlesPerBurst?: number;
  /** Particle colors (hex). */
  colors?: string[];
}

interface Particle {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface Burst {
  at: number;
  x: number;
  y: number;
  fired: boolean;
}

const GRAVITY = 0.05;
const DRAG = 0.985;
const BASE_LIFE = 70;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/**
 * Decorative, one-shot fireworks celebration drawn on a canvas overlay.
 * Fills its nearest positioned ancestor and never intercepts pointer events.
 * Skipped entirely when the user prefers reduced motion.
 */
export function BookingFireworks({
  speed = 1,
  burstCount = 6,
  particlesPerBurst = 48,
  colors = ["#50c39f", "#8197f8", "#fb923c", "#f87272"],
}: BookingFireworksProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const colorKey = colors.join(",");

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const palette = colorKey.split(",").filter(Boolean);
    const step = Math.max(0.1, speed);
    const dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Schedule bursts around the card: spread horizontally, upper half vertically.
    const bursts: Burst[] = Array.from({ length: Math.max(0, Math.round(burstCount)) }, (_, i) => ({
      at: i * 22 + Math.random() * 14,
      x: 0.12 + Math.random() * 0.76,
      y: 0.08 + Math.random() * 0.4,
      fired: false,
    }));
    const particles: Particle[] = [];
    let tick = 0;
    let frame = 0;

    const fire = (burst: Burst) => {
      const cx = burst.x * width;
      const cy = burst.y * height;
      const count = Math.max(1, Math.round(particlesPerBurst));
      const power = 2.2 + Math.random() * 1.6;
      const burstColor = palette[Math.floor(Math.random() * palette.length)] ?? "#50c39f";
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
        const velocity = power * (0.55 + Math.random() * 0.45);
        // Mostly the burst's color, with a sprinkle of the rest of the palette.
        const color =
          Math.random() < 0.7 ? burstColor : palette[Math.floor(Math.random() * palette.length)] ?? burstColor;
        const maxLife = BASE_LIFE * (0.7 + Math.random() * 0.5);
        particles.push({
          x: cx,
          y: cy,
          prevX: cx,
          prevY: cy,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          life: maxLife,
          maxLife,
          size: 1.5 + Math.random() * 1.5,
          color,
        });
      }
    };

    const render = () => {
      tick += step;
      ctx.clearRect(0, 0, width, height);

      for (const burst of bursts) {
        if (!burst.fired && tick >= burst.at) {
          burst.fired = true;
          fire(burst);
        }
      }

      ctx.lineCap = "round";
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (!p) continue;
        p.prevX = p.x;
        p.prevY = p.y;
        const drag = Math.pow(DRAG, step);
        p.vx *= drag;
        p.vy = p.vy * drag + GRAVITY * step;
        p.x += p.vx * step;
        p.y += p.vy * step;
        p.life -= step;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        const alpha = Math.min(1, (p.life / p.maxLife) * 1.4);
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.prevX - p.vx * 2, p.prevY - p.vy * 2);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      const pending = bursts.some((b) => !b.fired);
      if (pending || particles.length > 0) {
        frame = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, width, height);
    };
  }, [reducedMotion, speed, burstCount, particlesPerBurst, colorKey]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
    />
  );
}
