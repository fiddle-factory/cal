export const CHRISTMAS_GREEN = "#14532D";
export const CHRISTMAS_GREEN_DEEP = "#0B3B22";
export const CHRISTMAS_GOLD = "#C9A227";
export const CHRISTMAS_GOLD_LIGHT = "#E8C766";
const CHRISTMAS_RED = "#B91C1C";

type Ornament = {
  x: number;
  drop: number;
  r: number;
  color: string;
  stripe?: string;
};

const ORNAMENTS: Ornament[] = [
  { x: 34, drop: 30, r: 9, color: CHRISTMAS_RED, stripe: CHRISTMAS_GOLD_LIGHT },
  { x: 78, drop: 52, r: 11, color: CHRISTMAS_GOLD },
  { x: 122, drop: 24, r: 7, color: "#E5E7EB" },
  { x: 476, drop: 26, r: 7, color: "#E5E7EB" },
  { x: 520, drop: 50, r: 11, color: CHRISTMAS_GOLD, stripe: CHRISTMAS_RED },
  { x: 564, drop: 32, r: 9, color: CHRISTMAS_RED },
];

const SNOW: Array<[number, number, number]> = [
  [160, 22, 1.4],
  [210, 96, 1.2],
  [250, 14, 1],
  [352, 18, 1.2],
  [400, 92, 1.4],
  [440, 20, 1],
  [24, 104, 1.2],
  [586, 100, 1.2],
  [300, 108, 1],
];

const Star = ({ cx, cy, size, fill }: { cx: number; cy: number; size: number; fill: string }) => (
  <path
    d={`M${cx} ${cy - size} L${cx + size * 0.28} ${cy - size * 0.28} L${cx + size} ${cy} L${cx + size * 0.28} ${
      cy + size * 0.28
    } L${cx} ${cy + size} L${cx - size * 0.28} ${cy + size * 0.28} L${cx - size} ${cy} L${cx - size * 0.28} ${
      cy - size * 0.28
    } Z`}
    fill={fill}
  />
);

export const ChristmasBanner = ({ title }: { title: string }) => (
  <div
    className="relative -mx-8 -mt-5 mb-8 h-32 overflow-hidden sm:-mt-8"
    style={{
      background: `linear-gradient(180deg, ${CHRISTMAS_GREEN} 0%, ${CHRISTMAS_GREEN_DEEP} 100%)`,
      borderBottom: `3px solid ${CHRISTMAS_GOLD}`,
    }}>
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 600 128"
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true">
      {/* Garland */}
      <path
        d="M0 6 Q75 26 150 6 T300 6 T450 6 T600 6"
        fill="none"
        stroke={CHRISTMAS_GOLD}
        strokeWidth="2"
        strokeDasharray="1 5"
        strokeLinecap="round"
      />
      {SNOW.map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="#FFFFFF" opacity="0.7" />
      ))}
      <Star cx={190} cy={40} size={5} fill={CHRISTMAS_GOLD_LIGHT} />
      <Star cx={418} cy={52} size={4} fill={CHRISTMAS_GOLD_LIGHT} />
      <Star cx={268} cy={92} size={3} fill="#FFFFFF" />
      {/* Hanging ornaments */}
      {ORNAMENTS.map(({ x, drop, r, color, stripe }) => (
        <g key={x}>
          <line x1={x} y1={0} x2={x} y2={drop} stroke={CHRISTMAS_GOLD_LIGHT} strokeWidth="1" />
          <rect x={x - r * 0.35} y={drop} width={r * 0.7} height={r * 0.45} rx="1" fill={CHRISTMAS_GOLD} />
          <circle cx={x} cy={drop + r * 0.45 + r} r={r} fill={color} />
          {stripe && (
            <ellipse cx={x} cy={drop + r * 0.45 + r} rx={r * 0.98} ry={r * 0.24} fill={stripe} />
          )}
          <circle cx={x - r * 0.35} cy={drop + r * 0.45 + r * 0.6} r={r * 0.25} fill="#FFFFFF" opacity="0.55" />
        </g>
      ))}
    </svg>
    <div className="relative flex h-full flex-col items-center justify-center text-center">
      <span className="text-xs font-medium uppercase tracking-widest" style={{ color: CHRISTMAS_GOLD_LIGHT }}>
        ✦ ✦ ✦
      </span>
      <p className="font-heading mt-1 text-3xl font-semibold text-white">{title}</p>
    </div>
  </div>
);

export default ChristmasBanner;
