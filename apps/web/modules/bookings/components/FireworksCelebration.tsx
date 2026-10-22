import { useEffect, useRef, useState } from "react";

// Design-system tokens used for the spark colors (resolved at runtime so light/dark themes apply).
const COLOR_TOKENS = [
  "--cal-bg-visualization-1-emphasis",
  "--cal-bg-visualization-2-emphasis",
  "--cal-bg-visualization-3-emphasis",
  "--cal-bg-visualization-4-emphasis",
  "--cal-bg-visualization-5-emphasis",
  "--cal-bg-visualization-6-emphasis",
  "--cal-bg-visualization-7-emphasis",
];

const FALLBACK_COLORS = ["#ec4899", "#7c3aed", "#4255ff", "#19a874", "#e9b308", "#f97316", "#ef4444"];

export interface FireworksCelebrationProps {
  enabled?: boolean;
  /** Number of firework bursts. */
  burstCount?: number;
  /** Sparks per burst. */
  particleCount?: number;
  /** Total time (ms) over which bursts are launched. */
  duration?: number;
  /** Downward acceleration applied to sparks. */
  gravity?: number;
  /** Peak opacity of the effect, 0–1. */
  intensity?: number;
}

interface Rocket {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  color: string;
  launchAt: number;
  exploded: boolean;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

function readThemeColors(): string[] {
  if (typeof window === "undefined") return FALLBACK_COLORS;
  const styles = getComputedStyle(document.documentElement);
  return COLOR_TOKENS.map((token, i) => styles.getPropertyValue(token).trim() || FALLBACK_COLORS[i]);
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      setReduced(false);
      return;
    }
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/**
 * Decorative, non-interactive fireworks overlay that plays once on mount.
 * Renders nothing when the user prefers reduced motion.
 */
export function FireworksCelebration({
  enabled = true,
  burstCount = 6,
  particleCount = 48,
  duration = 2400,
  gravity = 0.06,
  intensity = 0.9,
}: FireworksCelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const active = enabled && !reducedMotion;

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
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

    const colors = readThemeColors();
    const pick = () => colors[Math.floor(Math.random() * colors.length)];
    const bursts = Math.max(1, Math.round(burstCount));
    const sparksPerBurst = Math.max(4, Math.round(particleCount));

    const rockets: Rocket[] = Array.from({ length: bursts }, (_, i) => {
      const targetY = height * (0.15 + Math.random() * 0.3);
      return {
        x: width * (0.15 + Math.random() * 0.7),
        y: height,
        targetY,
        vy: -(height - targetY) / 40,
        color: pick(),
        launchAt: bursts === 1 ? 0 : (duration * i) / bursts + Math.random() * 120,
        exploded: false,
      };
    });
    const sparks: Spark[] = [];

    const explode = (r: Rocket) => {
      r.exploded = true;
      const speed = 2 + Math.random() * 1.5;
      for (let i = 0; i < sparksPerBurst; i++) {
        const angle = (Math.PI * 2 * i) / sparksPerBurst + Math.random() * 0.2;
        const v = speed * (0.6 + Math.random() * 0.4);
        const maxLife = 55 + Math.random() * 25;
        sparks.push({
          x: r.x,
          y: r.y,
          vx: Math.cos(angle) * v,
          vy: Math.sin(angle) * v,
          life: maxLife,
          maxLife,
          color: Math.random() < 0.75 ? r.color : pick(),
          size: 1.5 + Math.random() * 1.5,
        });
      }
    };

    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      ctx.clearRect(0, 0, width, height);

      for (const r of rockets) {
        if (r.exploded || elapsed < r.launchAt) continue;
        r.y += r.vy;
        if (r.y <= r.targetY) {
          explode(r);
          continue;
        }
        ctx.globalAlpha = intensity * 0.8;
        ctx.fillStyle = r.color;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.vx *= 0.98;
        s.vy = s.vy * 0.98 + gravity;
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 1;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = intensity * (s.life / s.maxLife);
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      const done = sparks.length === 0 && rockets.every((r) => r.exploded);
      if (!done) {
        frame = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [active, burstCount, particleCount, duration, gravity, intensity]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
    />
  );
}
