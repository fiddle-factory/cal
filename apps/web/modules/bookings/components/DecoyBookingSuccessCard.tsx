import React from "react";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Badge } from "@calcom/ui/components/badge";
import { Button } from "@calcom/ui/components/button";
import { Dialog, DialogClose, DialogContent, DialogFooter } from "@calcom/ui/components/dialog";
import { Icon } from "@calcom/ui/components/icon";

// Design-system tokens used for the confetti pieces (resolve per light/dark theme).
const CONFETTI_COLORS = [
  "var(--cal-bg-semantic-success-emphasis)",
  "var(--cal-bg-semantic-info-emphasis)",
  "var(--cal-bg-semantic-attention-emphasis)",
  "var(--cal-bg-semantic-error-emphasis)",
  "var(--cal-bg-brand)",
  "var(--cal-bg-info)",
];

const CONFETTI_KEYFRAMES = `
@keyframes cal-confetti-fall {
  0% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 0; }
  8% { opacity: 1; }
  80% { opacity: 1; }
  100% { transform: translate3d(var(--confetti-drift), var(--confetti-fall), 0) rotate(var(--confetti-spin)); opacity: 0; }
}
@keyframes cal-confetti-flutter {
  0%, 100% { transform: rotateX(0deg) scaleY(1); }
  50% { transform: rotateX(70deg) scaleY(0.6); }
}
`;

// Deterministic pseudo-random generator so pieces are stable across renders.
function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function ConfettiBurst({ count, duration, spread }: { count: number; duration: number; spread: number }) {
  const pieces = React.useMemo(() => {
    const random = seededRandom(42);
    return Array.from({ length: count }, (_, i) => {
      const width = 6 + random() * 6;
      return {
        id: i,
        left: 50 + (random() - 0.5) * spread,
        drift: (random() - 0.5) * 220,
        spin: (random() > 0.5 ? 1 : -1) * (360 + random() * 540),
        delay: random() * duration * 0.35,
        fallDuration: duration * (0.65 + random() * 0.35),
        flutter: 0.4 + random() * 0.5,
        width,
        height: random() > 0.3 ? width * 0.45 : width,
        round: random() > 0.75,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      };
    });
  }, [count, duration, spread]);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden motion-reduce:hidden" aria-hidden="true">
      <style>{CONFETTI_KEYFRAMES}</style>
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="absolute -top-4 block"
          style={
            {
              left: `${piece.left}%`,
              "--confetti-drift": `${piece.drift}px`,
              "--confetti-fall": "calc(100vh + 2rem)",
              "--confetti-spin": `${piece.spin}deg`,
              animation: `cal-confetti-fall ${piece.fallDuration}s cubic-bezier(0.25, 0.6, 0.45, 1) ${piece.delay}s both`,
            } as React.CSSProperties
          }>
          <span
            className="block"
            style={{
              width: piece.width,
              height: piece.height,
              backgroundColor: piece.color,
              borderRadius: piece.round ? "9999px" : "1px",
              animation: `cal-confetti-flutter ${piece.flutter}s ease-in-out ${piece.delay}s infinite`,
            }}
          />
        </span>
      ))}
    </div>
  );
}

/** Same shape as the entries returned by `getCalendarLinks` (@calcom/features/bookings/lib/getCalendarLinks). */
export interface BookingCalendarLink {
  id: string;
  label: string;
  link: string;
}

const CALENDAR_PICKER_LABELS: Record<string, string> = {
  googleCalendar: "Google Calendar",
  microsoftOutlook: "Outlook.com",
  microsoftOffice: "Microsoft 365 / Outlook",
  ics: "Apple Calendar / iCal / Other",
};

function AddToCalendarDialog({
  open,
  onOpenChange,
  calendarLinks,
  title,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calendarLinks: BookingCalendarLink[];
  title: string;
}) {
  const { t } = useLocale();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={t("add_to_calendar")} description={t("choose_calendar_to_add_event")}>
        <ul className="flex flex-col gap-2" data-testid="add-to-calendar-options">
          {calendarLinks
            .filter((calendarLink) => !!calendarLink.link)
            .map((calendarLink) => {
              const isIcs = calendarLink.id === "ics";
              return (
                <li key={calendarLink.id}>
                  <a
                    href={calendarLink.link}
                    {...(isIcs
                      ? { download: `${title}.ics` }
                      : { target: "_blank", rel: "noopener noreferrer" })}
                    className="border-subtle text-emphasis hover:bg-subtle focus-visible:ring-brand-default flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2">
                    <span className="bg-cal-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
                      <Icon name="calendar" className="text-default h-4 w-4" />
                    </span>
                    <span className="grow">{CALENDAR_PICKER_LABELS[calendarLink.id] ?? calendarLink.label}</span>
                    <Icon name={isIcs ? "download" : "external-link"} className="text-subtle h-4 w-4" />
                  </a>
                </li>
              );
            })}
        </ul>
        <DialogFooter noSticky>
          <DialogClose />
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
  /** Links for the "Add to calendar" picker. The button is hidden when no links are provided. */
  calendarLinks?: BookingCalendarLink[];
  /** Opens the calendar picker on first render. */
  defaultCalendarPickerOpen?: boolean;
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
  calendarLinks,
  defaultCalendarPickerOpen = false,
}: DecoyBookingSuccessCardProps) {
  const { t } = useLocale();
  const [isCalendarPickerOpen, setIsCalendarPickerOpen] = React.useState(defaultCalendarPickerOpen);
  const hasCalendarLinks = !!calendarLinks?.some((calendarLink) => !!calendarLink.link);
  const [confettiEnabled, setConfettiEnabled] = React.useState(true);
  const [confettiCount, setConfettiCount] = React.useState(80);
  const [confettiDuration, setConfettiDuration] = React.useState(3);
  const [confettiSpread, setConfettiSpread] = React.useState(90);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="SourceRouteStory-main-0"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.confettiEnabled === "boolean") setConfettiEnabled(p.confettiEnabled);
      if (typeof p.confettiCount === "number") setConfettiCount(p.confettiCount);
      if (typeof p.confettiDuration === "number") setConfettiDuration(p.confettiDuration);
      if (typeof p.confettiSpread === "number") setConfettiSpread(p.confettiSpread);
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
                className="bg-default dark:bg-cal-muted border-booker border-booker-width relative inline-block transform overflow-hidden rounded-lg px-8 pb-4 pt-5 text-left align-bottom transition-all sm:my-8 sm:w-full sm:max-w-xl sm:py-8 sm:align-middle"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline">
                {confettiEnabled && (
                  <ConfettiBurst
                    key={`${confettiCount}-${confettiDuration}-${confettiSpread}`}
                    count={confettiCount}
                    duration={confettiDuration}
                    spread={confettiSpread}
                  />
                )}
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

                  {hasCalendarLinks && (
                    <div className="border-subtle mt-8 flex justify-center border-t pt-8">
                      <Button
                        color="secondary"
                        StartIcon="calendar"
                        data-testid="add-to-calendar-button"
                        onClick={() => setIsCalendarPickerOpen(true)}>
                        {t("add_to_calendar")}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              {hasCalendarLinks && calendarLinks && (
                <AddToCalendarDialog
                  open={isCalendarPickerOpen}
                  onOpenChange={setIsCalendarPickerOpen}
                  calendarLinks={calendarLinks}
                  title={title}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
