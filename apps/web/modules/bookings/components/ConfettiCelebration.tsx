import type { CSSProperties } from "react";
import { useMemo } from "react";

// Saturated design-system visualization tokens (packages/config/theme/tokens.css)
const CONFETTI_COLORS = [
  "var(--cal-bg-visualization-1-emphasis, #ec4899)",
  "var(--cal-bg-visualization-2-emphasis, #7c3aed)",
  "var(--cal-bg-visualization-3-emphasis, #4256ff)",
  "var(--cal-bg-visualization-4-emphasis, #19a974)",
  "var(--cal-bg-visualization-5-emphasis, #e8b30b)",
  "var(--cal-bg-visualization-6-emphasis, #f97316)",
  "var(--cal-bg-visualization-7-emphasis, #ef4444)",
];

const KEYFRAMES = `
@keyframes cal-confetti-burst {
  0% { transform: translate3d(0, 0, 0) rotate(0deg) scale(0.6); opacity: 0; }
  6% { opacity: 1; }
  22% { transform: translate3d(calc(var(--confetti-dx) * 0.6), var(--confetti-rise), 0) rotate(calc(var(--confetti-rot) * 0.3)) scale(1); }
  85% { opacity: 1; }
  100% { transform: translate3d(var(--confetti-dx), 105vh, 0) rotate(var(--confetti-rot)) scale(1); opacity: 0; }
}
@keyframes cal-confetti-flutter {
  0%, 100% { transform: rotateY(0deg); }
  50% { transform: rotateY(180deg); }
}
`;

// Deterministic pseudo-random so server and client render the same pieces
function seeded(index: number, salt: number) {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export interface ConfettiCelebrationProps {
  pieceCount: number;
  /** Seconds for a piece to fall out of view */
  duration: number;
  /** Max horizontal spread in px */
  spread: number;
  /** Base piece size in px */
  pieceSize: number;
}

export function ConfettiCelebration({ pieceCount, duration, spread, pieceSize }: ConfettiCelebrationProps) {
  const pieces = useMemo(
    () =>
      Array.from({ length: Math.max(0, Math.round(pieceCount)) }, (_, i) => {
        const dx = (seeded(i, 1) * 2 - 1) * spread;
        const rise = -(80 + seeded(i, 2) * 220);
        const rot = (seeded(i, 3) * 2 - 1) * 900;
        const size = pieceSize * (0.7 + seeded(i, 4) * 0.6);
        const isCircle = seeded(i, 5) > 0.7;
        return {
          id: i,
          dx,
          rise,
          rot,
          width: size,
          height: isCircle ? size : size * 0.45,
          radius: isCircle ? "9999px" : "2px",
          color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          delay: seeded(i, 6) * 0.35,
          pieceDuration: duration * (0.75 + seeded(i, 7) * 0.5),
          flutter: 0.4 + seeded(i, 8) * 0.6,
        };
      }),
    [pieceCount, duration, spread, pieceSize]
  );

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden motion-reduce:hidden"
      aria-hidden="true">
      <style>{KEYFRAMES}</style>
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="absolute left-1/2 top-[22%] block"
          style={
            {
              "--confetti-dx": `${piece.dx}px`,
              "--confetti-rise": `${piece.rise}px`,
              "--confetti-rot": `${piece.rot}deg`,
              animation: `cal-confetti-burst ${piece.pieceDuration}s cubic-bezier(0.2, 0.6, 0.4, 1) ${piece.delay}s both`,
            } as CSSProperties
          }>
          <span
            className="block"
            style={{
              width: piece.width,
              height: piece.height,
              borderRadius: piece.radius,
              backgroundColor: piece.color,
              animation: `cal-confetti-flutter ${piece.flutter}s linear infinite`,
            }}
          />
        </span>
      ))}
    </div>
  );
}
