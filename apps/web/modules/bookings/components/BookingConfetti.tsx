import * as React from "react";

const CONFIG_ID = "BookingConfetti-controls";

// Deterministic pseudo-random so the burst is stable between renders.
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function BookingConfetti() {
  const [pieceCount, setPieceCount] = React.useState(80);
  const [duration, setDuration] = React.useState(2800);
  const [spread, setSpread] = React.useState(260);
  const [primaryColor, setPrimaryColor] = React.useState("#3b82f6");
  const [secondaryColor, setSecondaryColor] = React.useState("#22c55e");
  const [accentColor, setAccentColor] = React.useState("#f59e0b");
  const [loop, setLoop] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);

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
      if (typeof p.secondaryColor === "string") setSecondaryColor(p.secondaryColor);
      if (typeof p.accentColor === "string") setAccentColor(p.accentColor);
      if (typeof p.loop === "boolean") setLoop(p.loop);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const colors = [primaryColor, secondaryColor, accentColor];
  const pieces = React.useMemo(() => {
    const rand = seeded(42);
    return Array.from({ length: Math.max(0, Math.round(pieceCount)) }, (_, i) => ({
      id: i,
      dx: (rand() * 2 - 1) * spread,
      rise: 60 + rand() * 120,
      rotate: (rand() * 2 - 1) * 720,
      delay: rand() * 250,
      width: 6 + rand() * 4,
      height: 8 + rand() * 8,
      round: rand() > 0.7,
      colorIndex: i % 3,
    }));
  }, [pieceCount, spread]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof container.animate !== "function") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const fall = container.clientHeight * 0.85;
    const animations: Animation[] = [];
    container.querySelectorAll<HTMLElement>("[data-confetti-piece]").forEach((node, i) => {
      const piece = pieces[i];
      if (!piece) return;
      animations.push(
        node.animate(
          [
            { transform: "translate(0px, 0px) rotate(0deg) scale(0.4)", opacity: 0, offset: 0 },
            {
              transform: `translate(${piece.dx * 0.6}px, ${-piece.rise}px) rotate(${piece.rotate * 0.3}deg) scale(1)`,
              opacity: 1,
              offset: 0.22,
              easing: "cubic-bezier(0.4, 0, 1, 1)",
            },
            { opacity: 1, offset: 0.75 },
            {
              transform: `translate(${piece.dx}px, ${fall}px) rotate(${piece.rotate}deg) scale(1)`,
              opacity: 0,
              offset: 1,
            },
          ],
          {
            duration,
            delay: piece.delay,
            easing: "cubic-bezier(0.2, 0.8, 0.4, 1)",
            fill: "both",
            iterations: loop ? Infinity : 1,
          }
        )
      );
    });
    return () => animations.forEach((a) => a.cancel());
  }, [pieces, duration, loop]);

  return (
    <div
      ref={containerRef}
      data-config-id={CONFIG_ID}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          data-confetti-piece=""
          className="absolute left-1/2 top-[15%] block opacity-0"
          style={{
            width: piece.width,
            height: piece.round ? piece.width : piece.height,
            marginLeft: -piece.width / 2,
            borderRadius: piece.round ? "9999px" : "2px",
            backgroundColor: colors[piece.colorIndex],
          }}
        />
      ))}
    </div>
  );
}
