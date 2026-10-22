import React from "react";
import type { CSSProperties } from "react";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Badge } from "@calcom/ui/components/badge";
import { Icon } from "@calcom/ui/components/icon";

// Design-system tokens so the confetti follows the current theme (light/dark).
const CONFETTI_COLORS = [
  "var(--cal-bg-semantic-success-emphasis)",
  "var(--cal-bg-semantic-info-emphasis)",
  "var(--cal-bg-semantic-attention-emphasis)",
  "var(--cal-bg-semantic-error-emphasis)",
  "var(--cal-brand)",
];

const CONFETTI_KEYFRAMES = `
@keyframes cal-confetti-fall {
  0% { transform: translate3d(0, -10vh, 0) rotate(0deg); opacity: 0; }
  8% { opacity: 1; }
  75% { opacity: 1; }
  100% { transform: translate3d(var(--confetti-drift), 105vh, 0) rotate(var(--confetti-rotate)); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .cal-confetti-piece { display: none; }
}
`;

interface ConfettiBurstProps {
  count: number;
  duration: number;
  pieceSize: number;
}

function ConfettiBurst({ count, duration, pieceSize }: ConfettiBurstProps) {
  const [visible, setVisible] = React.useState(true);

  const pieces = React.useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        speed: 0.75 + Math.random() * 0.5,
        drift: (Math.random() - 0.5) * 30,
        rotate: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 540),
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        round: i % 4 === 0,
        aspect: 0.4 + Math.random() * 0.6,
      })),
    [count]
  );

  React.useEffect(() => {
    setVisible(true);
    const timeout = window.setTimeout(() => setVisible(false), (duration * 1.25 + 0.6) * 1000 + 100);
    return () => window.clearTimeout(timeout);
  }, [count, duration]);

  if (!visible) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <style>{CONFETTI_KEYFRAMES}</style>
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="cal-confetti-piece absolute top-0 block"
          style={
            {
              left: `${piece.left}%`,
              width: pieceSize,
              height: piece.round ? pieceSize : pieceSize * piece.aspect,
              borderRadius: piece.round ? "9999px" : "2px",
              backgroundColor: piece.color,
              opacity: 0,
              animation: `cal-confetti-fall ${duration * piece.speed}s cubic-bezier(0.25, 0.6, 0.45, 1) ${piece.delay}s forwards`,
              "--confetti-drift": `${piece.drift}vw`,
              "--confetti-rotate": `${piece.rotate}deg`,
            } as CSSProperties
          }
        />
      ))}
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
  const [confettiEnabled, setConfettiEnabled] = React.useState(true);
  const [confettiCount, setConfettiCount] = React.useState(80);
  const [confettiDuration, setConfettiDuration] = React.useState(3);
  const [confettiSize, setConfettiSize] = React.useState(9);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="SourceRouteStory-main-0"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.confettiEnabled === "boolean") setConfettiEnabled(p.confettiEnabled);
      if (typeof p.confettiCount === "number") setConfettiCount(p.confettiCount);
      if (typeof p.confettiDuration === "number") setConfettiDuration(p.confettiDuration);
      if (typeof p.confettiSize === "number") setConfettiSize(p.confettiSize);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  return (
    <div className="h-screen">
      {confettiEnabled && (
        <ConfettiBurst count={confettiCount} duration={confettiDuration} pieceSize={confettiSize} />
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
