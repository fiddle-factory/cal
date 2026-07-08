import React from "react";

// Generative "Art" canvas ported from the Stripe.dev "Featured Post" fiddle.
// Thin outlined rects arranged on an ellipse, each rotated by a twist/twirl
// that advances every frame -> a slowly twisting stick sculpture. Faithful to
// the source draw loop; all tunables are exposed as props for genEditor.
export interface CardArtProps {
  /** stroke color of the sticks (6-digit hex) */
  strokeColor?: string;
  /** number of sticks arranged on the ring */
  count?: number;
  /** advance-per-frame; higher = faster twist */
  velocity?: number;
  /** overall size multiplier of each stick */
  scale?: number;
  /** how tightly the sticks twist around the ring */
  twist?: number;
  className?: string;
  "data-config-id"?: string;
}

export function CardArt({
  strokeColor = "#D9D9D9",
  count = 35,
  velocity = 1.1,
  scale = 2.59,
  twist = 12.26,
  className,
  ...rest
}: CardArtProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  // keep the latest tunables in a ref so the RAF loop reads live values
  const cfg = React.useRef({ strokeColor, count, velocity, scale, twist });
  cfg.current = { strokeColor, count, velocity, scale, twist };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const c = canvas.getContext("2d");
    if (!c) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const r = window.devicePixelRatio || 1;
    canvas.width = 340 * r;
    canvas.height = (340 / 1.2) * r;
    const t = (r / 2) * 30;
    const l = 80 * r;
    const i = canvas.width / 2;
    const s = canvas.height / 2;
    c.translate(-i, -s);
    c.scale(2, 2);

    // per-post config from the captured art-controls link
    const j = {
      ampX: 1.3339284636452795,
      ampY: 0.28278706834837797,
      aspectRatio: 5,
      lump: 0.30134315493702885,
      freq: 2.439661937355995,
      left: 22,
      top: -14,
      mouseX: 0.40869005525782703,
      mouseY: 0.4262271961197257,
      noise: 0.24443274504505097,
      twirl: 0.2405156938135624,
      isLineart: false,
    };
    const g = { scale: 5, noise: 5, velocity: 5 };

    let V = 0;
    let a = 0;
    let o = 0;
    let raf = 0;

    function frame(d: number) {
      const cur = cfg.current;
      const h = Math.pow(g.scale / 10 + 0.5, 5);
      const y = Math.pow(g.noise / 10 + 0.5, 5);
      const f = Math.pow(g.velocity / 10 + 0.5, 5);
      const m = 1000 / 25;
      const _ = d - a;
      if (_ > m) {
        a = d - (_ % m);
        c.clearRect(0, 0, canvas.width, canvas.height);
        c.strokeStyle = cur.strokeColor;
        c.lineWidth = 0.25 * r;
        c.fillStyle = "#090909";
        const n = cur.count;
        const p = l * j.ampX * (j.mouseX - 0.5) * 2;
        const gg = l * j.ampY * (j.mouseY - 0.5) * 2;
        const v = cur.scale * t * h;
        const L = i + j.left;
        const b = s + j.top;
        for (let k = 0; k < n; k += 1) {
          o = (k / n) * Math.PI * 2 + 0.003 * V;
          const lx = L + Math.cos(o * j.freq) * p;
          const iy = b + Math.sin(o * j.freq) * gg;
          const slump = Math.sin(0.002 * V + k / (Math.PI * j.freq)) * j.lump * v * y;
          const aa =
            Math.max(0, v + slump) +
            (1 +
              j.noise *
                y *
                (13 * Math.sin(0.13 * k) +
                  6 * Math.sin(1.57 * k) +
                  0.31 * Math.sin(0.71 * k) +
                  1.7 * Math.sin(0.33 * k)));
          const xx = aa / j.aspectRatio;
          c.beginPath();
          c.save();
          c.translate(lx, iy);
          c.rotate(k * cur.twist * 0.03 + V * j.twirl * 0.03);
          c.rect(-aa, -xx, 2 * aa, (2 * xx) / j.aspectRatio);
          c.restore();
          if (!j.isLineart) c.fill();
          c.stroke();
        }
        if (!reduce) V += cur.velocity * f;
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        border: "1px solid var(--art-stroke, #D9D9D9)",
        borderRadius: 2,
        background: "#090909",
        aspectRatio: "1.2",
      }}
      {...rest}>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}

export default CardArt;

