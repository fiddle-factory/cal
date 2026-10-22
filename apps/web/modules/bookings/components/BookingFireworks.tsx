import React from "react";

// Design-system visualization tokens (defined for light and dark themes in packages/config/theme/tokens.css)
const FIREWORK_COLORS = [
  "var(--cal-bg-visualization-1-emphasis)",
  "var(--cal-bg-visualization-2-emphasis)",
  "var(--cal-bg-visualization-3-emphasis)",
  "var(--cal-bg-visualization-4-emphasis)",
  "var(--cal-bg-visualization-5-emphasis)",
  "var(--cal-bg-visualization-6-emphasis)",
  "var(--cal-bg-visualization-7-emphasis)",
];

const KEYFRAMES = `
@keyframes cal-firework-particle {
  0% { transform: translate(-50%, -50%) translate(0, 0) scale(1); opacity: 0; }
  8% { opacity: 1; }
  70% { opacity: 1; }
  100% { transform: translate(-50%, -50%) translate(var(--fw-dx), calc(var(--fw-dy) + var(--fw-fall))) scale(0.3); opacity: 0; }
}
@keyframes cal-firework-flash {
  0% { transform: translate(-50%, -50%) scale(0.2); opacity: 0; }
  15% { opacity: 0.9; }
  100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .cal-fireworks { display: none !important; }
}
`;

// Small deterministic PRNG so server and client render the same layout
function createRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(true);
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      setReduced(false);
      return;
    }
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function BookingFireworks() {
  const [fireworksEnabled, setFireworksEnabled] = React.useState(true);
  const [burstCount, setBurstCount] = React.useState(5);
  const [particleCount, setParticleCount] = React.useState(24);
  const [burstRadius, setBurstRadius] = React.useState(120);
  const [burstDuration, setBurstDuration] = React.useState(1.4);
  const [burstStagger, setBurstStagger] = React.useState(0.45);
  const [particleSize, setParticleSize] = React.useState(6);
  const prefersReducedMotion = usePrefersReducedMotion();

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="BookingFireworks-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.fireworksEnabled === "boolean") setFireworksEnabled(p.fireworksEnabled);
      if (typeof p.burstCount === "number") setBurstCount(p.burstCount);
      if (typeof p.particleCount === "number") setParticleCount(p.particleCount);
      if (typeof p.burstRadius === "number") setBurstRadius(p.burstRadius);
      if (typeof p.burstDuration === "number") setBurstDuration(p.burstDuration);
      if (typeof p.burstStagger === "number") setBurstStagger(p.burstStagger);
      if (typeof p.particleSize === "number") setParticleSize(p.particleSize);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, [prefersReducedMotion]);
  // geneditor-listener-end

  const bursts = React.useMemo(() => {
    const random = createRandom(20240611);
    return Array.from({ length: Math.max(0, Math.round(burstCount)) }, (_, b) => {
      const color = FIREWORK_COLORS[b % FIREWORK_COLORS.length];
      const accent = FIREWORK_COLORS[(b + 3) % FIREWORK_COLORS.length];
      const count = Math.max(1, Math.round(particleCount));
      return {
        x: 12 + random() * 76,
        y: 12 + random() * 40,
        delay: b * burstStagger,
        particles: Array.from({ length: count }, (_, i) => {
          const angle = (i / count) * Math.PI * 2 + random() * 0.3;
          const distance = burstRadius * (0.6 + random() * 0.4);
          return {
            dx: Math.cos(angle) * distance,
            dy: Math.sin(angle) * distance,
            color: i % 3 === 0 ? accent : color,
          };
        }),
        color,
      };
    });
  }, [burstCount, particleCount, burstRadius, burstStagger]);

  if (prefersReducedMotion) return null;

  // Re-keying replays the show when a tunable changes
  const runKey = `${burstCount}-${particleCount}-${burstRadius}-${burstDuration}-${burstStagger}-${particleSize}`;

  return (
    <div
      data-config-id="BookingFireworks-controls"
      className="cal-fireworks pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden="true">
      <style>{KEYFRAMES}</style>
      {fireworksEnabled && (
        <div key={runKey} className="absolute inset-0">
          {bursts.map((burst, b) => (
            <div
              key={b}
              className="absolute"
              style={{ left: `${burst.x}%`, top: `${burst.y}%`, width: 0, height: 0 }}>
              <span
                className="absolute rounded-full"
                style={{
                  left: 0,
                  top: 0,
                  width: burstRadius * 0.6,
                  height: burstRadius * 0.6,
                  background: `radial-gradient(circle, ${burst.color} 0%, transparent 70%)`,
                  opacity: 0,
                  animation: `cal-firework-flash ${burstDuration * 0.5}s ease-out ${burst.delay}s forwards`,
                }}
              />
              {burst.particles.map((particle, i) => (
                <span
                  key={i}
                  className="absolute rounded-full"
                  style={
                    {
                      left: 0,
                      top: 0,
                      width: particleSize,
                      height: particleSize,
                      backgroundColor: particle.color,
                      boxShadow: `0 0 ${particleSize * 1.5}px ${particle.color}`,
                      opacity: 0,
                      "--fw-dx": `${particle.dx}px`,
                      "--fw-dy": `${particle.dy}px`,
                      "--fw-fall": `${burstRadius * 0.35}px`,
                      animation: `cal-firework-particle ${burstDuration}s cubic-bezier(0.15, 0.7, 0.3, 1) ${burst.delay}s forwards`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
