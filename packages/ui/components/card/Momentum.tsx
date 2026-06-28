import React from "react";

/**
 * Linear "Momentum" illustration — React port.
 * 15 isometric planks on a ground line whose heights form an exponential bell
 * around a travelling centre. The pointer drives the bell centre; a spotlight
 * brightness tracks it. At rest the bell sits on bar #4 (the static logo shape).
 */

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
  amp?: number;
  falloff?: number;
  centreLerp?: number;
  heightLerp?: number;
  faceColor?: string;
  strokeColor?: string;
}

export function Momentum({
  amp = 121.0,
  falloff = 0.6,
  centreLerp = 0.2,
  heightLerp = 0.22,
  faceColor = "#08090A",
  strokeColor = "#62666D",
}: MomentumProps) {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const groupsRef = React.useRef<
    { g: SVGGElement | null; face: SVGPathElement | null; edge: SVGPathElement | null }[]
  >([]);

  // animation params kept in a ref so the RAF loop reads fresh values without restarting
  const paramsRef = React.useRef({ amp, falloff, centreLerp, heightLerp });
  paramsRef.current = { amp, falloff, centreLerp, heightLerp };

  React.useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const height = rest.slice();
    let centre = 4;
    let targetCentre = 4;
    let hover = 0;
    let hoverTarget = 0;
    const V_LERP = 0.12;
    let raf = 0;

    const setPointer = (clientX: number, clientY: number) => {
      const r = svg.getBoundingClientRect();
      const mx = (clientX - r.left) * (272 / r.width);
      const my = (clientY - r.top) * (267 / r.height);
      const t = (mx - ORIGIN_X) * UX + (my - ORIGIN_Y) * UY;
      targetCentre = clamp(t / SPACING, 0, N - 1);
      hoverTarget = 1;
    };

    const onMove = (e: PointerEvent) => {
      const r = svg.getBoundingClientRect();
      const pad = 140;
      const out =
        e.clientX < r.left - pad ||
        e.clientX > r.right + pad ||
        e.clientY < r.top - pad ||
        e.clientY > r.bottom + pad;
      if (out) {
        hoverTarget = 0;
        return;
      }
      setPointer(e.clientX, e.clientY);
    };
    const onLeave = () => {
      hoverTarget = 0;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    svg.addEventListener("pointerleave", onLeave);

    const frame = () => {
      const { amp: A, falloff: K, centreLerp: C_LERP, heightLerp: H_LERP } = paramsRef.current;
      hover += (hoverTarget - hover) * V_LERP;
      const aim = hover > 0.001 ? targetCentre : 4;
      centre += (aim - centre) * C_LERP;

      for (let i = 0; i < N; i++) {
        const d = Math.abs(i - centre);
        const target = FLOOR + A * Math.pow(K, d);
        height[i] += (target - height[i]) * H_LERP;
        const H = height[i];
        const grp = groupsRef.current[i];
        if (!grp) continue;
        grp.face?.setAttribute("d", facePath(i, H));
        grp.edge?.setAttribute("d", edgePath(i, H));
        const spot = clamp(1.06 - 0.066 * d, 0.4, 1.0);
        const b = 1 - hover * (1 - spot);
        grp.g?.setAttribute("filter", `brightness(${Math.round(b * 1000) / 1000})`);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      svg.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      style={{
        display: "grid",
        width: "100%",
        height: 200,
        marginBottom: 24,
        justifyItems: "center",
        alignItems: "center",
        touchAction: "none",
      }}>
      <svg
        ref={svgRef}
        width="272"
        height="267"
        fill="none"
        viewBox="0 0 272 267"
        overflow="visible"
        style={{ overflow: "visible", display: "block", maxWidth: "100%", height: "auto" }}>
        {Array.from({ length: N }).map((_, i) => (
          <g
            key={i}
            ref={(g) => {
              groupsRef.current[i] = {
                g,
                face: g?.children[0] as SVGPathElement | null,
                edge: g?.children[1] as SVGPathElement | null,
              };
            }}
            strokeWidth="0.5"
            filter="brightness(1)">
            <path d={facePath(i, rest[i])} fill={faceColor} stroke={strokeColor} />
            <path d={edgePath(i, rest[i])} stroke="#2E2E32" strokeLinecap="round" />
          </g>
        ))}
      </svg>
    </div>
  );
}

export default Momentum;


