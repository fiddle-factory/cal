import React from "react";

/**
 * Linear "Momentum" interactive illustration (ported from a fiddle snip).
 *
 * 15 SVG "plank" bars on a ground line. The pointer is projected onto that line
 * to drive a travelling exponential bump; a spotlight (brightness) tracks the
 * bump centre while hovering. At rest the bell sits on bar #4.
 */

const SVGNS = "http://www.w3.org/2000/svg";
const N = 15;

// Exact depth vector of every plank (from the snapshot paths).
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

export interface MomentumProps {
  className?: string;
  /** seconds for the bump centre to ease toward the pointer (lower = snappier) */
  responsiveness?: number;
  /** exponential bell falloff per bar (0.4 = sharp peak, 0.8 = wide spread) */
  falloff?: number;
  /** peak plank thickness boost above the floor */
  amplitude?: number;
  /** face colour of each plank */
  faceColor?: string;
  /** outline colour of each plank face */
  strokeColor?: string;
}

export function Momentum({
  className,
  responsiveness = 0.2,
  falloff = 0.6,
  amplitude = 121,
  faceColor = "#08090A",
  strokeColor = "#62666D",
}: MomentumProps) {
  const hostRef = React.useRef<HTMLDivElement>(null);

  // keep tunables in refs so the RAF loop reads the latest values without re-mounting
  const cfg = React.useRef({ responsiveness, falloff, amplitude });
  cfg.current = { responsiveness, falloff, amplitude };

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("xmlns", SVGNS);
    svg.setAttribute("width", "272");
    svg.setAttribute("height", "267");
    svg.setAttribute("fill", "none");
    svg.setAttribute("viewBox", "0 0 272 267");
    svg.setAttribute("overflow", "visible");
    svg.style.overflow = "visible";
    svg.style.display = "block";

    const groups: { g: SVGGElement; face: SVGPathElement; edge: SVGPathElement }[] = [];
    for (let i = 0; i < N; i++) {
      const g = document.createElementNS(SVGNS, "g");
      g.setAttribute("stroke-width", "0.5");
      g.setAttribute("filter", "brightness(1)");
      (g.style as CSSStyleDeclaration).willChange = "filter";

      const face = document.createElementNS(SVGNS, "path");
      face.setAttribute("fill", faceColor);
      face.setAttribute("stroke", strokeColor);

      const edge = document.createElementNS(SVGNS, "path");
      edge.setAttribute("stroke", "#2E2E32");
      edge.setAttribute("stroke-linecap", "round");

      g.appendChild(face);
      g.appendChild(edge);
      svg.appendChild(g);
      groups.push({ g, face, edge });
    }
    host.appendChild(svg);

    const height = rest.slice();
    let centre = 4;
    let targetCentre = 4;
    let hover = 0;
    let hoverTarget = 0;

    function setPointer(clientX: number, clientY: number) {
      const r = svg.getBoundingClientRect();
      const mx = (clientX - r.left) * (272 / r.width);
      const my = (clientY - r.top) * (267 / r.height);
      const t = (mx - ORIGIN_X) * UX + (my - ORIGIN_Y) * UY;
      targetCentre = clamp(t / SPACING, 0, N - 1);
      hoverTarget = 1;
    }

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
      } else {
        setPointer(e.clientX, e.clientY);
      }
    };
    const onLeave = () => {
      hoverTarget = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    svg.addEventListener("pointerleave", onLeave);

    const H_LERP = 0.22;
    const V_LERP = 0.12;

    let raf = 0;
    function frame() {
      const { responsiveness: resp, falloff: kbase, amplitude: amp } = cfg.current;
      hover += (hoverTarget - hover) * V_LERP;
      const aim = hover > 0.001 ? targetCentre : 4;
      centre += (aim - centre) * resp;

      for (let i = 0; i < N; i++) {
        const d = Math.abs(i - centre);
        const target = FLOOR + amp * Math.pow(kbase, d);
        height[i] += (target - height[i]) * H_LERP;
        const H = height[i];

        groups[i].face.setAttribute("d", facePath(i, H));
        groups[i].edge.setAttribute("d", edgePath(i, H));

        const spot = clamp(1.06 - 0.066 * d, 0.4, 1.0);
        const b = 1 - hover * (1 - spot);
        groups[i].g.setAttribute("filter", `brightness(${Math.round(b * 1000) / 1000})`);
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      svg.removeEventListener("pointerleave", onLeave);
      host.removeChild(svg);
    };
  }, [faceColor, strokeColor]);

  return (
    <div
      ref={hostRef}
      className={className}
      style={{
        display: "grid",
        width: 340,
        height: 289,
        justifyItems: "center",
        alignItems: "center",
        touchAction: "none",
      }}
    />
  );
}

export default Momentum;

