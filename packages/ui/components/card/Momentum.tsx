import React from "react";

// Linear "Momentum" illustration — a pointer-driven bell of 15 SVG "planks".
// Ported from the reference behaviour: each bar grows up from a fixed base
// point, heights form an exponential bell around the pointer projection, and a
// spotlight brightness tracks the bell centre while hovering.

const N = 15;
const DX = 115.686;
const DY = 57.843;

const baseX = [
  137.044, 128.594, 120.144, 111.694, 103.244, 94.794, 86.344, 77.894, 69.444, 60.994, 52.544,
  44.094, 35.634, 27.184, 18.734,
];
const baseY = [
  128.197, 132.427, 136.647, 140.877, 145.097, 149.327, 153.547, 157.777, 161.997, 166.227, 170.447,
  174.677, 178.907, 183.127, 187.357,
];
const rest = [
  20.542, 34.083, 54.396, 81.479, 128.875, 81.479, 54.396, 34.083, 20.542, 13.771, 10.385, 8.693,
  7.846, 7.847, 7.847,
];

const FLOOR = 7.846;
const AMP = 121.0;
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
  configId?: string;
  width?: number;
  height?: number;
  faceColor?: string;
  faceStroke?: string;
  edgeStroke?: string;
  amplitude?: number;
  falloff?: number;
  centerLerp?: number;
  heightLerp?: number;
}

export function Momentum({
  configId,
  width = 272,
  height = 267,
  faceColor = "#08090A",
  faceStroke = "#62666D",
  edgeStroke = "#2E2E32",
  amplitude = AMP,
  falloff = KBASE,
  centerLerp = 0.2,
  heightLerp = 0.22,
}: MomentumProps) {
  const svgRef = React.useRef<SVGSVGElement | null>(null);
  const faceRefs = React.useRef<(SVGPathElement | null)[]>([]);
  const edgeRefs = React.useRef<(SVGPathElement | null)[]>([]);
  const groupRefs = React.useRef<(SVGGElement | null)[]>([]);

  const state = React.useRef({
    height: rest.slice(),
    centre: 4,
    targetCentre: 4,
    hover: 0,
    hoverTarget: 0,
    amplitude,
    falloff,
    centerLerp,
    heightLerp,
  });

  // keep tunables live without restarting the loop
  state.current.amplitude = amplitude;
  state.current.falloff = falloff;
  state.current.centerLerp = centerLerp;
  state.current.heightLerp = heightLerp;

  React.useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const s = state.current;

    const setPointer = (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return;
      const r = svg.getBoundingClientRect();
      const mx = (clientX - r.left) * (272 / r.width);
      const my = (clientY - r.top) * (267 / r.height);
      const t = (mx - ORIGIN_X) * UX + (my - ORIGIN_Y) * UY;
      s.targetCentre = clamp(t / SPACING, 0, N - 1);
      s.hoverTarget = 1;
    };

    const onMove = (e: PointerEvent) => {
      setPointer(e.clientX, e.clientY);
      const svg = svgRef.current;
      if (!svg) return;
      const r = svg.getBoundingClientRect();
      const pad = 140;
      const out =
        e.clientX < r.left - pad ||
        e.clientX > r.right + pad ||
        e.clientY < r.top - pad ||
        e.clientY > r.bottom + pad;
      if (out) s.hoverTarget = 0;
    };
    const onLeave = () => {
      s.hoverTarget = 0;
    };

    let raf = 0;
    const frame = () => {
      s.hover += (s.hoverTarget - s.hover) * 0.12;
      const aim = s.hover > 0.001 ? s.targetCentre : 4;
      s.centre += (aim - s.centre) * s.centerLerp;

      for (let i = 0; i < N; i++) {
        const d = Math.abs(i - s.centre);
        const target = FLOOR + s.amplitude * Math.pow(s.falloff, d);
        s.height[i] += (target - s.height[i]) * s.heightLerp;
        const H = s.height[i];
        faceRefs.current[i]?.setAttribute("d", facePath(i, H));
        edgeRefs.current[i]?.setAttribute("d", edgePath(i, H));
        const spot = clamp(1.06 - 0.066 * d, 0.4, 1.0);
        const b = 1 - s.hover * (1 - spot);
        groupRefs.current[i]?.setAttribute("filter", `brightness(${Math.round(b * 1000) / 1000})`);
      }
      raf = requestAnimationFrame(frame);
    };

    // initialise static shape
    for (let i = 0; i < N; i++) {
      faceRefs.current[i]?.setAttribute("d", facePath(i, rest[i]));
      edgeRefs.current[i]?.setAttribute("d", edgePath(i, rest[i]));
    }

    if (!reduce) {
      window.addEventListener("pointermove", onMove, { passive: true });
      svgRef.current?.addEventListener("pointerleave", onLeave);
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      svgRef.current?.removeEventListener("pointerleave", onLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      data-config-id={configId}
      style={{
        display: "grid",
        width,
        height,
        justifyItems: "center",
        alignItems: "center",
        touchAction: "none",
      }}>
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        width="272"
        height="267"
        fill="none"
        viewBox="0 0 272 267"
        overflow="visible"
        style={{ overflow: "visible", display: "block" }}>
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
              fill={faceColor}
              stroke={faceStroke}
              style={{ willChange: "d" }}
            />
            <path
              ref={(el) => {
                edgeRefs.current[i] = el;
              }}
              stroke={edgeStroke}
              strokeLinecap="round"
              style={{ willChange: "d" }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

export default Momentum;

