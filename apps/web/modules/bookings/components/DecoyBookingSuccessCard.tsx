import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Badge } from "@calcom/ui/components/badge";
import { Icon } from "@calcom/ui/components/icon";
import React, { useEffect, useRef, useState } from "react";

interface FireworksProps {
  colors: string[];
  burstCount: number;
  particlesPerBurst: number;
  speed: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  color: string;
  size: number;
}

interface Rocket {
  x: number;
  targetY: number;
  startY: number;
  launchAt: number;
  color: string;
  exploded: boolean;
}

const RISE_MS = 650;

function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Lightweight one-shot canvas fireworks. Purely decorative: it ignores pointer
 * events, is hidden from assistive tech, unmounts when finished and does not
 * render at all when the user prefers reduced motion.
 */
function Fireworks({ colors, burstCount, particlesPerBurst, speed }: FireworksProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(false);
  const [reduced] = useState(prefersReducedMotion);
  const colorKey = colors.join(",");

  useEffect(() => {
    setDone(false);
  }, [colorKey, burstCount, particlesPerBurst, speed]);

  useEffect(() => {
    if (reduced || done) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const palette = colorKey.split(",");
    const pick = (i: number) => palette[i % palette.length];
    const rockets: Rocket[] = Array.from({ length: burstCount }, (_, i) => ({
      x: width * (0.12 + Math.random() * 0.76),
      startY: height,
      targetY: height * (0.12 + Math.random() * 0.33),
      launchAt: (i * 320) / speed,
      color: pick(i),
      exploded: false,
    }));
    const sparks: Spark[] = [];
    const gravity = 0.05 * speed * speed;
    const friction = 0.985;

    const explode = (r: Rocket, index: number) => {
      for (let j = 0; j < particlesPerBurst; j++) {
        const angle = (Math.PI * 2 * j) / particlesPerBurst + Math.random() * 0.3;
        const velocity = (1.5 + Math.random() * 3) * speed;
        sparks.push({
          x: r.x,
          y: r.targetY,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          life: 1,
          decay: (0.012 + Math.random() * 0.012) * speed,
          // mostly the rocket's color, with a few accent sparks from the palette
          color: Math.random() < 0.75 ? r.color : pick(index + 1),
          size: 1.5 + Math.random() * 1.5,
        });
      }
    };

    let frame = 0;
    let start: number | null = null;
    let last = 0;

    const tick = (now: number) => {
      if (start === null) {
        start = now;
        last = now;
      }
      const elapsed = now - start;
      const step = Math.min((now - last) / 16.67, 3);
      last = now;
      ctx.clearRect(0, 0, width, height);

      const riseMs = RISE_MS / speed;
      rockets.forEach((r, i) => {
        if (r.exploded || elapsed < r.launchAt) return;
        const t = Math.min((elapsed - r.launchAt) / riseMs, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const y = r.startY + (r.targetY - r.startY) * eased;
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(r.x, y);
        ctx.lineTo(r.x, Math.min(y + 24, height));
        ctx.stroke();
        if (t >= 1) {
          r.exploded = true;
          explode(r, i);
        }
      });

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.vx *= Math.pow(friction, step);
        s.vy = s.vy * Math.pow(friction, step) + gravity * step;
        s.x += s.vx * step;
        s.y += s.vy * step;
        s.life -= s.decay * step;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = s.life;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (rockets.every((r) => r.exploded) && sparks.length === 0) {
        setDone(true);
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduced, done, colorKey, burstCount, particlesPerBurst, speed]);

  if (reduced || done) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
    />
  );
}

export interface DecoyBookingSuccessCardProps {
  title: string;
  formattedDate: string;
  formattedTime: string;
  endTime: string;
  formattedTimeZone: string;
  hostName: string | null;
  hostEmail: string | null;
  attendeeName: string | null;
  attendeeEmail: string | null;
  location: string | null;
}

export function DecoyBookingSuccessCard({
  title,
  formattedDate,
  formattedTime,
  endTime,
  formattedTimeZone,
  hostName,
  hostEmail,
  attendeeName,
  attendeeEmail,
  location,
}: DecoyBookingSuccessCardProps) {
  const { t } = useLocale();
  // Defaults mirror the design system's success (green-500), info (blue-500)
  // and attention (orange-400) palette used by badges and alerts.
  const [showFireworks, setShowFireworks] = useState(true);
  const [successColor, setSuccessColor] = useState("#22c55e");
  const [infoColor, setInfoColor] = useState("#3b82f6");
  const [attentionColor, setAttentionColor] = useState("#fb923c");
  const [burstCount, setBurstCount] = useState(5);
  const [particlesPerBurst, setParticlesPerBurst] = useState(48);
  const [speed, setSpeed] = useState(1);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="DecoyBookingSuccessCard-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.showFireworks === "boolean") setShowFireworks(p.showFireworks);
      if (typeof p.successColor === "string") setSuccessColor(p.successColor);
      if (typeof p.infoColor === "string") setInfoColor(p.infoColor);
      if (typeof p.attentionColor === "string") setAttentionColor(p.attentionColor);
      if (typeof p.burstCount === "number") setBurstCount(p.burstCount);
      if (typeof p.particlesPerBurst === "number") setParticlesPerBurst(p.particlesPerBurst);
      if (typeof p.speed === "number") setSpeed(p.speed);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  return (
    <div className="h-screen" data-config-id="DecoyBookingSuccessCard-controls">
      {showFireworks && (
        <Fireworks
          colors={[successColor, infoColor, attentionColor]}
          burstCount={burstCount}
          particlesPerBurst={particlesPerBurst}
          speed={speed}
        />
      )}
      <main className="mx-auto max-w-3xl">
        <div className="overflow-y-auto">
          <div className="flex items-end justify-center px-4 pb-20 pt-4 text-center sm:flex sm:p-0">
            <div className="main inset-0 my-4 flex flex-col transition-opacity sm:my-0" aria-hidden="true">
              <div
                className="bg-default dark:bg-cal-muted border-booker border-booker-width inline-block transform overflow-hidden rounded-lg px-8 pb-4 pt-5 text-left align-bottom transition-all sm:my-8 sm:w-full sm:max-w-xl sm:py-8 sm:align-middle"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline">
                <div>
                  <div className="bg-cal-success mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                    <Icon name="check" className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="mb-8 mt-6 text-center last:mb-0">
                  <h3 className="text-emphasis text-2xl font-semibold leading-6" id="modal-headline">
                    {t("meeting_is_scheduled")}
                  </h3>

                  <div className="mt-3">
                    <p className="text-default">{t("emailed_you_and_any_other_attendees")}</p>
                  </div>

                  <div className="border-subtle text-default mt-8 grid grid-cols-3 gap-x-4 border-t pt-8 text-left rtl:text-right sm:gap-x-0">
                    <div className="font-medium">{t("what")}</div>
                    <div className="col-span-2 mb-6 last:mb-0">{title}</div>

                    {formattedDate && (
                      <>
                        <div className="font-medium">{t("when")}</div>
                        <div className="col-span-2 mb-6 last:mb-0">
                          {formattedDate}
                          {formattedTime && (
                            <>
                              <br />
                              {formattedTime}
                              {endTime && ` - ${endTime}`}
                              {formattedTimeZone && (
                                <span className="text-bookinglight"> ({formattedTimeZone})</span>
                              )}
                            </>
                          )}
                        </div>
                      </>
                    )}

                    <div className="font-medium">{t("who")}</div>
                    <div className="col-span-2 last:mb-0">
                      {hostName && (
                        <div className="mb-3">
                          <div>
                            <span className="mr-2">{hostName}</span>
                            <Badge variant="blue">{t("Host")}</Badge>
                          </div>
                          {hostEmail && <p className="text-default">{hostEmail}</p>}
                        </div>
                      )}
                      {attendeeName && (
                        <div className="mb-3 last:mb-0">
                          <p>{attendeeName}</p>
                          {attendeeEmail && <p>{attendeeEmail}</p>}
                        </div>
                      )}
                    </div>

                    {location && (
                      <>
                        <div className="mt-3 font-medium">{t("where")}</div>
                        <div className="col-span-2 mt-3">{t("web_conferencing_details_to_follow")}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
