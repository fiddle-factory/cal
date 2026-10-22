import React from "react";

// Vibrant values from the Cal.com semantic tokens (success / info / attention / error emphasis).
const DEFAULT_PALETTE = ["#19a974", "#8197f8", "#fb923c", "#f87272"];

const CONFIG_ID = "BookingConfirmationFireworks-controls";

export function BookingConfirmationFireworks() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = React.useState(true);
  const [burstCount, setBurstCount] = React.useState(5);
  const [particleCount, setParticleCount] = React.useState(28);
  const [duration, setDuration] = React.useState(1400);
  const [spread, setSpread] = React.useState(130);
  const [particleSize, setParticleSize] = React.useState(6);
  const [primaryColor, setPrimaryColor] = React.useState("#19a974");

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector(`[data-config-id="${CONFIG_ID}"]`);
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.enabled === "boolean") setEnabled(p.enabled);
      if (typeof p.burstCount === "number") setBurstCount(p.burstCount);
      if (typeof p.particleCount === "number") setParticleCount(p.particleCount);
      if (typeof p.duration === "number") setDuration(p.duration);
      if (typeof p.spread === "number") setSpread(p.spread);
      if (typeof p.particleSize === "number") setParticleSize(p.particleSize);
      if (typeof p.primaryColor === "string") setPrimaryColor(p.primaryColor);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    if (typeof container.animate !== "function") return;

    const palette = [primaryColor, ...DEFAULT_PALETTE.slice(1)];
    const animations: Animation[] = [];
    const nodes: HTMLElement[] = [];
    const burstInterval = 350;

    for (let b = 0; b < burstCount; b++) {
      const originX = 15 + Math.random() * 70;
      const originY = 12 + Math.random() * 35;
      const delay = 150 + b * burstInterval + Math.random() * 120;
      const burstColor = palette[b % palette.length];

      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.2;
        const distance = spread * (0.6 + Math.random() * 0.4);
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;
        const gravity = spread * 0.35;
        const color = Math.random() < 0.7 ? burstColor : palette[Math.floor(Math.random() * palette.length)];

        const particle = document.createElement("span");
        particle.style.position = "absolute";
        particle.style.left = `${originX}%`;
        particle.style.top = `${originY}%`;
        particle.style.width = `${particleSize}px`;
        particle.style.height = `${particleSize}px`;
        particle.style.marginLeft = `${-particleSize / 2}px`;
        particle.style.marginTop = `${-particleSize / 2}px`;
        particle.style.borderRadius = "9999px";
        particle.style.backgroundColor = color;
        particle.style.boxShadow = `0 0 ${particleSize * 1.5}px ${color}`;
        particle.style.opacity = "0";
        container.appendChild(particle);
        nodes.push(particle);

        animations.push(
          particle.animate(
            [
              { transform: "translate(0, 0) scale(1)", opacity: 1 },
              { transform: `translate(${dx * 0.9}px, ${dy * 0.9}px) scale(0.9)`, opacity: 1, offset: 0.6 },
              { transform: `translate(${dx}px, ${dy + gravity}px) scale(0.3)`, opacity: 0 },
            ],
            {
              duration: duration * (0.85 + Math.random() * 0.3),
              delay,
              easing: "cubic-bezier(0.15, 0.8, 0.3, 1)",
              fill: "both",
            }
          )
        );
      }
    }

    return () => {
      animations.forEach((animation) => animation.cancel());
      nodes.forEach((node) => node.remove());
    };
  }, [enabled, burstCount, particleCount, duration, spread, particleSize, primaryColor]);

  return (
    <div
      ref={containerRef}
      data-config-id={CONFIG_ID}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    />
  );
}
