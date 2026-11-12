import { useLocale } from "@calcom/lib/hooks/useLocale";

const SILVER = "#E2E8F0";
const SILVER_DIM = "#CBD5E1";
const VIOLET_LIGHT = "#C4B5FD";
const VIOLET = "#A78BFA";

type BurstProps = {
  cx: number;
  cy: number;
  r: number;
  rays?: number;
  color: string;
  accent: string;
};

/** A firework burst: rays radiating from a center with sparkle dots at the tips. */
function Burst({ cx, cy, r, rays = 12, color, accent }: BurstProps) {
  const lines = Array.from({ length: rays }, (_, i) => {
    const angle = (i / rays) * Math.PI * 2;
    const inner = r * 0.35;
    return {
      x1: cx + Math.cos(angle) * inner,
      y1: cy + Math.sin(angle) * inner,
      x2: cx + Math.cos(angle) * r,
      y2: cy + Math.sin(angle) * r,
      dotX: cx + Math.cos(angle) * (r + 3),
      dotY: cy + Math.sin(angle) * (r + 3),
      alt: i % 2 === 0,
    };
  });
  return (
    <g>
      {lines.map((l, i) => (
        <g key={i}>
          <line
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke={l.alt ? color : accent}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          <circle cx={l.dotX} cy={l.dotY} r={l.alt ? 1.4 : 1} fill={l.alt ? color : accent} />
        </g>
      ))}
      <circle cx={cx} cy={cy} r={1.8} fill={color} />
    </g>
  );
}

/** Four-point sparkle star. */
function Sparkle({ x, y, size, color }: { x: number; y: number; size: number; color: string }) {
  const s = size;
  const w = size * 0.22;
  return (
    <path
      d={`M${x} ${y - s} L${x + w} ${y - w} L${x + s} ${y} L${x + w} ${y + w} L${x} ${y + s} L${x - w} ${y + w} L${x - s} ${y} L${x - w} ${y - w} Z`}
      fill={color}
    />
  );
}

/**
 * Seasonal "Happy New Year" header banner for the booking confirmation card.
 * Bleeds to the card edges (the card clips it to its rounded corners).
 */
export function NewYearBanner({ className }: { className?: string }) {
  const { t } = useLocale();
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-violet-950 via-violet-800 to-slate-700 ${
        className ?? ""
      }`}
      data-testid="new-year-banner">
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 560 112"
        preserveAspectRatio="xMidYMid slice">
        <Burst cx={58} cy={38} r={24} rays={14} color={SILVER} accent={VIOLET_LIGHT} />
        <Burst cx={128} cy={84} r={12} rays={10} color={VIOLET_LIGHT} accent={SILVER_DIM} />
        <Burst cx={440} cy={30} r={16} rays={12} color={VIOLET_LIGHT} accent={SILVER} />
        <Burst cx={505} cy={76} r={26} rays={16} color={SILVER} accent={VIOLET} />
        <Sparkle x={178} y={24} size={6} color={SILVER} />
        <Sparkle x={385} y={88} size={5} color={VIOLET_LIGHT} />
        <Sparkle x={24} y={90} size={4} color={VIOLET_LIGHT} />
        <Sparkle x={540} y={18} size={4} color={SILVER} />
        <Sparkle x={360} y={20} size={3} color={SILVER_DIM} />
        <Sparkle x={205} y={92} size={3} color={SILVER_DIM} />
        <circle cx={96} cy={16} r={1.2} fill={SILVER} />
        <circle cx={160} cy={56} r={1} fill={VIOLET_LIGHT} />
        <circle cx={410} cy={60} r={1.2} fill={SILVER} />
        <circle cx={470} cy={100} r={1} fill={VIOLET_LIGHT} />
      </svg>
      <div className="relative flex flex-col items-center justify-center px-8 py-7 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-violet-200">
          {t("new_year_banner_eyebrow")}
        </p>
        <p className="font-heading mt-1 text-2xl font-semibold leading-7 text-white">
          {t("happy_new_year")}
        </p>
        <div aria-hidden="true" className="mt-3 h-px w-16 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>
    </div>
  );
}

export default NewYearBanner;
