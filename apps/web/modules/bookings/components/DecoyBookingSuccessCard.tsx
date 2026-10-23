import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Badge } from "@calcom/ui/components/badge";
import { Button } from "@calcom/ui/components/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from "@calcom/ui/components/dialog";
import { Icon } from "@calcom/ui/components/icon";
import type { ReactNode } from "react";

export interface DecoyBookingCalendarLinks {
  google?: string;
  apple?: string;
  outlook?: string;
  office?: string;
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
  /** Optional per-provider links for the "Add to calendar" picker. */
  calendarLinks?: DecoyBookingCalendarLinks;
  /** Opens the calendar picker on first render. */
  defaultCalendarPickerOpen?: boolean;
}

const brandIconClassName = "h-4 w-4 shrink-0";

const GoogleIcon = () => (
  <svg className={brandIconClassName} fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <title>Google</title>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
  </svg>
);

const OutlookIcon = () => (
  <svg className={brandIconClassName} fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <title>Microsoft Outlook</title>
    <path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.5V2.55q0-.44.3-.75.3-.3.75-.3h12.9q.44 0 .75.3.3.3.3.75V10.85l1.24.72h.01q.1.07.18.18.07.12.07.25zm-6-8.25v3h3v-3zm0 4.5v3h3v-3zm0 4.5v1.83l3.05-1.83zm-5.25-9v3h3.75v-3zm0 4.5v3h3.75v-3zm0 4.5v2.03l2.41 1.5 1.34-.8v-2.73zM9 3.75V6h2l.13.01.12.04v-2.3zM5.98 15.98q.9 0 1.6-.3.7-.32 1.19-.86.48-.55.73-1.28.25-.74.25-1.61 0-.83-.25-1.55-.24-.71-.71-1.24t-1.15-.83q-.68-.3-1.55-.3-.92 0-1.64.3-.71.3-1.2.85-.5.54-.75 1.3-.25.74-.25 1.63 0 .85.26 1.56.26.72.74 1.23.48.52 1.17.81.69.3 1.56.3zM7.5 21h12.39L12 16.08V17q0 .41-.3.7-.29.3-.7.3H7.5zm15-.13v-7.24l-5.9 3.54Z" />
  </svg>
);

const OfficeIcon = () => (
  <svg className={brandIconClassName} fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <title>Microsoft Office</title>
    <path d="M21.53 4.306v15.363q0 .807-.472 1.433-.472.627-1.253.85l-6.888 1.974q-.136.037-.29.055-.156.019-.293.019-.396 0-.72-.105-.321-.106-.656-.292l-4.505-2.544q-.248-.137-.391-.366-.143-.23-.143-.515 0-.434.304-.738.304-.305.739-.305h5.831V4.964l-4.38 1.563q-.533.187-.856.658-.322.472-.322 1.03v8.078q0 .496-.248.912-.25.416-.683.651l-2.072 1.13q-.286.148-.571.148-.497 0-.844-.347-.348-.347-.348-.844V6.563q0-.62.33-1.19.328-.571.874-.881L11.07.285q.248-.136.534-.21.285-.075.57-.075.211 0 .38.031.166.031.364.093l6.888 1.899q.384.11.7.329.317.217.547.52.23.305.353.67.125.367.125.764zm-1.588 15.363V4.306q0-.273-.16-.478-.163-.204-.423-.28l-3.388-.93q-.397-.111-.794-.23-.397-.117-.794-.216v19.68l4.976-1.427q.26-.074.422-.28.161-.204.161-.477z" />
  </svg>
);

type CalendarOption = {
  id: keyof DecoyBookingCalendarLinks;
  label: string;
  icon: ReactNode;
};

function AddToCalendarDialog({
  title,
  calendarLinks,
  defaultOpen,
}: {
  title: string;
  calendarLinks?: DecoyBookingCalendarLinks;
  defaultOpen?: boolean;
}) {
  const { t } = useLocale();
  const options: CalendarOption[] = [
    { id: "google", label: "Google Calendar", icon: <GoogleIcon /> },
    { id: "apple", label: "Apple Calendar (iCal)", icon: <Icon name="download" className={brandIconClassName} /> },
    { id: "outlook", label: "Microsoft Outlook", icon: <OutlookIcon /> },
    { id: "office", label: "Microsoft Office 365", icon: <OfficeIcon /> },
  ];

  return (
    <Dialog defaultOpen={defaultOpen}>
      <DialogTrigger asChild>
        <Button color="secondary" StartIcon="calendar" data-testid="add-to-calendar-button">
          {t("add_to_calendar")}
        </Button>
      </DialogTrigger>
      <DialogContent title={t("add_to_calendar")} description={t("add_to_calendar_picker_description")}>
        <ul className="flex flex-col gap-2" data-testid="add-to-calendar-options">
          {options.map((option) => {
            const href = calendarLinks?.[option.id];
            return (
              <li key={option.id}>
                {href ? (
                  <Button
                    color="secondary"
                    size="lg"
                    className="w-full"
                    CustomStartIcon={option.icon}
                    EndIcon="chevron-right"
                    href={href}
                    target={option.id === "apple" ? undefined : "_blank"}
                    download={option.id === "apple" ? `${title}.ics` : undefined}>
                    <span className="grow text-left">{option.label}</span>
                  </Button>
                ) : (
                  <DialogClose
                    color="secondary"
                    size="lg"
                    className="w-full"
                    data-testid={`add-to-calendar-${option.id}`}
                    CustomStartIcon={option.icon}
                    EndIcon="chevron-right">
                    <span className="grow text-left">{option.label}</span>
                  </DialogClose>
                )}
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
  defaultCalendarPickerOpen,
}: DecoyBookingSuccessCardProps) {
  const { t } = useLocale();

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

                  <div className="border-subtle mt-8 flex justify-center border-t pt-8">
                    <AddToCalendarDialog
                      title={title}
                      calendarLinks={calendarLinks}
                      defaultOpen={defaultCalendarPickerOpen}
                    />
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
