import React, { useEffect, useRef, useState } from "react";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Badge } from "@calcom/ui/components/badge";
import { Icon } from "@calcom/ui/components/icon";

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

interface FireworksProps {
  colors: string[];
  burstCount: number;
  particleCount: number;
  duration: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

/** Decorative canvas fireworks that burst once when mounted (or when its settings change). */
function BookingFireworks({ colors, burstCount, particleCount, duration }: FireworksProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorKey = colors.join(",");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const palette = colorKey.split(",");
    const dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;
    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const particles: Particle[] = [];
    const timers: number[] = [];
    const lifeFrames = Math.max(20, (duration / 1000) * 60);

    const burst = (index: number) => {
      const x = width * (0.15 + Math.random() * 0.7);
      const y = height * (0.08 + Math.random() * 0.3);
      const color = palette[index % palette.length];
      const speed = 2 + Math.random() * 1.5;
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.2;
        const v = speed * (0.5 + Math.random() * 0.5);
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * v,
          vy: Math.sin(angle) * v,
          life: 0,
          maxLife: lifeFrames * (0.7 + Math.random() * 0.3),
          color: Math.random() < 0.2 ? palette[(index + 1) % palette.length] : color,
          size: 1.5 + Math.random() * 1.5,
        });
      }
    };

    let frame = 0;
    let running = true;
    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }
        p.vx *= 0.97;
        p.vy = p.vy * 0.97 + 0.05;
        p.x += p.vx;
        p.y += p.vy;
        ctx.globalAlpha = 1 - p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (running) frame = requestAnimationFrame(tick);
    };

    for (let i = 0; i < burstCount; i++) {
      timers.push(window.setTimeout(() => burst(i), 150 + i * 350));
    }
    // Stop the loop once every burst has played out.
    timers.push(
      window.setTimeout(() => {
        running = false;
        ctx.clearRect(0, 0, width, height);
      }, 150 + burstCount * 350 + duration + 200)
    );
    frame = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      timers.forEach((t) => window.clearTimeout(t));
      observer.disconnect();
    };
  }, [colorKey, burstCount, particleCount, duration]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
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
  const [fireworksEnabled, setFireworksEnabled] = useState(true);
  const [fireworksColor1, setFireworksColor1] = useState("#16a34a");
  const [fireworksColor2, setFireworksColor2] = useState("#3b82f6");
  const [fireworksColor3, setFireworksColor3] = useState("#f59e0b");
  const [fireworksBursts, setFireworksBursts] = useState(5);
  const [fireworksParticles, setFireworksParticles] = useState(36);
  const [fireworksDuration, setFireworksDuration] = useState(1400);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="DecoyBookingSuccessCard-div-4"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.fireworksEnabled === "boolean") setFireworksEnabled(p.fireworksEnabled);
      if (typeof p.fireworksColor1 === "string") setFireworksColor1(p.fireworksColor1);
      if (typeof p.fireworksColor2 === "string") setFireworksColor2(p.fireworksColor2);
      if (typeof p.fireworksColor3 === "string") setFireworksColor3(p.fireworksColor3);
      if (typeof p.fireworksBursts === "number") setFireworksBursts(p.fireworksBursts);
      if (typeof p.fireworksParticles === "number") setFireworksParticles(p.fireworksParticles);
      if (typeof p.fireworksDuration === "number") setFireworksDuration(p.fireworksDuration);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  return (
    <div className="h-screen">
      <main className="mx-auto max-w-3xl">
        <div className="overflow-y-auto">
          <div className="flex items-end justify-center px-4 pb-20 pt-4 text-center sm:flex sm:p-0">
            <div className="main inset-0 my-4 flex flex-col transition-opacity sm:my-0" aria-hidden="true">
              <div
                data-config-id="DecoyBookingSuccessCard-div-4"
                className="bg-default dark:bg-cal-muted border-booker border-booker-width relative inline-block transform overflow-hidden rounded-lg px-8 pb-4 pt-5 text-left align-bottom transition-all sm:my-8 sm:w-full sm:max-w-xl sm:py-8 sm:align-middle"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline">
                {fireworksEnabled && (
                  <BookingFireworks
                    colors={[fireworksColor1, fireworksColor2, fireworksColor3]}
                    burstCount={fireworksBursts}
                    particleCount={fireworksParticles}
                    duration={fireworksDuration}
                  />
                )}
                <div className="relative">
                  <div className="bg-cal-success mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                    <Icon name="check" className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="relative mb-8 mt-6 text-center last:mb-0">
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
