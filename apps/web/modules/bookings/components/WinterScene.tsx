import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";

/**
 * Snowy winter theme: re-maps the Cal design tokens to an icy blue / white palette
 * (scoped to this wrapper) and layers a gentle falling-snow animation behind the card.
 */
const winterTokens = {
  "--cal-bg": "hsla(0, 0%, 100%, 0.92)",
  "--cal-bg-muted": "hsla(205, 90%, 97%, 1)",
  "--cal-bg-subtle": "hsla(203, 80%, 94%, 1)",
  "--cal-bg-emphasis": "hsla(203, 70%, 88%, 1)",
  "--cal-bg-success": "hsla(200, 85%, 92%, 1)",
  "--cal-border": "hsla(203, 55%, 80%, 1)",
  "--cal-border-subtle": "hsla(203, 60%, 87%, 1)",
  "--cal-border-booker": "hsla(203, 60%, 82%, 1)",
  "--cal-text-emphasis": "hsla(212, 60%, 18%, 1)",
  "--cal-text": "hsla(210, 35%, 30%, 1)",
  "--cal-text-subtle": "hsla(207, 25%, 45%, 1)",
  "--cal-text-muted": "hsla(205, 25%, 58%, 1)",
} as CSSProperties;

const snowKeyframes = `
@keyframes winter-snow-fall {
  0% { transform: translate3d(0, -10vh, 0); }
  100% { transform: translate3d(0, 110vh, 0); }
}
@keyframes winter-snow-sway {
  0%, 100% { transform: translateX(-12px) rotate(0deg); }
  50% { transform: translateX(12px) rotate(180deg); }
}
[data-winter-content] [role="dialog"] {
  box-shadow: 0 10px 40px -12px hsla(205, 70%, 40%, 0.35);
  backdrop-filter: blur(4px);
}
@media (prefers-reduced-motion: reduce) {
  [data-winter-flake], [data-winter-flake] > * { animation: none !important; }
}
`;

// Deterministic pseudo-random so the layout is stable across renders.
const rand = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

function Snowflake({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round">
      <path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7" />
      <path d="M9.5 3.5L12 6l2.5-2.5M9.5 20.5L12 18l2.5 2.5" />
    </svg>
  );
}

export function WinterScene({ children }: { children: ReactNode }) {
  const [snowColor, setSnowColor] = useState("#ffffff");
  const [snowCount, setSnowCount] = useState(40);
  const [fallDuration, setFallDuration] = useState(14);
  const [flakeSize, setFlakeSize] = useState(14);
  const [snowOpacity, setSnowOpacity] = useState(0.9);

  // geneditor-listener-start
  useEffect(() => {
    const el = document.querySelector('[data-config-id="WinterSnow-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.snowColor === "string") setSnowColor(p.snowColor);
      if (typeof p.snowCount === "number") setSnowCount(p.snowCount);
      if (typeof p.fallDuration === "number") setFallDuration(p.fallDuration);
      if (typeof p.flakeSize === "number") setFlakeSize(p.flakeSize);
      if (typeof p.snowOpacity === "number") setSnowOpacity(p.snowOpacity);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const flakes = Array.from({ length: Math.max(0, Math.round(snowCount)) }, (_, i) => {
    const depth = 0.45 + rand(i + 1) * 0.55;
    return {
      left: rand(i + 101) * 100,
      size: Math.max(4, flakeSize * depth),
      duration: fallDuration / (0.6 + depth * 0.6),
      delay: -rand(i + 201) * fallDuration * 1.5,
      swayDuration: 3 + rand(i + 301) * 4,
      opacity: snowOpacity * (0.5 + depth * 0.5),
      dot: rand(i + 401) > 0.55,
    };
  });

  return (
    <div
      data-config-id="WinterSnow-controls"
      className="relative min-h-screen overflow-hidden"
      style={{
        ...winterTokens,
        background:
          "radial-gradient(ellipse at top, hsla(200, 90%, 92%, 1) 0%, hsla(205, 75%, 84%, 1) 45%, hsla(210, 60%, 74%, 1) 100%)",
      }}>
      <style>{snowKeyframes}</style>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        {flakes.map((f, i) => (
          <div
            key={i}
            data-winter-flake
            className="absolute top-0"
            style={{
              left: `${f.left}%`,
              opacity: f.opacity,
              animation: `winter-snow-fall ${f.duration}s linear ${f.delay}s infinite`,
            }}>
            <div style={{ animation: `winter-snow-sway ${f.swayDuration}s ease-in-out infinite` }}>
              {f.dot ? (
                <div
                  className="rounded-full"
                  style={{
                    width: f.size * 0.5,
                    height: f.size * 0.5,
                    background: snowColor,
                    boxShadow: `0 0 ${f.size * 0.5}px ${snowColor}`,
                  }}
                />
              ) : (
                <Snowflake size={f.size} color={snowColor} />
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Snowbank along the bottom edge */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 z-0 w-full"
        height="80"
        viewBox="0 0 1200 80"
        preserveAspectRatio="none">
        <path
          d="M0 50 C150 20 300 60 450 38 C600 16 750 58 900 34 C1030 16 1120 40 1200 30 L1200 80 L0 80 Z"
          fill="#ffffff"
          fillOpacity={0.9}
        />
      </svg>
      <div data-winter-content className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export default WinterScene;
