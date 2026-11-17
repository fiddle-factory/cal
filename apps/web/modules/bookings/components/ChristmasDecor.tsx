import React from "react";

const GOLD = "#c9a24a";
const GOLD_LIGHT = "#f2d48a";
const CREAM = "#fbf5e8";
const BURGUNDY = "#7b1e2e";

/**
 * Cozy Christmas palette applied by overriding the design-system tokens
 * on the booking confirmation page wrapper.
 */
export const christmasThemeStyle = {
  "--cal-bg": "#fffcf5",
  "--cal-bg-muted": "#f8efdc",
  "--cal-bg-subtle": "#f3e7cc",
  "--cal-bg-emphasis": "#ecdcb6",
  "--cal-bg-success": "#f6e7bf",
  "--cal-border": "#e2cd9c",
  "--cal-border-subtle": "#ecdcb6",
  "--cal-border-booker": GOLD,
  "--cal-text-emphasis": BURGUNDY,
  "--cal-text": "#3f2e22",
  "--cal-text-subtle": "#7a6450",
  "--cal-text-muted": "#a48d72",
  "--cal-brand": BURGUNDY,
  "--cal-brand-emphasis": "#5e1522",
  "--cal-brand-text": CREAM,
  backgroundColor: CREAM,
  backgroundImage:
    "radial-gradient(ellipse at top, rgba(242, 212, 138, 0.35), transparent 60%), radial-gradient(ellipse at bottom, rgba(123, 30, 46, 0.06), transparent 55%)",
} as React.CSSProperties;

const BULB_COLORS = [GOLD_LIGHT, "#fff1cc", "#b0303f", "#e9a93f"];

/** A string of softly twinkling lights hung along the top of the page. */
export function ChristmasLights() {
  const [twinkleDuration, setTwinkleDuration] = React.useState(2.4);
  const [glowSize, setGlowSize] = React.useState(10);
  const [bulbCount, setBulbCount] = React.useState(18);
  const [wireColor, setWireColor] = React.useState("#6b5a3a");
  const [twinkle, setTwinkle] = React.useState(true);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="ChristmasLights-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.twinkleDuration === "number") setTwinkleDuration(p.twinkleDuration);
      if (typeof p.glowSize === "number") setGlowSize(p.glowSize);
      if (typeof p.bulbCount === "number") setBulbCount(p.bulbCount);
      if (typeof p.wireColor === "string") setWireColor(p.wireColor);
      if (typeof p.twinkle === "boolean") setTwinkle(p.twinkle);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const count = Math.max(2, Math.round(bulbCount));
  const width = 1000;
  const segment = width / count;
  let wirePath = "M0,4";
  for (let i = 0; i < count; i++) {
    wirePath += ` Q${(i + 0.5) * segment},20 ${(i + 1) * segment},4`;
  }

  return (
    <div
      data-config-id="ChristmasLights-controls"
      aria-hidden="true"
      className="pointer-events-none relative h-11 w-full overflow-hidden">
      <style>{`@keyframes cal-xmas-twinkle{0%,100%{opacity:1;filter:brightness(1.1)}50%{opacity:.45;filter:brightness(.8)}}`}</style>
      <svg
        className="absolute inset-x-0 top-0 h-6 w-full"
        viewBox={`0 0 ${width} 24`}
        preserveAspectRatio="none">
        <path d={wirePath} fill="none" stroke={wireColor} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      </svg>
      {Array.from({ length: count }).map((_, i) => {
        const color = BULB_COLORS[i % BULB_COLORS.length];
        return (
          <div
            key={i}
            className="absolute flex -translate-x-1/2 flex-col items-center"
            style={{ left: `${((i + 0.5) / count) * 100}%`, top: 10 }}>
            <span className="block h-1.5 w-1.5 rounded-[1px]" style={{ backgroundColor: GOLD }} />
            <span
              className="block h-3.5 w-2.5 rounded-full"
              style={{
                backgroundColor: color,
                boxShadow: `0 0 ${glowSize}px ${glowSize / 3}px ${color}`,
                animation: twinkle
                  ? `cal-xmas-twinkle ${twinkleDuration}s ease-in-out ${((i * 0.37) % 1) * twinkleDuration}s infinite`
                  : "none",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

/** Gift-ribbon accent: a burgundy ribbon with gold edging and a bow on the card's top-right corner. */
export function GiftRibbon() {
  const band = `linear-gradient(90deg, ${GOLD} 0 1px, ${BURGUNDY} 1px calc(100% - 1px), ${GOLD} calc(100% - 1px))`;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {/* horizontal ribbon along the top */}
      <div
        className="absolute inset-x-0 top-0 h-1.5"
        style={{
          backgroundImage: `linear-gradient(180deg, ${GOLD} 0 1px, ${BURGUNDY} 1px calc(100% - 1px), ${GOLD} calc(100% - 1px))`,
        }}
      />
      {/* vertical ribbon down the right edge */}
      <div className="absolute bottom-0 right-6 top-0 w-1.5" style={{ backgroundImage: band }} />
      {/* bow */}
      <svg className="absolute -top-1.5 right-0 h-9 w-14" viewBox="0 0 56 36">
        <path
          d="M28 10 C20 0 6 0 6 9 C6 17 18 17 28 12 Z"
          fill={BURGUNDY}
          stroke={GOLD}
          strokeWidth="1.2"
        />
        <path
          d="M28 10 C36 0 50 0 50 9 C50 17 38 17 28 12 Z"
          fill={BURGUNDY}
          stroke={GOLD}
          strokeWidth="1.2"
        />
        <path d="M27 12 L19 33 L23 30 L25 34 L28 13 Z" fill={BURGUNDY} stroke={GOLD} strokeWidth="1" />
        <path d="M29 12 L37 33 L33 30 L31 34 L28 13 Z" fill={BURGUNDY} stroke={GOLD} strokeWidth="1" />
        <circle cx="28" cy="11" r="3.6" fill={GOLD_LIGHT} stroke={GOLD} strokeWidth="1" />
      </svg>
    </div>
  );
}
