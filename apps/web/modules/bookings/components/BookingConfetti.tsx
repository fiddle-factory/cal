import { useEffect, useRef } from "react";

export interface BookingConfettiProps {
  /** Number of confetti pieces per burst. */
  amount: number;
  /** Playback speed multiplier (1 = normal). */
  speed: number;
  /** Hex colors the pieces are randomly drawn from. */
  colors: string[];
  /** Replay the burst continuously instead of once. */
  loop: boolean;
}

type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  tilt: number;
  tiltSpeed: number;
  wobble: number;
  wobbleSpeed: number;
  width: number;
  height: number;
  color: string;
  round: boolean;
};

const GRAVITY = 900; // px/s²
const DRAG = 1.6; // per second
const TERMINAL_VELOCITY = 260; // px/s

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const random = (min: number, max: number) => min + Math.random() * (max - min);

function createBurst(amount: number, width: number, height: number, colors: string[]): Piece[] {
  const palette = colors.length > 0 ? colors : ["#ffffff"];
  const originY = Math.min(height * 0.18, 140);
  const pieces: Piece[] = [];
  for (let i = 0; i < amount; i++) {
    // Two bursts from either side of the success icon, plus a few from the center.
    const side = i % 3 === 0 ? 0 : i % 3 === 1 ? -1 : 1;
    const originX = width / 2 + side * Math.min(width * 0.18, 160);
    const angle = -Math.PI / 2 + side * 0.45 + random(-0.6, 0.6);
    const velocity = random(420, 900);
    const size = random(6, 11);
    pieces.push({
      x: originX + random(-12, 12),
      y: originY + random(-8, 8),
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      rotation: random(0, Math.PI * 2),
      rotationSpeed: random(-8, 8),
      tilt: random(0, Math.PI * 2),
      tiltSpeed: random(4, 10),
      wobble: random(0, Math.PI * 2),
      wobbleSpeed: random(2, 5),
      width: size,
      height: size * random(0.4, 0.7),
      color: palette[Math.floor(Math.random() * palette.length)],
      round: Math.random() < 0.25,
    });
  }
  return pieces;
}

export function BookingConfetti({ amount, speed, colors, loop }: BookingConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorsKey = colors.join(",");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion()) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const palette = colorsKey.split(",").filter(Boolean);
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    resizeObserver?.observe(canvas);

    const count = Math.max(0, Math.round(amount));
    let pieces = createBurst(count, width, height, palette);
    let frame = 0;
    let last = performance.now();
    let idleFor = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05) * Math.max(speed, 0);
      last = now;
      ctx.clearRect(0, 0, width, height);

      const dragFactor = Math.exp(-DRAG * dt);
      pieces = pieces.filter((p) => p.y < height + 24);
      for (const p of pieces) {
        p.vx *= dragFactor;
        p.vy = Math.min(p.vy * dragFactor + GRAVITY * dt, TERMINAL_VELOCITY);
        p.wobble += p.wobbleSpeed * dt;
        p.x += (p.vx + Math.sin(p.wobble) * 30) * dt;
        p.y += p.vy * dt;
        p.rotation += p.rotationSpeed * dt;
        p.tilt += p.tiltSpeed * dt;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.scale(1, Math.cos(p.tilt));
        ctx.fillStyle = p.color;
        if (p.round) {
          ctx.beginPath();
          ctx.arc(0, 0, p.width / 2.4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        }
        ctx.restore();
      }

      if (pieces.length === 0) {
        if (!loop) return;
        idleFor += dt;
        if (idleFor > 0.6) {
          idleFor = 0;
          pieces = createBurst(count, width, height, palette);
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      ctx.clearRect(0, 0, width, height);
    };
  }, [amount, speed, colorsKey, loop]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 h-full w-full motion-reduce:hidden"
    />
  );
}
