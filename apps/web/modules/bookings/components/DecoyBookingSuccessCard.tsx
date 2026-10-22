import React, { useEffect, useMemo, useRef, useState } from "react";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Badge } from "@calcom/ui/components/badge";
import { Button } from "@calcom/ui/components/button";
import { Dialog, DialogClose, DialogContent, DialogFooter } from "@calcom/ui/components/dialog";
import { Icon } from "@calcom/ui/components/icon";

type CalendarProvider = {
  id: "google" | "outlook" | "ics";
  label: string;
  href: string;
  download?: string;
  icon: JSX.Element;
};

function getCalendarProviders(title: string, details: string): CalendarProvider[] {
  const text = encodeURIComponent(title);
  const body = encodeURIComponent(details);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Cal.com//Booking//EN",
    "BEGIN:VEVENT",
    `SUMMARY:${title}`,
    `DESCRIPTION:${details}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return [
    {
      id: "google",
      label: "Google Calendar",
      href: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${body}`,
      icon: (
        <svg className="h-4 w-4" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <title>Google</title>
          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
        </svg>
      ),
    },
    {
      id: "outlook",
      label: "Outlook",
      href: `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${text}&body=${body}`,
      icon: (
        <svg className="h-4 w-4" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <title>Microsoft Outlook</title>
          <path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.5V2.55q0-.44.3-.75.3-.3.75-.3h12.9q.44 0 .75.3.3.3.3.75V10.85l1.24.72h.01q.1.07.18.18.07.12.07.25zm-6-8.25v3h3v-3zm0 4.5v3h3v-3zm0 4.5v1.83l3.05-1.83zm-5.25-9v3h3.75v-3zm0 4.5v3h3.75v-3zm0 4.5v2.03l2.41 1.5 1.34-.8v-2.73zM9 3.75V6h2l.13.01.12.04v-2.3zM5.98 15.98q.9 0 1.6-.3.7-.32 1.19-.86.48-.55.73-1.28.25-.74.25-1.61 0-.83-.25-1.55-.24-.71-.71-1.24t-1.15-.83q-.68-.3-1.55-.3-.92 0-1.64.3-.71.3-1.2.85-.5.54-.75 1.3-.25.74-.25 1.63 0 .85.26 1.56.26.72.74 1.23.48.52 1.17.81.69.3 1.56.3zM7.5 21h12.39L12 16.08V17q0 .41-.3.7-.29.3-.7.3H7.5zm15-.13v-7.24l-5.9 3.54Z" />
        </svg>
      ),
    },
    {
      id: "ics",
      label: "Apple Calendar (.ics)",
      href: `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`,
      download: `${title}.ics`,
      icon: <Icon name="calendar" className="h-4 w-4" />,
    },
  ];
}

const CONFETTI_COLORS = [
  "var(--cal-bg-visualization-1-emphasis)",
  "var(--cal-bg-visualization-2-emphasis)",
  "var(--cal-bg-visualization-3-emphasis)",
  "var(--cal-bg-visualization-4-emphasis)",
  "var(--cal-bg-visualization-5-emphasis)",
  "var(--cal-bg-visualization-6-emphasis)",
  "var(--cal-bg-visualization-7-emphasis)",
];

type ConfettiPiece = {
  id: number;
  color: string;
  shape: "rect" | "circle";
  angle: number;
  velocity: number;
  rotation: number;
  delay: number;
  scale: number;
};

function createConfettiPieces(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    color: CONFETTI_COLORS[id % CONFETTI_COLORS.length],
    shape: id % 3 === 0 ? "circle" : "rect",
    // Launch upward in a fan between ~20° and ~160°.
    angle: (20 + Math.random() * 140) * (Math.PI / 180),
    velocity: 0.5 + Math.random() * 0.5,
    rotation: (Math.random() - 0.5) * 1440,
    delay: Math.random() * 250,
    scale: 0.7 + Math.random() * 0.6,
  }));
}

interface ConfettiBurstProps {
  count: number;
  duration: number;
  size: number;
  spread: number;
}

function ConfettiBurst({ count, duration, size, spread }: ConfettiBurstProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pieces = useMemo(() => createConfettiPieces(count), [count]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof container.animate !== "function") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const height = window.innerHeight;
    const animations = Array.from(container.children).map((node, index) => {
      const piece = pieces[index];
      const dx = Math.cos(piece.angle) * piece.velocity * spread;
      const peakY = -Math.sin(piece.angle) * piece.velocity * spread * 0.6;
      const fallY = height * (0.6 + piece.velocity * 0.4);
      return (node as HTMLElement).animate(
        [
          { transform: "translate(0px, 0px) rotate(0deg)", opacity: 1 },
          {
            transform: `translate(${dx * 0.7}px, ${peakY}px) rotate(${piece.rotation * 0.3}deg)`,
            opacity: 1,
            offset: 0.25,
            easing: "ease-in",
          },
          {
            transform: `translate(${dx}px, ${fallY}px) rotate(${piece.rotation}deg)`,
            opacity: 0,
          },
        ],
        { duration, delay: piece.delay, easing: "cubic-bezier(0.2, 0.6, 0.4, 1)", fill: "both" }
      );
    });

    return () => animations.forEach((animation) => animation.cancel());
  }, [pieces, duration, spread]);

  return (
    <div ref={containerRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="absolute"
          style={{
            left: "50%",
            top: "22%",
            opacity: 0,
            width: size * piece.scale,
            height: piece.shape === "circle" ? size * piece.scale : size * piece.scale * 0.45,
            borderRadius: piece.shape === "circle" ? "9999px" : "1px",
            backgroundColor: piece.color,
          }}
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
  /** Opens the "Add to calendar" picker on first render. */
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
  defaultCalendarPickerOpen = false,
}: DecoyBookingSuccessCardProps) {
  const { t } = useLocale();
  const [isCalendarPickerOpen, setIsCalendarPickerOpen] = useState(defaultCalendarPickerOpen);
  const [confettiEnabled, setConfettiEnabled] = useState(true);
  const [confettiCount, setConfettiCount] = useState(80);
  const [confettiDuration, setConfettiDuration] = useState(2800);
  const [confettiSize, setConfettiSize] = useState(10);
  const [confettiSpread, setConfettiSpread] = useState(420);

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
      if (typeof p.confettiSpread === "number") setConfettiSpread(p.confettiSpread);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const calendarProviders = getCalendarProviders(
    title,
    [formattedDate, formattedTime && `${formattedTime}${endTime ? ` - ${endTime}` : ""}`, formattedTimeZone]
      .filter(Boolean)
      .join(" ")
  );

  return (
    <div className="h-screen">
      {confettiEnabled && (
        <ConfettiBurst
          count={confettiCount}
          duration={confettiDuration}
          size={confettiSize}
          spread={confettiSpread}
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

                  <hr className="border-subtle mt-8" />
                  <div className="flex justify-center pt-8">
                    <Button
                      color="secondary"
                      StartIcon="calendar"
                      data-testid="add-to-calendar"
                      onClick={() => setIsCalendarPickerOpen(true)}>
                      {t("add_to_calendar")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={isCalendarPickerOpen} onOpenChange={setIsCalendarPickerOpen}>
        <DialogContent title={t("add_to_calendar")} description={t("choose_your_calendar_app")}>
          <ul className="flex flex-col gap-2">
            {calendarProviders.map((provider) => (
              <li key={provider.id}>
                <a
                  href={provider.href}
                  download={provider.download}
                  target={provider.download ? undefined : "_blank"}
                  rel={provider.download ? undefined : "noreferrer"}
                  data-testid={`add-to-calendar-${provider.id}`}
                  onClick={() => setIsCalendarPickerOpen(false)}
                  className="border-subtle text-default hover:bg-cal-muted flex items-center gap-3 rounded-md border px-4 py-3 text-sm font-medium transition-colors">
                  <span className="bg-subtle text-emphasis flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
                    {provider.icon}
                  </span>
                  <span className="grow">{provider.label}</span>
                  <Icon
                    name={provider.download ? "download" : "external-link"}
                    className="text-subtle h-4 w-4"
                  />
                </a>
              </li>
            ))}
          </ul>
          <DialogFooter>
            <DialogClose />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
