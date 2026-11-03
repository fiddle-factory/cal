import * as React from "react";

const BURSTS = [
  { left: 14, top: 22, delay: 0, colorIndex: 0 },
  { left: 86, top: 18, delay: 0.35, colorIndex: 1 },
  { left: 30, top: 6, delay: 0.8, colorIndex: 2 },
  { left: 70, top: 36, delay: 1.15, colorIndex: 0 },
  { left: 50, top: 2, delay: 1.5, colorIndex: 1 },
  { left: 8, top: 52, delay: 1.9, colorIndex: 2 },
  { left: 92, top: 56, delay: 2.2, colorIndex: 0 },
];

const KEYFRAMES = `
@keyframes cal-firework-particle {
  0% { transform: translate(-50%, -50%) translate(0, 0) scale(0.4); opacity: 0; }
  8% { opacity: 1; }
  45% { opacity: 1; }
  100% { transform: translate(-50%, -50%) translate(var(--cal-fw-dx), var(--cal-fw-dy)) scale(0.15); opacity: 0; }
}
@keyframes cal-firework-flash {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
  10% { opacity: 0.5; }
  40% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  [data-cal-fireworks] * { animation: none !important; opacity: 0 !important; }
}
`;

export function BookingFireworks() {
  const [showFireworks, setShowFireworks] = React.useState(true);
  const [primaryColor, setPrimaryColor] = React.useState("#22c55e");
  const [secondaryColor, setSecondaryColor] = React.useState("#3b82f6");
  const [accentColor, setAccentColor] = React.useState("#f59e0b");
  const [burstRadius, setBurstRadius] = React.useState(56);
  const [particleCount, setParticleCount] = React.useState(12);
  const [duration, setDuration] = React.useState(2.6);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="BookingFireworks-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.showFireworks === "boolean") setShowFireworks(p.showFireworks);
      if (typeof p.primaryColor === "string") setPrimaryColor(p.primaryColor);
      if (typeof p.secondaryColor === "string") setSecondaryColor(p.secondaryColor);
      if (typeof p.accentColor === "string") setAccentColor(p.accentColor);
      if (typeof p.burstRadius === "number") setBurstRadius(p.burstRadius);
      if (typeof p.particleCount === "number") setParticleCount(p.particleCount);
      if (typeof p.duration === "number") setDuration(p.duration);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const colors = [primaryColor, secondaryColor, accentColor];
  const count = Math.max(3, Math.round(particleCount));

  return (
    <div
      data-config-id="BookingFireworks-controls"
      data-cal-fireworks=""
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-64 overflow-hidden"
      style={{ visibility: showFireworks ? "visible" : "hidden" }}>
      <style>{KEYFRAMES}</style>
      {BURSTS.map((burst, burstIndex) => {
        const color = colors[burst.colorIndex];
        const radius = burstRadius * (burstIndex % 2 === 0 ? 1 : 0.8);
        return (
          <div
            key={burstIndex}
            className="absolute"
            style={{ left: `${burst.left}%`, top: `${burst.top}%` }}>
            <span
              className="absolute left-0 top-0 rounded-full"
              style={{
                width: radius * 1.6,
                height: radius * 1.6,
                background: `radial-gradient(circle, ${color}55 0%, transparent 70%)`,
                animation: `cal-firework-flash ${duration}s ease-out ${burst.delay}s infinite both`,
              }}
            />
            {Array.from({ length: count }).map((_, i) => {
              const angle = (i / count) * Math.PI * 2 + burstIndex * 0.4;
              const particleColor = i % 3 === 0 ? colors[(burst.colorIndex + 1) % 3] : color;
              return (
                <span
                  key={i}
                  className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full"
                  style={
                    {
                      backgroundColor: particleColor,
                      boxShadow: `0 0 6px ${particleColor}`,
                      "--cal-fw-dx": `${Math.cos(angle) * radius}px`,
                      "--cal-fw-dy": `${Math.sin(angle) * radius}px`,
                      animation: `cal-firework-particle ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${burst.delay}s infinite both`,
                    } as React.CSSProperties
                  }
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
