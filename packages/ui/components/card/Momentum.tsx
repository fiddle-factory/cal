import React from "react";

// Linear "Momentum" illustration — ported from the reference interactive source.
// 15 thin parallelogram "planks" sit on a ground line; pointer drives a travelling
// exponential bump across the bars plus a brightness spotlight that tracks the centre.

const N = 15;
const DX = 115.686;
const DY = 57.843;

const baseX = [
  137.044, 128.594, 120.144, 111.694, 103.244, 94.794, 86.344, 77.894, 69.444, 60.994, 52.544,
  44.094, 35.634, 27.184, 18.734,
];
const baseY = [
  128.197, 132.427, 136.647, 140.877, 145.097, 149.327, 153.547, 157.777, 161.997, 166.227,
  170.447, 174.677, 178.907, 183.127, 187.357,
];
const rest = [
  20.542, 34.083, 54.396, 81.479, 128.875, 81.479, 54.396, 34.083, 20.542, 13.771, 10.385, 8.693,
  7.846, 7.847, 7.847,
];

const FLOOR = 7.846;
const AMP = 121.0;

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

const BASE_RGB = [8, 9, 10]; // #08090A
const hexToRgb = (hex: string) => {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
};
const mixToHex = (rgb: number[], t: number) => {
  const r = Math.round(BASE_RGB[0] + (rgb[0] - BASE_RGB[0]) * t);
  const g = Math.round(BASE_RGB[1] + (rgb[1] - BASE_RGB[1]) * t);
  const b = Math.round(BASE_RGB[2] + (rgb[2] - BASE_RGB[2]) * t);
  return `#${[r, g, b].map((v) => clamp(v, 0, 255).toString(16).padStart(2, "0")).join("")}`;
};

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

export function Momentum() {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const groupRefs = React.useRef<Array<{ g: SVGGElement; face: SVGPathElement; edge: SVGPathElement }>>(
    []
  );

  // tunable values (genEditor-controlled)
  const [barColor, setBarColor] = React.useState("#62666d");
  const [glowColor, setGlowColor] = React.useState("#62666d");
  const [spotlight, setSpotlight] = React.useState(0.066);
  const [falloff, setFalloff] = React.useState(0.6);
  const [spotlightColor, setSpotlightColor] = React.useState("#ec4899");

  // animation state (mutable refs so the RAF loop doesn't re-render React)
  const heightRef = React.useRef<number[]>(rest.slice());
  const centreRef = React.useRef(4);
  const targetCentreRef = React.useRef(4);
  const hoverRef = React.useRef(0);
  const hoverTargetRef = React.useRef(0);
  const spotlightRef = React.useRef(spotlight);
  const falloffRef = React.useRef(falloff);
  const spotlightColorRef = React.useRef(spotlightColor);
  spotlightRef.current = spotlight;
  falloffRef.current = falloff;
  spotlightColorRef.current = spotlightColor;

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="Card-div-0"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.barColor === "string") setBarColor(p.barColor);
      if (typeof p.glowColor === "string") setGlowColor(p.glowColor);
      if (typeof p.spotlight === "number") setSpotlight(p.spotlight);
      if (typeof p.falloff === "number") setFalloff(p.falloff);
      if (typeof p.spotlightColor === "string") setSpotlightColor(p.spotlightColor);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  React.useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const C_LERP = 0.2;
    const H_LERP = 0.22;
    const V_LERP = 0.12;

    const setPointer = (clientX: number, clientY: number) => {
      const r = svg.getBoundingClientRect();
      const mx = (clientX - r.left) * (272 / r.width);
      const my = (clientY - r.top) * (267 / r.height);
      const t = (mx - ORIGIN_X) * UX + (my - ORIGIN_Y) * UY;
      targetCentreRef.current = clamp(t / SPACING, 0, N - 1);
      hoverTargetRef.current = 1;
    };

    const onMove = (e: PointerEvent) => {
      setPointer(e.clientX, e.clientY);
      const r = svg.getBoundingClientRect();
      const pad = 140;
      const out =
        e.clientX < r.left - pad ||
        e.clientX > r.right + pad ||
        e.clientY < r.top - pad ||
        e.clientY > r.bottom + pad;
      if (out) hoverTargetRef.current = 0;
    };
    const onLeave = () => {
      hoverTargetRef.current = 0;
    };

    if (!reduce) {
      window.addEventListener("pointermove", onMove, { passive: true });
      svg.addEventListener("pointerleave", onLeave);
    }

    let raf = 0;
    const frame = () => {
      hoverRef.current += (hoverTargetRef.current - hoverRef.current) * V_LERP;
      const restCentre = 4;
      const aim = hoverRef.current > 0.001 ? targetCentreRef.current : restCentre;
      centreRef.current += (aim - centreRef.current) * C_LERP;

      for (let i = 0; i < N; i++) {
        const d = Math.abs(i - centreRef.current);
        const target = FLOOR + AMP * Math.pow(falloffRef.current, d);
        heightRef.current[i] += (target - heightRef.current[i]) * H_LERP;
        const H = heightRef.current[i];
        const grp = groupRefs.current[i];
        if (!grp) continue;
        grp.face.setAttribute("d", facePath(i, H));
        grp.edge.setAttribute("d", edgePath(i, H));
        const spot = clamp(1.06 - spotlightRef.current * d, 0.4, 1.0);
        const b = 1 - hoverRef.current * (1 - spot);
        grp.g.setAttribute("filter", `brightness(${Math.round(b * 1000) / 1000})`);

        // pink spotlight: tint the hovered bar's face, fading with distance + hover
        const tint = hoverRef.current * clamp(1 - d * 0.7, 0, 1);
        const fill = tint > 0.01 ? mixToHex(hexToRgb(spotlightColorRef.current), tint) : "#08090A";
        grp.face.setAttribute("fill", fill);
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
      className="grid place-items-center"
      style={{ width: 340, height: 289, touchAction: "none" }}>
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
              if (!el) return;
              const face = el.querySelector<SVGPathElement>("path[data-role='face']");
              const edge = el.querySelector<SVGPathElement>("path[data-role='edge']");
              if (face && edge) groupRefs.current[i] = { g: el, face, edge };
            }}
            strokeWidth="0.5"
            filter="brightness(1)">
            <path data-role="face" fill="#08090A" stroke={barColor} d={facePath(i, rest[i])} />
            <path
              data-role="edge"
              stroke={glowColor}
              strokeLinecap="round"
              d={edgePath(i, rest[i])}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

export default Momentum;










