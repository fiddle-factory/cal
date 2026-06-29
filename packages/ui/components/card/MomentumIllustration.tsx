import React from "react";

// Linear "Momentum" illustration — ported from the Fiddle snip reconstruction.
// 15 thin parallelogram "planks" sit on a ground line; their heights form an
// exponential bell that follows the pointer, with a brightness "spotlight"
// tracking the bell centre while hovering. At rest the bell sits on bar #4.

const N = 15;

// Depth vector of every plank (viewBox units).
const DX = 115.686;
const DY = 57.843;

// Fixed base points; baseY = M.y + restHeight (the invariant planks grow up from).
const baseX = [
  137.044, 128.594, 120.144, 111.694, 103.244, 94.794, 86.344, 77.894, 69.444, 60.994, 52.544,
  44.094, 35.634, 27.184, 18.734,
];
const baseY = [
  128.197, 132.427, 136.647, 140.877, 145.097, 149.327, 153.547, 157.777, 161.997, 166.227,
  170.447, 174.677, 178.907, 183.127, 187.357,
];

// Rest heights (the static logo bell, peaked on bar #4).
const rest = [
  20.542, 34.083, 54.396, 81.479, 128.875, 81.479, 54.396, 34.083, 20.542, 13.771, 10.385, 8.693,
  7.846, 7.847, 7.847,
];

const FLOOR = 7.846; // minimum plank thickness

// Projection of the pointer onto the ground line (bar0 -> bar14).
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

export interface MomentumIllustrationProps {
  amp?: number; // bump amplitude (FLOOR + amp ~= peak)
  falloff?: number; // exponential bell falloff per bar
  faceColor?: string;
  edgeColor?: string;
  className?: string;
}

export function MomentumIllustration({
  amp = 121,
  falloff = 0.6,
  faceColor = "#62666D",
  edgeColor = "#2E2E32",
  className,
}: MomentumIllustrationProps) {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const groupRefs = React.useRef<Array<{ g: SVGGElement | null; face: SVGPathElement | null; edge: SVGPathElement | null }>>(
    Array.from({ length: N }, () => ({ g: null, face: null, edge: null }))
  );

  // animation state held in refs so the RAF loop doesn't re-create
  const height = React.useRef(rest.slice());
  const centre = React.useRef(4);
  const targetCentre = React.useRef(4);
  const hover = React.useRef(0);
  const hoverTarget = React.useRef(0);
  const reduced = React.useRef(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced.current = mq.matches;
    const onChange = () => {
      reduced.current = mq.matches;
    };
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  React.useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const setPointer = (clientX: number, clientY: number) => {
      const r = svg.getBoundingClientRect();
      const mx = ((clientX - r.left) * 272) / r.width;
      const my = ((clientY - r.top) * 267) / r.height;
      const t = (mx - ORIGIN_X) * UX + (my - ORIGIN_Y) * UY;
      targetCentre.current = clamp(t / SPACING, 0, N - 1);
      hoverTarget.current = 1;
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
        hoverTarget.current = 0;
        return;
      }
      setPointer(e.clientX, e.clientY);
    };
    const onLeave = () => {
      hoverTarget.current = 0;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    svg.addEventListener("pointerleave", onLeave);

    const C_LERP = 0.2;
    const H_LERP = 0.22;
    const V_LERP = 0.12;
    let raf = 0;

    const frame = () => {
      if (reduced.current) {
        // snap to the static rest bell, no spotlight
        for (let i = 0; i < N; i++) {
          const H = rest[i];
          groupRefs.current[i].face?.setAttribute("d", facePath(i, H));
          groupRefs.current[i].edge?.setAttribute("d", edgePath(i, H));
          groupRefs.current[i].g?.setAttribute("filter", "brightness(1)");
        }
        return;
      }

      hover.current += (hoverTarget.current - hover.current) * V_LERP;
      const aim = hover.current > 0.001 ? targetCentre.current : 4;
      centre.current += (aim - centre.current) * C_LERP;

      for (let i = 0; i < N; i++) {
        const d = Math.abs(i - centre.current);
        const target = FLOOR + amp * Math.pow(falloff, d);
        height.current[i] += (target - height.current[i]) * H_LERP;
        const H = height.current[i];

        groupRefs.current[i].face?.setAttribute("d", facePath(i, H));
        groupRefs.current[i].edge?.setAttribute("d", edgePath(i, H));

        const spot = clamp(1.06 - 0.066 * d, 0.4, 1.0);
        const b = 1 - hover.current * (1 - spot);
        groupRefs.current[i].g?.setAttribute("filter", `brightness(${Math.round(b * 1000) / 1000})`);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      svg.removeEventListener("pointerleave", onLeave);
    };
  }, [amp, falloff]);

  return (
    <div
      className={className}
      style={{
        display: "grid",
        width: 340,
        height: 289,
        maxWidth: "100%",
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
        style={{ overflow: "visible", display: "block", maxWidth: "100%" }}>
        {Array.from({ length: N }, (_, i) => (
          <g
            key={i}
            strokeWidth="0.5"
            filter="brightness(1)"
            style={{ willChange: "filter" }}
            ref={(el) => {
              groupRefs.current[i].g = el;
            }}>
            <path
              fill="#08090A"
              stroke={faceColor}
              style={{ willChange: "d" }}
              ref={(el) => {
                groupRefs.current[i].face = el;
              }}
              d={facePath(i, rest[i])}
            />
            <path
              stroke={edgeColor}
              strokeLinecap="round"
              style={{ willChange: "d" }}
              ref={(el) => {
                groupRefs.current[i].edge = el;
              }}
              d={edgePath(i, rest[i])}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

export default MomentumIllustration;

