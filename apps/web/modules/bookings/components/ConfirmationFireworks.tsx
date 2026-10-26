import { useEffect, useRef } from "react";

// Design-system tokens used for the sparks. Read at runtime so light/dark themes and brand overrides apply.
const COLOR_TOKENS = [
  "--cal-bg-semantic-success-emphasis",
  "--cal-bg-semantic-info-emphasis",
  "--cal-bg-semantic-attention-emphasis",
  "--cal-bg-semantic-error-emphasis",
  "--cal-brand",
];
const FALLBACK_COLORS = ["#19a974", "#8197f8", "#fb923c", "#f87272"];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  birth: number;
  life: number;
}

export interface ConfirmationFireworksProps {
  bursts: number;
  particlesPerBurst: number;
  durationMs: number;
  opacity: number;
}

function resolveColors(el: HTMLElement): string[] {
  const styles = getComputedStyle(el);
  const colors = COLOR_TOKENS.map((token) => styles.getPropertyValue(token).trim()).filter(Boolean);
  return colors.length > 0 ? colors : FALLBACK_COLORS;
}

/**
 * Decorative, non-interactive fireworks drawn on a canvas behind the confirmation card.
 * Plays once on mount and is skipped entirely when the user prefers reduced motion.
 */
export function ConfirmationFireworks({
  bursts,
  particlesPerBurst,
  durationMs,
  opacity,
}: ConfirmationFireworksProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const colors = resolveColors(canvas);
    const particles: Particle[] = [];
    const burstCount = Math.max(0, Math.round(bursts));
    const spread = burstCount > 1 ? durationMs * 0.55 : 0;
    const schedule = Array.from({ length: burstCount }, (_, i) => ({
      at: burstCount > 1 ? (spread * i) / (burstCount - 1) : 0,
      fired: false,
      // Alternate sides so bursts frame the card rather than sit on top of it.
      x: width * (i % 2 === 0 ? 0.08 + Math.random() * 0.22 : 0.7 + Math.random() * 0.22),
      y: height * (0.12 + Math.random() * 0.3),
      color: colors[i % colors.length],
    }));
    const particleLife = Math.max(400, durationMs - spread);

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;

      for (const burst of schedule) {
        if (burst.fired || elapsed < burst.at) continue;
        burst.fired = true;
        const count = Math.max(1, Math.round(particlesPerBurst));
        for (let p = 0; p < count; p++) {
          const angle = (Math.PI * 2 * p) / count + Math.random() * 0.2;
          const speed = 1.6 + Math.random() * 2.2;
          particles.push({
            x: burst.x,
            y: burst.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            // Mostly the burst's colour, with an occasional accent from the palette.
            color: Math.random() < 0.8 ? burst.color : colors[Math.floor(Math.random() * colors.length)],
            size: 1.4 + Math.random() * 1.4,
            birth: now,
            life: particleLife * (0.7 + Math.random() * 0.3),
          });
        }
      }

      ctx.clearRect(0, 0, width, height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const age = (now - p.birth) / p.life;
        if (age >= 1) {
          particles.splice(i, 1);
          continue;
        }
        p.vx *= 0.97;
        p.vy = p.vy * 0.97 + 0.05;
        p.x += p.vx;
        p.y += p.vy;
        ctx.globalAlpha = opacity * (1 - age) * (1 - age);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - age * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (particles.length > 0 || schedule.some((b) => !b.fired)) {
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
  }, [bursts, particlesPerBurst, durationMs, opacity]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
    />
  );
}
