import React from "react";

type Burst = { left: number; top: number; delay: number; scale: number };

// Burst positions (percent of the container) placed around the card so the card content stays clear.
const BURSTS: Burst[] = [
  { left: 12, top: 18, delay: 0, scale: 1 },
  { left: 86, top: 14, delay: 0.35, scale: 0.9 },
  { left: 22, top: 62, delay: 0.8, scale: 0.8 },
  { left: 80, top: 58, delay: 1.1, scale: 1 },
  { left: 50, top: 6, delay: 1.5, scale: 0.75 },
  { left: 6, top: 40, delay: 1.9, scale: 0.7 },
  { left: 94, top: 36, delay: 2.2, scale: 0.75 },
];

const KEYFRAMES = `
@keyframes cal-firework-particle {
  0% { transform: rotate(var(--fw-angle)) translateY(0) scale(1); opacity: 0; }
  8% { opacity: 1; }
  65% { opacity: 1; }
  100% { transform: rotate(var(--fw-angle)) translateY(calc(var(--fw-distance) * -1)) scale(0.2); opacity: 0; }
}
@keyframes cal-firework-flash {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
  10% { transform: translate(-50%, -50%) scale(1); opacity: 0.9; }
  40% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
  100% { opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .cal-firework-particle, .cal-firework-flash { animation: none !important; opacity: 0 !important; }
}
`;

export function BookingFireworks() {
  const [primaryColor, setPrimaryColor] = React.useState("#22c55e");
  const [secondaryColor, setSecondaryColor] = React.useState("#3b82f6");
  const [accentColor, setAccentColor] = React.useState("#f59e0b");
  const [burstDuration, setBurstDuration] = React.useState(1.6);
  const [particleCount, setParticleCount] = React.useState(14);
  const [burstSize, setBurstSize] = React.useState(90);
  const [loop, setLoop] = React.useState(true);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="BookingFireworks-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.primaryColor === "string") setPrimaryColor(p.primaryColor);
      if (typeof p.secondaryColor === "string") setSecondaryColor(p.secondaryColor);
      if (typeof p.accentColor === "string") setAccentColor(p.accentColor);
      if (typeof p.burstDuration === "number") setBurstDuration(p.burstDuration);
      if (typeof p.particleCount === "number") setParticleCount(p.particleCount);
      if (typeof p.burstSize === "number") setBurstSize(p.burstSize);
      if (typeof p.loop === "boolean") setLoop(p.loop);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const colors = [primaryColor, secondaryColor, accentColor];
  const count = Math.max(1, Math.round(particleCount));
  const iteration = loop ? "infinite" : "1";

  return (
    <div
      data-config-id="BookingFireworks-controls"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden">
      <style>{KEYFRAMES}</style>
      {BURSTS.map((burst, burstIndex) => {
        const color = colors[burstIndex % colors.length];
        const distance = burstSize * burst.scale;
        return (
          <div
            key={`${burst.left}-${burst.top}`}
            className="absolute"
            style={{ left: `${burst.left}%`, top: `${burst.top}%`, width: 0, height: 0 }}>
            <span
              className="cal-firework-flash absolute left-0 top-0 rounded-full"
              style={{
                width: distance * 0.35,
                height: distance * 0.35,
                background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                opacity: 0,
                animation: `cal-firework-flash ${burstDuration}s ease-out ${burst.delay}s ${iteration} both`,
              }}
            />
            {Array.from({ length: count }).map((_, i) => {
              const particleColor = i % 3 === 0 ? colors[(burstIndex + 1) % colors.length] : color;
              return (
                <span
                  key={i}
                  className="cal-firework-particle absolute rounded-full"
                  style={
                    {
                      left: -2,
                      top: -2,
                      width: 4,
                      height: 10,
                      backgroundColor: particleColor,
                      boxShadow: `0 0 6px ${particleColor}`,
                      opacity: 0,
                      "--fw-angle": `${(360 / count) * i}deg`,
                      "--fw-distance": `${distance}px`,
                      animation: `cal-firework-particle ${burstDuration}s cubic-bezier(0.15, 0.6, 0.3, 1) ${burst.delay}s ${iteration} both`,
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
