import React from "react";

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
  /** Adds a celebratory entrance: animated checkmark with pulsing glow rings and staggered details. */
  celebrate?: boolean;
}

const CELEBRATE_STYLES = `
@keyframes cal-celebrate-ring {
  0% { transform: scale(1); opacity: 0.55; }
  100% { transform: scale(var(--cal-ring-scale, 2.2)); opacity: 0; }
}
@keyframes cal-celebrate-pop {
  0% { transform: scale(0) rotate(-45deg); opacity: 0; }
  60% { transform: scale(1.15) rotate(8deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
@keyframes cal-celebrate-check {
  0% { transform: scale(0); opacity: 0; }
  70% { transform: scale(1.25); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes cal-celebrate-rise {
  0% { transform: translateY(12px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  [data-cal-celebrate] *, [data-cal-celebrate] *::before { animation: none !important; }
}
`;

function hexToRgba(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
  celebrate = false,
}: DecoyBookingSuccessCardProps) {
  const { t } = useLocale();
  const [glowColor, setGlowColor] = React.useState("#22c55e");
  const [pulseDuration, setPulseDuration] = React.useState(2.4);
  const [ringScale, setRingScale] = React.useState(2.2);
  const [glowIntensity, setGlowIntensity] = React.useState(0.35);
  const [entranceDuration, setEntranceDuration] = React.useState(0.6);
  const [showRings, setShowRings] = React.useState(true);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="DecoyBookingSuccessCard-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.glowColor === "string") setGlowColor(p.glowColor);
      if (typeof p.pulseDuration === "number") setPulseDuration(p.pulseDuration);
      if (typeof p.ringScale === "number") setRingScale(p.ringScale);
      if (typeof p.glowIntensity === "number") setGlowIntensity(p.glowIntensity);
      if (typeof p.entranceDuration === "number") setEntranceDuration(p.entranceDuration);
      if (typeof p.showRings === "boolean") setShowRings(p.showRings);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const rise = (delay: number): React.CSSProperties | undefined =>
    celebrate
      ? {
          animation: `cal-celebrate-rise ${entranceDuration}s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s both`,
        }
      : undefined;

  return (
    <div className="h-screen">
      <main className="mx-auto max-w-3xl">
        <div className="overflow-y-auto">
          <div className="flex items-end justify-center px-4 pb-20 pt-4 text-center sm:flex sm:p-0">
            <div className="main inset-0 my-4 flex flex-col transition-opacity sm:my-0" aria-hidden="true">
              <div
                className="bg-default dark:bg-cal-muted border-booker border-booker-width inline-block transform overflow-hidden rounded-lg px-8 pb-4 pt-5 text-left align-bottom transition-all sm:my-8 sm:w-full sm:max-w-xl sm:py-8 sm:align-middle"
                data-cal-celebrate={celebrate ? "" : undefined}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline">
                {celebrate ? (
                  <div
                    className="relative mx-auto mt-2 flex h-16 w-16 items-center justify-center"
                    data-config-id="DecoyBookingSuccessCard-controls">
                    <style>{CELEBRATE_STYLES}</style>
                    {showRings &&
                      [0, 1, 2].map((i) => (
                        <span
                          key={i}
                          aria-hidden="true"
                          className="absolute inset-0 rounded-full border-2"
                          style={
                            {
                              borderColor: glowColor,
                              "--cal-ring-scale": ringScale,
                              animation: `cal-celebrate-ring ${pulseDuration}s cubic-bezier(0, 0, 0.2, 1) ${
                                entranceDuration * 0.6 + (i * pulseDuration) / 3
                              }s infinite both`,
                            } as React.CSSProperties
                          }
                        />
                      ))}
                    <div
                      className="bg-cal-success relative flex h-16 w-16 items-center justify-center rounded-full"
                      style={{
                        boxShadow: `0 0 0 6px ${hexToRgba(glowColor, glowIntensity * 0.4)}, 0 0 32px 8px ${hexToRgba(
                          glowColor,
                          glowIntensity
                        )}`,
                        animation: `cal-celebrate-pop ${entranceDuration}s cubic-bezier(0.34, 1.56, 0.64, 1) both`,
                      }}>
                      <span
                        className="flex"
                        style={{
                          animation: `cal-celebrate-check ${entranceDuration * 0.8}s cubic-bezier(0.34, 1.56, 0.64, 1) ${
                            entranceDuration * 0.5
                          }s both`,
                        }}>
                        <Icon name="check" className="h-7 w-7 text-green-600 dark:text-green-400" />
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="bg-cal-success mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                      <Icon name="check" className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                )}
                <div className="mb-8 mt-6 text-center last:mb-0">
                  <h3
                    className="text-emphasis text-2xl font-semibold leading-6"
                    id="modal-headline"
                    style={rise(entranceDuration * 0.7)}>
                    {t("meeting_is_scheduled")}
                  </h3>

                  <div className="mt-3" style={rise(entranceDuration * 0.85)}>
                    <p className="text-default">{t("emailed_you_and_any_other_attendees")}</p>
                  </div>

                  <div
                    style={rise(entranceDuration * 1.05)}
                    className="border-subtle text-default mt-8 grid grid-cols-3 gap-x-4 border-t pt-8 text-left rtl:text-right sm:gap-x-0">
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
