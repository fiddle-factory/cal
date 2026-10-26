import { useEffect, useRef } from "react";
import type { RefObject } from "react";

// Design-system tokens used for confetti pieces (resolved at runtime so themes apply).
const COLOR_TOKENS = [
  "--cal-bg-visualization-1-emphasis",
  "--cal-bg-visualization-2-emphasis",
  "--cal-bg-visualization-3-emphasis",
  "--cal-bg-visualization-4-emphasis",
  "--cal-bg-visualization-5-emphasis",
  "--cal-bg-visualization-6-emphasis",
];

const FALLBACK_COLORS = ["#ec4899", "#7c3aed", "#4255ff", "#19a874", "#e9b308", "#f97315"];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  spin: number;
  wobble: number;
  wobbleSpeed: number;
  width: number;
  height: number;
  color: string;
}

export interface ConfettiBurstProps {
  /** Element the burst originates from; defaults to the top-center of the viewport. */
  originRef?: RefObject<HTMLElement>;
  particleCount?: number;
  durationMs?: number;
  /** Total spread angle in degrees. */
  spread?: number;
  /** Peak opacity of the pieces (0–1). */
  opacity?: number;
}

function resolveColors(): string[] {
  if (typeof window === "undefined") return FALLBACK_COLORS;
  const styles = getComputedStyle(document.documentElement);
  const colors = COLOR_TOKENS.map((token) => styles.getPropertyValue(token).trim()).filter(Boolean);
  return colors.length > 0 ? colors : FALLBACK_COLORS;
}

export function ConfettiBurst({
  originRef,
  particleCount = 90,
  durationMs = 2600,
  spread = 80,
  opacity = 0.9,
}: ConfettiBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const rect = originRef?.current?.getBoundingClientRect();
    const originX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const originY = rect ? rect.top + rect.height / 2 : window.innerHeight * 0.2;

    const colors = resolveColors();
    const spreadRad = (spread * Math.PI) / 180;
    const particles: Particle[] = Array.from({ length: particleCount }, () => {
      // Angle around straight up (-90°), within the spread.
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * spreadRad;
      const speed = 6 + Math.random() * 7;
      return {
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.3,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.05 + Math.random() * 0.1,
        width: 5 + Math.random() * 4,
        height: 8 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    });

    const gravity = 0.22;
    const drag = 0.985;
    let frame = 0;
    let start: number | null = null;

    const tick = (now: number) => {
      if (start === null) start = now;
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      // Hold full opacity, then fade out over the last 40% so the card stays readable.
      const alpha = opacity * (progress < 0.6 ? 1 : 1 - (progress - 0.6) / 0.4);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = Math.max(alpha, 0);
      for (const p of particles) {
        p.vx *= drag;
        p.vy = p.vy * drag + gravity;
        p.wobble += p.wobbleSpeed;
        p.x += p.vx + Math.sin(p.wobble) * 0.6;
        p.y += p.vy;
        p.rotation += p.spin;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        // Flip on one axis to fake a 3D tumble.
        ctx.scale(1, Math.cos(p.wobble));
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        ctx.restore();
      }

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [originRef, particleCount, durationMs, spread, opacity]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 h-full w-full motion-reduce:hidden"
    />
  );
}
