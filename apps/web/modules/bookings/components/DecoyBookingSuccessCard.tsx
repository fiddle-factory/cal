import * as React from "react";

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
  const successIconRef = React.useRef<HTMLDivElement>(null);

  // Confetti tunables (defaults map to --cal-bg-visualization-*-emphasis tokens)
  const [confettiAmount, setConfettiAmount] = React.useState(140);
  const [confettiSpeed, setConfettiSpeed] = React.useState(1);
  const [confettiColor1, setConfettiColor1] = React.useState("#ec4899");
  const [confettiColor2, setConfettiColor2] = React.useState("#6634ef");
  const [confettiColor3, setConfettiColor3] = React.useState("#4252ff");
  const [confettiColor4, setConfettiColor4] = React.useState("#19a974");
  const [confettiColor5, setConfettiColor5] = React.useState("#e7b008");
  const confettiColors = [confettiColor1, confettiColor2, confettiColor3, confettiColor4, confettiColor5];
  const confettiKey = `${confettiAmount}-${confettiSpeed}-${confettiColors.join(",")}`;
  const [finishedConfettiKey, setFinishedConfettiKey] = React.useState<string | null>(null);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="SourceRouteStory-main-0"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.confettiAmount === "number") setConfettiAmount(p.confettiAmount);
      if (typeof p.confettiSpeed === "number") setConfettiSpeed(p.confettiSpeed);
      if (typeof p.confettiColor1 === "string") setConfettiColor1(p.confettiColor1);
      if (typeof p.confettiColor2 === "string") setConfettiColor2(p.confettiColor2);
      if (typeof p.confettiColor3 === "string") setConfettiColor3(p.confettiColor3);
      if (typeof p.confettiColor4 === "string") setConfettiColor4(p.confettiColor4);
      if (typeof p.confettiColor5 === "string") setConfettiColor5(p.confettiColor5);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  return (
    <div className="h-screen">
      {finishedConfettiKey !== confettiKey && (
        <ConfettiBurst
          key={confettiKey}
          amount={confettiAmount}
          speed={confettiSpeed}
          colors={confettiColors}
          anchorRef={successIconRef}
          onDone={() => setFinishedConfettiKey(confettiKey)}
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
                  <div
                    ref={successIconRef}
                    className="bg-cal-success mx-auto flex h-12 w-12 items-center justify-center rounded-full">
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

interface ConfettiBurstProps {
  amount: number;
  speed: number;
  colors: string[];
  anchorRef: React.RefObject<HTMLElement | null>;
  onDone: () => void;
}

interface ConfettiPiece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  spin: number;
  tilt: number;
  tiltSpeed: number;
  color: string;
  round: boolean;
}

const CONFETTI_DURATION_MS = 2800;
const FRAME_MS = 1000 / 60;

/**
 * One-shot canvas confetti burst centred on the anchor element.
 * The canvas ignores pointer events and unmounts itself (via onDone) when the burst ends.
 */
function ConfettiBurst({ amount, speed, colors, anchorRef, onDone }: ConfettiBurstProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const onDoneRef = React.useRef(onDone);
  onDoneRef.current = onDone;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!canvas || !ctx || prefersReducedMotion || amount <= 0) {
      onDoneRef.current();
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const anchor = anchorRef.current?.getBoundingClientRect();
    const originX = anchor ? anchor.left + anchor.width / 2 : width / 2;
    const originY = anchor ? anchor.top + anchor.height / 2 : height / 3;
    const palette = colors.length > 0 ? colors : ["#ec4899"];

    const pieces: ConfettiPiece[] = Array.from({ length: Math.round(amount) }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const velocity = 5 + Math.random() * 10;
      return {
        x: originX,
        y: originY,
        vx: Math.cos(angle) * velocity * 1.4,
        vy: Math.sin(angle) * velocity - 5,
        size: 6 + Math.random() * 5,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.3,
        tilt: Math.random() * Math.PI * 2,
        tiltSpeed: 0.05 + Math.random() * 0.12,
        color: palette[i % palette.length],
        round: Math.random() < 0.3,
      };
    });

    let raf = 0;
    let last = performance.now();
    let elapsed = 0;

    const frame = (now: number) => {
      const dt = (Math.min(now - last, 50) / FRAME_MS) * speed;
      last = now;
      elapsed += dt * FRAME_MS;

      const fadeStart = CONFETTI_DURATION_MS * 0.6;
      const alpha = Math.max(0, 1 - Math.max(0, elapsed - fadeStart) / (CONFETTI_DURATION_MS - fadeStart));
      const drag = Math.pow(0.96, dt);

      ctx.clearRect(0, 0, width, height);
      for (const p of pieces) {
        p.vx *= drag;
        p.vy = p.vy * drag + 0.3 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rotation += p.spin * dt;
        p.tilt += p.tiltSpeed * dt;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.scale(1, Math.cos(p.tilt));
        if (p.round) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2.4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        ctx.restore();
      }

      if (elapsed >= CONFETTI_DURATION_MS) {
        ctx.clearRect(0, 0, width, height);
        onDoneRef.current();
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // Each burst is keyed by its settings, so it only runs once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 h-screen w-screen"
    />
  );
}
