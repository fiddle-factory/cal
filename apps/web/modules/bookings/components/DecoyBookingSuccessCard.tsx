import * as React from "react";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Badge } from "@calcom/ui/components/badge";
import { Icon } from "@calcom/ui/components/icon";

const FIREWORK_COLORS = [
  "var(--cal-bg-semantic-success-emphasis)",
  "var(--cal-bg-visualization-1-emphasis)",
  "var(--cal-bg-visualization-2-emphasis)",
  "var(--cal-bg-visualization-3-emphasis)",
  "var(--cal-bg-visualization-5-emphasis)",
  "var(--cal-bg-visualization-6-emphasis)",
];

// Burst origins relative to the checkmark center, as fractions of the spread, plus start delay in seconds.
const FIREWORK_BURSTS = [
  { x: 0, y: 0, delay: 0, scale: 1.25 },
  { x: -1.9, y: -0.15, delay: 0.3, scale: 0.8 },
  { x: 1.9, y: 0.1, delay: 0.55, scale: 0.85 },
  { x: -1.1, y: 0.35, delay: 0.85, scale: 0.6 },
  { x: 1.2, y: -0.3, delay: 1.05, scale: 0.6 },
];

const FIREWORKS_CSS = `
@keyframes cal-firework-particle {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.4); }
  10% { opacity: 1; }
  70% { opacity: 1; transform: translate(calc(-50% + var(--fw-dx)), calc(-50% + var(--fw-dy))) scale(1); }
  100% { opacity: 0; transform: translate(calc(-50% + var(--fw-dx)), calc(-50% + var(--fw-dy) + 8px)) scale(0.3); }
}
@keyframes cal-firework-flash {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.2); }
  25% { opacity: 0.55; }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
}
.cal-firework-particle, .cal-firework-flash {
  position: absolute;
  left: 0;
  top: 0;
  border-radius: 9999px;
  opacity: 0;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  animation-fill-mode: both;
}
.cal-firework-particle { animation-name: cal-firework-particle; }
.cal-firework-flash { animation-name: cal-firework-flash; }
@media (prefers-reduced-motion: reduce) {
  .cal-firework-particle, .cal-firework-flash { animation: none; opacity: 0; }
}
`;

interface BookingFireworksProps {
  duration: number;
  spread: number;
  particleSize: number;
  particleCount: number;
}

function BookingFireworks({ duration, spread, particleSize, particleCount }: BookingFireworksProps) {
  const count = Math.max(3, Math.round(particleCount));
  return (
    <div className="pointer-events-none absolute left-1/2 top-6 z-0 h-0 w-0" aria-hidden="true">
      <style>{FIREWORKS_CSS}</style>
      {FIREWORK_BURSTS.map((burst, burstIndex) => {
        const radius = spread * burst.scale;
        return (
          <div
            key={burstIndex}
            className="absolute"
            style={{ left: burst.x * spread, top: burst.y * spread }}>
            <span
              className="cal-firework-flash"
              style={{
                width: radius * 1.4,
                height: radius * 1.4,
                background: `radial-gradient(circle, ${
                  FIREWORK_COLORS[burstIndex % FIREWORK_COLORS.length]
                } 0%, transparent 70%)`,
                animationDuration: `${duration * 0.6}s`,
                animationDelay: `${burst.delay}s`,
              }}
            />
            {Array.from({ length: count }).map((_, i) => {
              const angle = (i / count) * Math.PI * 2 + burstIndex * 0.4;
              const distance = radius * (i % 2 === 0 ? 1 : 0.75);
              const size = particleSize * (i % 3 === 0 ? 1 : 0.75);
              return (
                <span
                  key={i}
                  className="cal-firework-particle"
                  style={
                    {
                      width: size,
                      height: size,
                      backgroundColor: FIREWORK_COLORS[(i + burstIndex) % FIREWORK_COLORS.length],
                      "--fw-dx": `${Math.cos(angle) * distance}px`,
                      "--fw-dy": `${Math.sin(angle) * distance}px`,
                      animationDuration: `${duration}s`,
                      animationDelay: `${burst.delay}s`,
                    } as React.CSSProperties
                  }
                />
              );
            })}
          </div>
        );
      })}
    </div>
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
  const [showFireworks, setShowFireworks] = React.useState(true);
  const [duration, setDuration] = React.useState(1.1);
  const [spread, setSpread] = React.useState(44);
  const [particleSize, setParticleSize] = React.useState(5);
  const [particleCount, setParticleCount] = React.useState(12);
  const [replayKey, setReplayKey] = React.useState(0);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="DecoyBookingSuccessCard-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.showFireworks === "boolean") setShowFireworks(p.showFireworks);
      if (typeof p.duration === "number") setDuration(p.duration);
      if (typeof p.spread === "number") setSpread(p.spread);
      if (typeof p.particleSize === "number") setParticleSize(p.particleSize);
      if (typeof p.particleCount === "number") setParticleCount(p.particleCount);
      setReplayKey((k) => k + 1);
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
                className="bg-default dark:bg-cal-muted border-booker border-booker-width inline-block transform overflow-hidden rounded-lg px-8 pb-4 pt-5 text-left align-bottom transition-all sm:my-8 sm:w-full sm:max-w-xl sm:py-8 sm:align-middle"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline">
                <div className="relative" data-config-id="DecoyBookingSuccessCard-controls">
                  {showFireworks && (
                    <BookingFireworks
                      key={replayKey}
                      duration={duration}
                      spread={spread}
                      particleSize={particleSize}
                      particleCount={particleCount}
                    />
                  )}
                  <div className="bg-cal-success relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
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
