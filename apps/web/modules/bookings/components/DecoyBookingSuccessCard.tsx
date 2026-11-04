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
  /** Optional seasonal styling. Content and layout stay the same. */
  theme?: "default" | "christmas";
}

const SNOW_CONFIG_ID = "DecoyBookingSuccessCard-controls";
const MAX_SNOWFLAKES = 120;

// Deterministic pseudo-random values so server and client renders match.
function seeded(index: number, salt: number) {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const SNOWFLAKES = Array.from({ length: MAX_SNOWFLAKES }, (_, i) => ({
  left: seeded(i, 1) * 100,
  size: 3 + seeded(i, 2) * 5,
  delay: seeded(i, 3),
  speedFactor: 0.7 + seeded(i, 4) * 0.6,
  opacityFactor: 0.55 + seeded(i, 5) * 0.45,
}));

const SNOW_KEYFRAMES = `
@keyframes cal-snowfall {
  0% { transform: translate3d(0, -10vh, 0); }
  50% { transform: translate3d(14px, 50vh, 0); }
  100% { transform: translate3d(-8px, 110vh, 0); }
}
@media (prefers-reduced-motion: reduce) {
  .cal-snowflake { display: none; }
}
`;

function HollyDecoration({ leafColor, berryColor }: { leafColor: string; berryColor: string }) {
  return (
    <svg
      width="30"
      height="24"
      viewBox="0 0 30 24"
      aria-hidden="true"
      className="pointer-events-none absolute -right-4 -top-2 drop-shadow-sm">
      <path d="M15 14 C10 4, 3 4, 1 8 C4 9, 4 12, 2 14 C6 15, 10 17, 15 14 Z" fill={leafColor} />
      <path d="M15 14 C20 4, 27 4, 29 8 C26 9, 26 12, 28 14 C24 15, 20 17, 15 14 Z" fill={leafColor} />
      <circle cx="12" cy="14" r="3" fill={berryColor} />
      <circle cx="18" cy="14" r="3" fill={berryColor} />
      <circle cx="15" cy="10" r="3" fill={berryColor} />
      <circle cx="14" cy="9" r="0.9" fill="#ffffff" opacity="0.7" />
    </svg>
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
  theme = "default",
}: DecoyBookingSuccessCardProps) {
  const { t } = useLocale();
  const isChristmas = theme === "christmas";

  const [snowCount, setSnowCount] = React.useState(60);
  const [fallDuration, setFallDuration] = React.useState(10);
  const [snowOpacity, setSnowOpacity] = React.useState(0.85);
  const [snowColor, setSnowColor] = React.useState("#ffffff");
  const [backdropColor, setBackdropColor] = React.useState("#123524");
  const [accentRed, setAccentRed] = React.useState("#c62828");
  const [accentGreen, setAccentGreen] = React.useState("#1b7a3e");

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="DecoyBookingSuccessCard-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.snowCount === "number") setSnowCount(p.snowCount);
      if (typeof p.fallDuration === "number") setFallDuration(p.fallDuration);
      if (typeof p.snowOpacity === "number") setSnowOpacity(p.snowOpacity);
      if (typeof p.snowColor === "string") setSnowColor(p.snowColor);
      if (typeof p.backdropColor === "string") setBackdropColor(p.backdropColor);
      if (typeof p.accentRed === "string") setAccentRed(p.accentRed);
      if (typeof p.accentGreen === "string") setAccentGreen(p.accentGreen);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const visibleSnowflakes = SNOWFLAKES.slice(0, Math.max(0, Math.min(MAX_SNOWFLAKES, Math.round(snowCount))));

  return (
    <div
      className={isChristmas ? "relative min-h-screen overflow-hidden" : "h-screen"}
      data-config-id={isChristmas ? SNOW_CONFIG_ID : undefined}
      style={
        isChristmas
          ? {
              backgroundColor: backdropColor,
              backgroundImage:
                "radial-gradient(ellipse at top, rgba(255,255,255,0.12), transparent 60%), radial-gradient(ellipse at bottom, rgba(255,255,255,0.18), transparent 55%)",
            }
          : undefined
      }>
      {isChristmas && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <style>{SNOW_KEYFRAMES}</style>
          {visibleSnowflakes.map((flake, i) => {
            const duration = fallDuration * flake.speedFactor;
            return (
              <span
                key={i}
                className="cal-snowflake absolute rounded-full"
                style={{
                  top: 0,
                  left: `${flake.left}%`,
                  width: flake.size,
                  height: flake.size,
                  backgroundColor: snowColor,
                  opacity: snowOpacity * flake.opacityFactor,
                  filter: flake.size > 6 ? "blur(1px)" : undefined,
                  animation: `cal-snowfall ${duration}s linear ${-flake.delay * duration}s infinite`,
                  willChange: "transform",
                }}
              />
            );
          })}
        </div>
      )}
      <main className={isChristmas ? "relative z-10 mx-auto max-w-3xl" : "mx-auto max-w-3xl"}>
        <div className="overflow-y-auto">
          <div className="flex items-end justify-center px-4 pb-20 pt-4 text-center sm:flex sm:p-0">
            <div className="main inset-0 my-4 flex flex-col transition-opacity sm:my-0" aria-hidden="true">
              <div
                className={`bg-default dark:bg-cal-muted border-booker border-booker-width inline-block transform overflow-hidden rounded-lg px-8 pb-4 pt-5 text-left align-bottom transition-all sm:my-8 sm:w-full sm:max-w-xl sm:py-8 sm:align-middle${
                  isChristmas ? " relative shadow-xl" : ""
                }`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline">
                {isChristmas && (
                  <div
                    className="absolute inset-x-0 top-0 h-1.5"
                    aria-hidden="true"
                    style={{
                      backgroundImage: `repeating-linear-gradient(135deg, ${accentRed} 0 10px, #ffffff 10px 20px, ${accentGreen} 20px 30px, #ffffff 30px 40px)`,
                    }}
                  />
                )}
                <div>
                  <div
                    className={`bg-cal-success mx-auto flex h-12 w-12 items-center justify-center rounded-full${
                      isChristmas ? " relative" : ""
                    }`}
                    style={isChristmas ? { boxShadow: `0 0 0 3px ${accentRed}33` } : undefined}>
                    <Icon name="check" className="h-5 w-5 text-green-600 dark:text-green-400" />
                    {isChristmas && <HollyDecoration leafColor={accentGreen} berryColor={accentRed} />}
                  </div>
                </div>
                <div className="mb-8 mt-6 text-center last:mb-0">
                  <h3 className="text-emphasis text-2xl font-semibold leading-6" id="modal-headline">
                    {t("meeting_is_scheduled")}
                  </h3>

                  <div className="mt-3">
                    <p className="text-default">{t("emailed_you_and_any_other_attendees")}</p>
                  </div>

                  <div
                    className="border-subtle text-default mt-8 grid grid-cols-3 gap-x-4 border-t pt-8 text-left rtl:text-right sm:gap-x-0"
                    style={isChristmas ? { borderTopColor: `${accentGreen}55`, borderTopStyle: "dashed" } : undefined}>
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
