import { useEffect, useRef, useState } from "react";

export interface ConfettiBurstProps {
  /** Number of confetti pieces in the burst. */
  count?: number;
  /** Playback speed multiplier (1 = normal). */
  speed?: number;
  /** Piece colors (hex). */
  colors?: string[];
  /** Turn the effect off entirely. */
  enabled?: boolean;
  /** Burst origin as a fraction of the container (0–1). */
  originX?: number;
  originY?: number;
}

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  rotation: number;
  rotationSpeed: number;
  wobble: number;
  wobbleSpeed: number;
  color: string;
  round: boolean;
}

const GRAVITY = 900; // px / s^2
const DRAG = 0.985;
const DURATION_MS = 4200;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/**
 * One-shot celebratory confetti burst drawn on a canvas that fills its positioned parent.
 * Renders nothing when the user prefers reduced motion.
 */
export function ConfettiBurst({
  count = 120,
  speed = 1,
  colors = ["#111827"],
  enabled = true,
  originX = 0.5,
  originY = 0.2,
}: ConfettiBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const colorKey = colors.join(",");

  useEffect(() => {
    if (!enabled || prefersReducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const palette = colorKey.split(",").filter(Boolean);
    const ox = width * originX;
    const oy = height * originY;
    const pieces: Piece[] = Array.from({ length: Math.max(0, Math.round(count)) }, () => {
      // Fan upwards: angle between ~-160° and ~-20°
      const angle = (-90 + (Math.random() - 0.5) * 140) * (Math.PI / 180);
      const velocity = 350 + Math.random() * 450;
      return {
        x: ox + (Math.random() - 0.5) * 24,
        y: oy + (Math.random() - 0.5) * 12,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        width: 6 + Math.random() * 6,
        height: 8 + Math.random() * 8,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 12,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 6 + Math.random() * 6,
        color: palette[Math.floor(Math.random() * palette.length)] ?? "#111827",
        round: Math.random() < 0.25,
      };
    });

    let frame = 0;
    let last = performance.now();
    // Simulated time (scaled by speed), in ms
    let elapsed = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05) * speed;
      last = now;
      elapsed += dt * 1000;
      const progress = elapsed / DURATION_MS;
      const alpha = progress > 0.7 ? Math.max(0, 1 - (progress - 0.7) / 0.3) : 1;

      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = alpha;
      for (const p of pieces) {
        p.vx *= DRAG;
        p.vy = p.vy * DRAG + GRAVITY * dt;
        p.wobble += p.wobbleSpeed * dt;
        p.x += (p.vx + Math.sin(p.wobble) * 30) * dt;
        p.y += p.vy * dt;
        p.rotation += p.rotationSpeed * dt;
        if (p.y > height + 20) continue;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        if (p.round) {
          ctx.beginPath();
          ctx.arc(0, 0, p.width / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Flip effect: scale height by the wobble to fake 3D tumbling
          ctx.scale(1, Math.cos(p.wobble));
          ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        }
        ctx.restore();
      }

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      ctx.clearRect(0, 0, width, height);
    };
  }, [count, speed, colorKey, enabled, prefersReducedMotion, originX, originY]);

  if (!enabled || prefersReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
    />
  );
}
