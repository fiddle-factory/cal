import React, { useState } from "react";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Badge } from "@calcom/ui/components/badge";
import { Button } from "@calcom/ui/components/button";

const successCheckAnimationCss = `
@keyframes cal-success-badge-pop {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(var(--cal-success-overshoot, 1.15)); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes cal-success-tick-draw {
  from { stroke-dashoffset: 1; }
  to { stroke-dashoffset: 0; }
}
.cal-success-badge {
  animation: cal-success-badge-pop var(--cal-success-pop-duration, 450ms) cubic-bezier(0.34, 1.2, 0.64, 1) both;
}
.cal-success-tick path {
  stroke-dasharray: 1;
  stroke-dashoffset: 0;
  animation: cal-success-tick-draw var(--cal-success-draw-duration, 400ms) ease-out
    var(--cal-success-draw-delay, 250ms) both;
}
@media (prefers-reduced-motion: reduce) {
  .cal-success-badge,
  .cal-success-tick path {
    animation: none;
  }
}
`;

export interface DecoyBookingSuccessCardProps {
  uid?: string | null;
  title: string;
  /** ISO 8601 start time, used for calendar actions */
  startTimeISO?: string | null;
  /** ISO 8601 end time, used for calendar actions */
  endTimeISO?: string | null;
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

const toUtcStamp = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

const escapeIcsText = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");

// RFC 5545: content lines should not exceed 75 octets; continuation lines start with a space
const foldIcsLine = (line: string) => {
  const chunks: string[] = [];
  let rest = line;
  while (rest.length > 75) {
    chunks.push(rest.slice(0, 75));
    rest = ` ${rest.slice(75)}`;
  }
  chunks.push(rest);
  return chunks.join("\r\n");
};

interface CalendarEventData {
  uid: string;
  title: string;
  start: Date;
  end: Date;
  description: string;
  location: string;
}

const buildGoogleCalendarUrl = (event: CalendarEventData) => {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${toUtcStamp(event.start)}/${toUtcStamp(event.end)}`,
    details: event.description,
  });
  if (event.location) params.set("location", event.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

const buildIcs = (event: CalendarEventData) => {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Cal.com//Booking Confirmation//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${toUtcStamp(new Date())}`,
    `DTSTART:${toUtcStamp(event.start)}`,
    `DTEND:${toUtcStamp(event.end)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
    `LOCATION:${escapeIcsText(event.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `${lines.map(foldIcsLine).join("\r\n")}\r\n`;
};

const downloadIcs = (event: CalendarEventData) => {
  const blob = new Blob([buildIcs(event)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const safeName = event.title.replace(/[^a-z0-9-_ ]/gi, "").trim().replace(/\s+/g, "-") || "invite";
  link.download = `${safeName}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

export function DecoyBookingSuccessCard({
  uid,
  title,
  startTimeISO,
  endTimeISO,
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
  const [popDuration, setPopDuration] = useState(450);
  const [popOvershoot, setPopOvershoot] = useState(1.15);
  const [drawDuration, setDrawDuration] = useState(400);
  const [drawDelay, setDrawDelay] = useState(250);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="SourceRouteStory-main-0"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.popDuration === "number") setPopDuration(p.popDuration);
      if (typeof p.popOvershoot === "number") setPopOvershoot(p.popOvershoot);
      if (typeof p.drawDuration === "number") setDrawDuration(p.drawDuration);
      if (typeof p.drawDelay === "number") setDrawDelay(p.drawDelay);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const start = startTimeISO ? new Date(startTimeISO) : null;
  const end = endTimeISO ? new Date(endTimeISO) : null;
  const hasValidTimes =
    !!start && !!end && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime());

  const calendarEvent: CalendarEventData | null =
    hasValidTimes && start && end
      ? {
          uid: `${uid || `${start.getTime()}-${title}`.replace(/\s+/g, "-")}@cal.com`,
          title,
          start,
          end,
          description: [
            title,
            hostName ? `${t("Host")}: ${hostName}${hostEmail ? ` <${hostEmail}>` : ""}` : null,
            attendeeName ? `${attendeeName}${attendeeEmail ? ` <${attendeeEmail}>` : ""}` : null,
          ]
            .filter(Boolean)
            .join("\n"),
          location: location || "",
        }
      : null;

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
                <div>
                  <style>{successCheckAnimationCss}</style>
                  <div
                    // Remount on tuning so the entrance replays with the new timing
                    key={`${popDuration}-${popOvershoot}-${drawDuration}-${drawDelay}`}
                    className="cal-success-badge bg-cal-success mx-auto flex h-12 w-12 items-center justify-center rounded-full"
                    style={
                      {
                        "--cal-success-pop-duration": `${popDuration}ms`,
                        "--cal-success-overshoot": popOvershoot,
                        "--cal-success-draw-duration": `${drawDuration}ms`,
                        "--cal-success-draw-delay": `${drawDelay}ms`,
                      } as React.CSSProperties
                    }>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="cal-success-tick h-5 w-5 text-green-600 dark:text-green-400"
                      aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" pathLength={1} />
                    </svg>
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

                  {calendarEvent && (
                    <div className="border-subtle mt-8 flex flex-col gap-2 border-t pt-8 sm:flex-row sm:justify-center">
                      <Button
                        color="secondary"
                        StartIcon="calendar"
                        href={buildGoogleCalendarUrl(calendarEvent)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="justify-center">
                        {t("add_to_google_calendar")}
                      </Button>
                      <Button
                        color="secondary"
                        StartIcon="download"
                        onClick={() => downloadIcs(calendarEvent)}
                        className="justify-center">
                        {t("download_ics_invite")}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
