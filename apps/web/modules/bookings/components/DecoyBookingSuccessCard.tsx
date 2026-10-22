import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Badge } from "@calcom/ui/components/badge";
import { Icon } from "@calcom/ui/components/icon";
import * as React from "react";

interface FireworksProps {
  burstCount: number;
  particleCount: number;
  speed: number;
  colors: string[];
  loop: boolean;
}

interface Rocket {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  color: string;
  launchAt: number;
  launched: boolean;
  exploded: boolean;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/** Canvas fireworks overlay. Colors default to the design system's visualization tokens. */
function Fireworks({ burstCount, particleCount, speed, colors, loop }: FireworksProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const colorKey = colors.join(",");

  React.useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const palette = colorKey.split(",");

    let width = 0;
    let height = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const showDuration = 900 + burstCount * 350;
    let rockets: Rocket[] = [];
    let sparks: Spark[] = [];
    let elapsed = 0;

    const scheduleShow = (offset: number) => {
      rockets = Array.from({ length: Math.max(0, Math.round(burstCount)) }, (_, i) => ({
        x: width * (0.15 + Math.random() * 0.7),
        y: height,
        targetY: height * (0.15 + Math.random() * 0.3),
        vy: 0,
        color: palette[i % palette.length],
        launchAt: offset + i * 350 + Math.random() * 200,
        launched: false,
        exploded: false,
      }));
    };
    scheduleShow(200);

    const explode = (rocket: Rocket) => {
      const count = Math.max(1, Math.round(particleCount));
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
        const velocity = 1.5 + Math.random() * 2.5;
        const maxLife = 900 + Math.random() * 600;
        sparks.push({
          x: rocket.x,
          y: rocket.y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          life: maxLife,
          maxLife,
          color: Math.random() < 0.8 ? rocket.color : palette[Math.floor(Math.random() * palette.length)],
          size: 1.5 + Math.random() * 1.5,
        });
      }
    };

    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(50, now - last) * speed;
      last = now;
      elapsed += dt;
      const step = dt / 16.67;

      ctx.clearRect(0, 0, width, height);

      for (const rocket of rockets) {
        if (rocket.exploded || elapsed < rocket.launchAt) continue;
        if (!rocket.launched) {
          rocket.launched = true;
          rocket.y = height;
          rocket.vy = -Math.sqrt(2 * 0.12 * (height - rocket.targetY));
        }
        rocket.y += rocket.vy * step;
        rocket.vy += 0.12 * step;
        ctx.globalAlpha = 1;
        ctx.fillStyle = rocket.color;
        ctx.beginPath();
        ctx.arc(rocket.x, rocket.y, 2, 0, Math.PI * 2);
        ctx.fill();
        if (rocket.vy >= 0 || rocket.y <= rocket.targetY) {
          rocket.exploded = true;
          explode(rocket);
        }
      }

      sparks = sparks.filter((spark) => spark.life > 0);
      for (const spark of sparks) {
        spark.vx *= Math.pow(0.98, step);
        spark.vy = spark.vy * Math.pow(0.98, step) + 0.04 * step;
        spark.x += spark.vx * step;
        spark.y += spark.vy * step;
        spark.life -= dt;
        ctx.globalAlpha = Math.max(0, spark.life / spark.maxLife);
        ctx.fillStyle = spark.color;
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      const showDone = rockets.every((r) => r.exploded) && sparks.length === 0;
      if (showDone && loop) {
        elapsed = 0;
        scheduleShow(400);
      } else if (showDone && elapsed > showDuration) {
        ctx.clearRect(0, 0, width, height);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [burstCount, particleCount, speed, colorKey, loop, reducedMotion]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
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
  const [burstCount, setBurstCount] = React.useState(8);
  const [particleCount, setParticleCount] = React.useState(60);
  const [speed, setSpeed] = React.useState(1);
  const [primaryColor, setPrimaryColor] = React.useState("#19a974");
  const [secondaryColor, setSecondaryColor] = React.useState("#6634ef");
  const [accentColor, setAccentColor] = React.useState("#ec4899");
  const [loop, setLoop] = React.useState(false);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="DecoyBookingSuccessCard-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.burstCount === "number") setBurstCount(p.burstCount);
      if (typeof p.particleCount === "number") setParticleCount(p.particleCount);
      if (typeof p.speed === "number") setSpeed(p.speed);
      if (typeof p.primaryColor === "string") setPrimaryColor(p.primaryColor);
      if (typeof p.secondaryColor === "string") setSecondaryColor(p.secondaryColor);
      if (typeof p.accentColor === "string") setAccentColor(p.accentColor);
      if (typeof p.loop === "boolean") setLoop(p.loop);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  return (
    <div className="relative h-screen" data-config-id="DecoyBookingSuccessCard-controls">
      <Fireworks
        burstCount={burstCount}
        particleCount={particleCount}
        speed={speed}
        colors={[primaryColor, secondaryColor, accentColor]}
        loop={loop}
      />
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
