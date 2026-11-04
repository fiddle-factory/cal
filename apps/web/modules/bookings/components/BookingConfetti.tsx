import React from "react";

const CONFIG_ID = "BookingConfetti-controls";

// Deterministic pseudo-random so the burst looks the same on every render.
function seeded(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const KEYFRAMES = `
@keyframes fiddle-confetti-burst {
  0% { transform: translate3d(0, 0, 0) rotate(0deg) scale(0.4); opacity: 0; }
  6% { opacity: 1; }
  18% { transform: translate3d(var(--cf-dx), var(--cf-up), 0) rotate(calc(var(--cf-rot) * 0.25)) scale(1); }
  85% { opacity: 1; }
  100% { transform: translate3d(calc(var(--cf-dx) * 1.5 + var(--cf-sway)), 110vh, 0) rotate(var(--cf-rot)) scale(1); opacity: 0; }
}
@keyframes fiddle-confetti-flutter {
  0%, 100% { transform: rotateX(0deg); }
  50% { transform: rotateX(180deg); }
}
@media (prefers-reduced-motion: reduce) {
  .fiddle-confetti-piece { animation: none !important; opacity: 0 !important; }
}
`;

export function BookingConfetti({ children }: { children: React.ReactNode }) {
  const [pieceCount, setPieceCount] = React.useState(120);
  const [duration, setDuration] = React.useState(3.2);
  const [spread, setSpread] = React.useState(45);
  const [primaryColor, setPrimaryColor] = React.useState("#111827");
  const [accentColor, setAccentColor] = React.useState("#3b82f6");
  const [highlightColor, setHighlightColor] = React.useState("#f59e0b");
  const [loop, setLoop] = React.useState(false);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="BookingConfetti-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.pieceCount === "number") setPieceCount(p.pieceCount);
      if (typeof p.duration === "number") setDuration(p.duration);
      if (typeof p.spread === "number") setSpread(p.spread);
      if (typeof p.primaryColor === "string") setPrimaryColor(p.primaryColor);
      if (typeof p.accentColor === "string") setAccentColor(p.accentColor);
      if (typeof p.highlightColor === "string") setHighlightColor(p.highlightColor);
      if (typeof p.loop === "boolean") setLoop(p.loop);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const colors = [primaryColor, accentColor, highlightColor, "#10b981", "#ec4899"];

  const pieces = Array.from({ length: Math.max(0, Math.round(pieceCount)) }, (_, i) => {
    const angle = (seeded(i, 1) - 0.5) * 2; // -1..1
    const dx = angle * spread; // vw
    const up = -(10 + seeded(i, 2) * 25); // vh
    const sway = (seeded(i, 3) - 0.5) * 20; // vw
    const rot = (seeded(i, 4) - 0.5) * 1440;
    const delay = seeded(i, 5) * duration * 0.35;
    const pieceDuration = duration * (0.75 + seeded(i, 6) * 0.5);
    const w = 6 + seeded(i, 7) * 6;
    const isCircle = seeded(i, 8) > 0.75;
    const h = isCircle ? w : w * (1.4 + seeded(i, 9));
    return {
      key: i,
      style: {
        position: "absolute",
        left: "50%",
        top: "28%",
        width: `${w}px`,
        height: `${h}px`,
        opacity: 0,
        "--cf-dx": `${dx}vw`,
        "--cf-up": `${up}vh`,
        "--cf-sway": `${sway}vw`,
        "--cf-rot": `${rot}deg`,
        animation: `fiddle-confetti-burst ${pieceDuration}s cubic-bezier(0.2, 0.6, 0.4, 1) ${delay}s ${
          loop ? "infinite" : "1"
        } both`,
      } as React.CSSProperties,
      innerStyle: {
        width: "100%",
        height: "100%",
        backgroundColor: colors[i % colors.length],
        borderRadius: isCircle ? "9999px" : "2px",
        animation: `fiddle-confetti-flutter ${0.4 + seeded(i, 10) * 0.6}s linear infinite`,
      } as React.CSSProperties,
    };
  });

  return (
    <div data-config-id={CONFIG_ID} className="relative">
      <style>{KEYFRAMES}</style>
      {children}
      <div
        aria-hidden="true"
        // Remount on parameter change so the burst replays.
        key={`${pieceCount}-${duration}-${spread}-${loop}`}
        className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {pieces.map((p) => (
          <span key={p.key} className="fiddle-confetti-piece" style={p.style}>
            <span className="block" style={p.innerStyle} />
          </span>
        ))}
      </div>
    </div>
  );
}
