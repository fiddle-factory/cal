import { useState } from "react";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Badge } from "@calcom/ui/components/badge";
import { Button } from "@calcom/ui/components/button";
import { Dialog, DialogClose, DialogContent, DialogFooter } from "@calcom/ui/components/dialog";
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
  /** ISO 8601 start of the booking, used for calendar links and the .ics invite */
  startTimeISO?: string | null;
  /** ISO 8601 end of the booking, used for calendar links and the .ics invite */
  endTimeISO?: string | null;
  /** Controlled open state of the calendar picker dialog */
  isCalendarPickerOpen?: boolean;
  /** Initial open state of the calendar picker dialog when uncontrolled */
  defaultCalendarPickerOpen?: boolean;
  onCalendarPickerOpenChange?: (open: boolean) => void;
}

const toICSDate = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

const escapeICSText = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

type CalendarEventDetails = {
  title: string;
  start: Date;
  end: Date;
  location: string | null;
  description: string;
  hostName: string | null;
  hostEmail: string | null;
  attendeeName: string | null;
  attendeeEmail: string | null;
};

const buildICSFile = (event: CalendarEventDetails) => {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Cal.com//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${toICSDate(event.start)}-${encodeURIComponent(event.title)}@cal.com`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(event.start)}`,
    `DTEND:${toICSDate(event.end)}`,
    `SUMMARY:${escapeICSText(event.title)}`,
    `DESCRIPTION:${escapeICSText(event.description)}`,
  ];
  if (event.location) lines.push(`LOCATION:${escapeICSText(event.location)}`);
  if (event.hostEmail) {
    lines.push(`ORGANIZER;CN=${escapeICSText(event.hostName ?? event.hostEmail)}:mailto:${event.hostEmail}`);
  }
  if (event.attendeeEmail) {
    lines.push(
      `ATTENDEE;CN=${escapeICSText(event.attendeeName ?? event.attendeeEmail)};ROLE=REQ-PARTICIPANT:mailto:${
        event.attendeeEmail
      }`
    );
  }
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
};

const downloadICSFile = (event: CalendarEventDetails) => {
  const blob = new Blob([buildICSFile(event)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${event.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "booking"}.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

const buildGoogleCalendarLink = (event: CalendarEventDetails) => {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${toICSDate(event.start)}/${toICSDate(event.end)}`,
    details: event.description,
  });
  if (event.location) params.set("location", event.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

const buildOutlookLink = (event: CalendarEventDetails) => {
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: event.title,
    startdt: event.start.toISOString(),
    enddt: event.end.toISOString(),
    body: event.description,
  });
  if (event.location) params.set("location", event.location);
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
};

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
  startTimeISO,
  endTimeISO,
  isCalendarPickerOpen,
  defaultCalendarPickerOpen = false,
  onCalendarPickerOpenChange,
}: DecoyBookingSuccessCardProps) {
  const { t } = useLocale();
  const [internalPickerOpen, setInternalPickerOpen] = useState(defaultCalendarPickerOpen);
  const pickerOpen = isCalendarPickerOpen ?? internalPickerOpen;
  const setPickerOpen = (open: boolean) => {
    setInternalPickerOpen(open);
    onCalendarPickerOpenChange?.(open);
  };

  const start = startTimeISO ? new Date(startTimeISO) : null;
  const end = endTimeISO ? new Date(endTimeISO) : null;
  const calendarEvent: CalendarEventDetails | null =
    start && end && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())
      ? {
          title,
          start,
          end,
          location,
          description: [hostName && `${t("Host")}: ${hostName}`, attendeeName].filter(Boolean).join("\n"),
          hostName,
          hostEmail,
          attendeeName,
          attendeeEmail,
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

                  {calendarEvent && (
                    <>
                      <hr className="border-subtle mt-8" />
                      <div className="flex justify-center pt-8">
                        <Button
                          color="secondary"
                          StartIcon="calendar"
                          data-testid="add-to-calendar-button"
                          onClick={() => setPickerOpen(true)}>
                          {t("add_to_calendar")}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {calendarEvent && (
        <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
          <DialogContent title={t("add_to_calendar")} description={title}>
            <div className="flex flex-col gap-2" data-testid="calendar-picker-options">
              <Button
                color="secondary"
                className="w-full"
                StartIcon="calendar"
                EndIcon="external-link"
                href={buildGoogleCalendarLink(calendarEvent)}
                target="_blank"
                rel="noopener noreferrer">
                <span className="grow text-left">Google Calendar</span>
              </Button>
              <Button
                color="secondary"
                className="w-full"
                StartIcon="calendar"
                EndIcon="external-link"
                href={buildOutlookLink(calendarEvent)}
                target="_blank"
                rel="noopener noreferrer">
                <span className="grow text-left">Outlook</span>
              </Button>
              <Button
                color="secondary"
                className="w-full"
                StartIcon="calendar"
                onClick={() => downloadICSFile(calendarEvent)}>
                <span className="grow text-left">Apple Calendar</span>
              </Button>
              <Button
                color="secondary"
                className="w-full"
                StartIcon="download"
                data-testid="download-ics-button"
                onClick={() => downloadICSFile(calendarEvent)}>
                <span className="grow text-left">{t("download_calendar_invite")} (.ics)</span>
              </Button>
            </div>
            <DialogFooter>
              <DialogClose />
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
