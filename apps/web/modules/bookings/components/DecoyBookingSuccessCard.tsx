import { useMemo, useState } from "react";

import { getCalendarLinks } from "@calcom/features/bookings/lib/getCalendarLinks";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Badge } from "@calcom/ui/components/badge";
import { Button } from "@calcom/ui/components/button";
import { Dialog, DialogClose, DialogContent, DialogFooter } from "@calcom/ui/components/dialog";
import { Icon } from "@calcom/ui/components/icon";

const CALENDAR_PICKER_LABELS: Record<string, string> = {
  googleCalendar: "Google Calendar",
  microsoftOutlook: "Outlook.com",
  microsoftOffice: "Microsoft 365 / Office",
  ics: "Apple Calendar / Other (.ics)",
};

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
  /** ISO start time, used to build "Add to calendar" links */
  startTimeISO?: string | null;
  /** ISO end time, used to build "Add to calendar" links */
  endTimeISO?: string | null;
  /** Opens the calendar picker on first render */
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
  startTimeISO,
  endTimeISO,
  defaultCalendarPickerOpen = false,
}: DecoyBookingSuccessCardProps) {
  const { t } = useLocale();
  const [isCalendarPickerOpen, setIsCalendarPickerOpen] = useState(defaultCalendarPickerOpen);

  const calendarLinks = useMemo(() => {
    if (!startTimeISO || !endTimeISO) return [];
    const start = new Date(startTimeISO);
    const end = new Date(endTimeISO);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];
    return getCalendarLinks({
      booking: {
        startTime: start,
        endTime: end,
        location,
        title,
        responses: { name: attendeeName ?? "" },
        metadata: null,
      },
      eventType: {
        recurringEvent: null,
        eventName: title,
        isDynamic: false,
        length: Math.round((end.getTime() - start.getTime()) / 60000),
        users: [{ name: hostName }],
        title,
      },
      t,
    }).filter((calendarLink) => !!calendarLink.link);
  }, [startTimeISO, endTimeISO, location, title, attendeeName, hostName, t]);

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
                  <h3 className="text-emphasis text-5xl font-semibold leading-6" id="modal-headline">
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
                {calendarLinks.length > 0 && (
                  <>
                    <hr className="border-subtle" />
                    <div className="flex justify-center pt-8">
                      <Button
                        color="secondary"
                        StartIcon="calendar"
                        data-testid="add-to-calendar-button"
                        onClick={() => setIsCalendarPickerOpen(true)}>
                        {t("add_to_calendar")}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Dialog open={isCalendarPickerOpen} onOpenChange={setIsCalendarPickerOpen}>
        <DialogContent
          title={t("add_to_calendar")}
          description={t("choose_a_calendar_to_add_this_event_to")}
          data-testid="calendar-picker-dialog">
          <div className="flex flex-col gap-2">
            {calendarLinks.map((calendarLink) => (
              <Button
                key={calendarLink.id}
                href={calendarLink.link}
                color="secondary"
                StartIcon={calendarLink.id === "ics" ? "download" : "calendar-days"}
                className="w-full justify-start"
                data-testid={`calendar-picker-${calendarLink.id}`}
                {...(calendarLink.id === "ics"
                  ? { download: `${title}.ics` }
                  : { target: "_blank", rel: "noopener noreferrer" })}
                onClick={() => setIsCalendarPickerOpen(false)}>
                {CALENDAR_PICKER_LABELS[calendarLink.id] ?? calendarLink.label}
              </Button>
            ))}
          </div>
          <DialogFooter>
            <DialogClose />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
