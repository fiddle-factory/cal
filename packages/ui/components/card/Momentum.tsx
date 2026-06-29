import React from "react";

// Linear "Momentum" illustration — ported from the Fiddle snip.
// 15 bars on a ground line; the pointer drives a travelling exponential bump,
// and a per-bar "spotlight" brightness tracks the bump centre while hovering.

const N = 15;

// Depth vector of every plank (viewBox units).
const DX = 115.686;
const DY = 57.843;

// Fixed base points (viewBox units).
const baseX = [
  137.044, 128.594, 120.144, 111.694, 103.244, 94.794, 86.344, 77.894, 69.444, 60.994, 52.544,
  44.094, 35.634, 27.184, 18.734,
];
const baseY = [
  128.197, 132.427, 136.647, 140.877, 145.097, 149.327, 153.547, 157.777, 161.997, 166.227, 170.447,
  174.677, 178.907, 183.127, 187.357,
];

// Rest heights (the static logo bell, peaked on bar #4).
const rest = [
  20.542, 34.083, 54.396, 81.479, 128.875, 81.479, 54.396, 34.083, 20.542, 13.771, 10.385, 8.693,
  7.846, 7.847, 7.847,
];

const FLOOR = 7.846;
const KBASE = 0.6;

const ORIGIN_X = baseX[0];
const ORIGIN_Y = baseY[0];
const dxL = baseX[N - 1] - baseX[0];
const dyL = baseY[N - 1] - baseY[0];
const LEN = Math.hypot(dxL, dyL);
const UX = dxL / LEN;
const UY = dyL / LEN;
const SPACING = LEN / (N - 1);

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const f = (n: number) => Math.round(n * 1000) / 1000;

function facePath(i: number, H: number) {
  const X = baseX[i];
  const YT = baseY[i] - H;
  return (
    `M${f(X)} ${f(YT)}a1.44 1.44 0 0 1 1.288 0l${f(DX)} ${f(DY)}` +
    `a3.13 3.13 0 0 1 1.73 2.8v${f(H)}a1.44 1.44 0 0 1-.796 1.288` +
    `l-1.69.845a1.44 1.44 0 0 1-1.288 0l-${f(DX)}-${f(DY)}` +
    `a3.13 3.13 0 0 1-1.73-2.8v-${f(H)}c0-.545.308-1.044.796-1.288z`
  );
}

function edgePath(i: number, H: number) {
  const X = baseX[i] + 0.645;
  const YT = baseY[i] - H + 2.778;
  return `M${f(X)} ${f(YT)}l113.061 56.531a3.38 3.38 0 0 1 1.868 3.023v${f(H - 2.336)}`;
}

export interface MomentumProps {
  glowColor?: string;
  glowIntensity?: number;
  amplitude?: number;
  className?: string;
}

export function Momentum({
  glowColor = "#62666d",
  glowIntensity = 0.6,
  amplitude = 121,
  className,
}: MomentumProps) {
  const svgRef = React.useRef<SVGSVGElement | null>(null);
  const faceRefs = React.useRef<(SVGPathElement | null)[]>([]);
  const edgeRefs = React.useRef<(SVGPathElement | null)[]>([]);
  const groupRefs = React.useRef<(SVGGElement | null)[]>([]);

  const heights = React.useRef<number[]>(rest.slice());
  const centre = React.useRef(4);
  const targetCentre = React.useRef(4);
  const hover = React.useRef(0);
  const hoverTarget = React.useRef(0);

  React.useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const C_LERP = 0.2;
    const H_LERP = 0.22;
    const V_LERP = 0.12;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      const svg = svgRef.current;
      if (!svg) return;
      const r = svg.getBoundingClientRect();
      const mx = (e.clientX - r.left) * (272 / r.width);
      const my = (e.clientY - r.top) * (267 / r.height);
      const t = (mx - ORIGIN_X) * UX + (my - ORIGIN_Y) * UY;
      targetCentre.current = clamp(t / SPACING, 0, N - 1);
      const pad = 140;
      const out =
        e.clientX < r.left - pad ||
        e.clientX > r.right + pad ||
        e.clientY < r.top - pad ||
        e.clientY > r.bottom + pad;
      hoverTarget.current = out ? 0 : 1;
    };
    const onLeave = () => {
      hoverTarget.current = 0;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    svgRef.current?.addEventListener("pointerleave", onLeave);

    function frame() {
      hover.current += (hoverTarget.current - hover.current) * V_LERP;
      const aim = hover.current > 0.001 ? targetCentre.current : 4;
      centre.current += (aim - centre.current) * C_LERP;

      for (let i = 0; i < N; i++) {
        const d = Math.abs(i - centre.current);
        const target = FLOOR + amplitude * Math.pow(KBASE, d);
        heights.current[i] += (target - heights.current[i]) * H_LERP;
        const H = heights.current[i];

        faceRefs.current[i]?.setAttribute("d", facePath(i, H));
        edgeRefs.current[i]?.setAttribute("d", edgePath(i, H));

        const spot = clamp(1.06 - 0.066 * d, 1 - glowIntensity, 1.0);
        const b = 1 - hover.current * (1 - spot);
        groupRefs.current[i]?.setAttribute("filter", `brightness(${Math.round(b * 1000) / 1000})`);
      }
      raf = requestAnimationFrame(frame);
    }

    if (!reduce) {
      raf = requestAnimationFrame(frame);
    } else {
      for (let i = 0; i < N; i++) {
        faceRefs.current[i]?.setAttribute("d", facePath(i, rest[i]));
        edgeRefs.current[i]?.setAttribute("d", edgePath(i, rest[i]));
      }
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [amplitude, glowIntensity]);

  return (
    <div className={className} style={{ touchAction: "none" }}>
      <svg
        ref={svgRef}
        width="272"
        height="267"
        fill="none"
        viewBox="0 0 272 267"
        overflow="visible"
        style={{ overflow: "visible", display: "block", maxWidth: "100%" }}>
        {Array.from({ length: N }).map((_, i) => (
          <g
            key={i}
            ref={(el) => {
              groupRefs.current[i] = el;
            }}
            strokeWidth="0.5"
            filter="brightness(1)"
            style={{ willChange: "filter" }}>
            <path
              ref={(el) => {
                faceRefs.current[i] = el;
              }}
              fill="#08090A"
              stroke={glowColor}
              d={facePath(i, rest[i])}
              style={{ willChange: "d" }}
            />
            <path
              ref={(el) => {
                edgeRefs.current[i] = el;
              }}
              stroke="#2E2E32"
              strokeLinecap="round"
              d={edgePath(i, rest[i])}
              style={{ willChange: "d" }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

export default Momentum;

