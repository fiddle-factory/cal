import * as React from "react";
import { useState } from "react";

const BURSTS = [
  { x: 14, y: 18 },
  { x: 86, y: 22 },
  { x: 50, y: 6 },
  { x: 20, y: 62 },
  { x: 80, y: 58 },
  { x: 32, y: 34 },
  { x: 68, y: 38 },
  { x: 12, y: 86 },
  { x: 88, y: 84 },
];

const KEYFRAMES = `
@keyframes booking-fireworks-particle {
  0% { transform: translate(-50%, -50%) translate(0, 0) scale(1); opacity: 0; }
  6% { opacity: 1; }
  65% { opacity: 1; }
  100% { transform: translate(-50%, -50%) translate(var(--fw-dx), var(--fw-dy)) scale(0.25); opacity: 0; }
}
@keyframes booking-fireworks-flash {
  0% { transform: translate(-50%, -50%) scale(0.2); opacity: 0; }
  8% { opacity: 0.9; }
  40% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  [data-booking-fireworks] { display: none; }
}
`;

type BookingConfirmationFireworksProps = {
  children: React.ReactNode;
};

export function BookingConfirmationFireworks({ children }: BookingConfirmationFireworksProps) {
  const [primaryColor, setPrimaryColor] = useState("#f59e0b");
  const [secondaryColor, setSecondaryColor] = useState("#ec4899");
  const [particleCount, setParticleCount] = useState(18);
  const [burstRadius, setBurstRadius] = useState(90);
  const [duration, setDuration] = useState(1.6);
  const [intensity, setIntensity] = useState(0.85);
  const [loop, setLoop] = useState(true);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="BookingConfirmationFireworks-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.primaryColor === "string") setPrimaryColor(p.primaryColor);
      if (typeof p.secondaryColor === "string") setSecondaryColor(p.secondaryColor);
      if (typeof p.particleCount === "number") setParticleCount(p.particleCount);
      if (typeof p.burstRadius === "number") setBurstRadius(p.burstRadius);
      if (typeof p.duration === "number") setDuration(p.duration);
      if (typeof p.intensity === "number") setIntensity(p.intensity);
      if (typeof p.loop === "boolean") setLoop(p.loop);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const count = Math.max(4, Math.round(particleCount));
  const replayKey = `${count}-${burstRadius}-${duration}-${loop}`;

  return (
    <div data-config-id="BookingConfirmationFireworks-controls" className="relative isolate min-h-screen">
      <style>{KEYFRAMES}</style>
      <div
        key={replayKey}
        data-booking-fireworks=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        style={{ opacity: intensity }}>
        {BURSTS.map((burst, burstIndex) => {
          const delay = 0.2 + burstIndex * duration * 0.38;
          const scale = 0.75 + ((burstIndex * 37) % 50) / 100;
          const iteration = loop ? "infinite" : 1;
          return (
            <div
              key={burstIndex}
              className="absolute"
              style={{ left: `${burst.x}%`, top: `${burst.y}%` }}>
              <span
                className="absolute block rounded-full"
                style={{
                  width: burstRadius * scale * 1.2,
                  height: burstRadius * scale * 1.2,
                  background: `radial-gradient(circle, ${primaryColor}55 0%, transparent 70%)`,
                  animation: `booking-fireworks-flash ${duration}s ease-out ${delay}s ${iteration} both`,
                }}
              />
              {Array.from({ length: count }).map((_, i) => {
                const angle = (i / count) * Math.PI * 2 + burstIndex * 0.4;
                const distance = burstRadius * scale * (0.8 + ((i * 53) % 40) / 100);
                const dx = Math.cos(angle) * distance;
                const dy = Math.sin(angle) * distance + burstRadius * 0.25;
                const color = (i + burstIndex) % 2 === 0 ? primaryColor : secondaryColor;
                return (
                  <span
                    key={i}
                    className="absolute block h-1.5 w-1.5 rounded-full"
                    style={
                      {
                        "--fw-dx": `${dx}px`,
                        "--fw-dy": `${dy}px`,
                        backgroundColor: color,
                        boxShadow: `0 0 6px 1px ${color}`,
                        animation: `booking-fireworks-particle ${duration}s cubic-bezier(0.15, 0.7, 0.3, 1) ${delay}s ${iteration} both`,
                      } as React.CSSProperties
                    }
                  />
                );
              })}
            </div>
          );
        })}
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
