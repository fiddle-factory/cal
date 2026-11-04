"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { CalendarLinkType } from "@calcom/features/bookings/lib/getCalendarLinks";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button } from "@calcom/ui/components/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from "@calcom/ui/components/dialog";
import { Icon } from "@calcom/ui/components/icon";

type CalendarLink = {
  id: CalendarLinkType;
  label: string;
  link: string;
};

type AddToCalendarDialogProps = {
  calendarLinks: CalendarLink[];
  eventTitle: string;
  defaultOpen?: boolean;
};

const GoogleIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <title>Google</title>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
  </svg>
);

const OutlookIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <title>Microsoft Outlook</title>
    <path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.5V2.55q0-.44.3-.75.3-.3.75-.3h12.9q.44 0 .75.3.3.3.3.75V10.85l1.24.72h.01q.1.07.18.18.07.12.07.25zm-6-8.25v3h3v-3zm0 4.5v3h3v-3zm0 4.5v1.83l3.05-1.83zm-5.25-9v3h3.75v-3zm0 4.5v3h3.75v-3zm0 4.5v2.03l2.41 1.5 1.34-.8v-2.73zM9 3.75V6h2l.13.01.12.04v-2.3zM5.98 15.98q.9 0 1.6-.3.7-.32 1.19-.86.48-.55.73-1.28.25-.74.25-1.61 0-.83-.25-1.55-.24-.71-.71-1.24t-1.15-.83q-.68-.3-1.55-.3-.92 0-1.64.3-.71.3-1.2.85-.5.54-.75 1.3-.25.74-.25 1.63 0 .85.26 1.56.26.72.74 1.23.48.52 1.17.81.69.3 1.56.3zM7.5 21h12.39L12 16.08V17q0 .41-.3.7-.29.3-.7.3H7.5zm15-.13v-7.24l-5.9 3.54Z" />
  </svg>
);

const OfficeIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <title>Microsoft Office</title>
    <path d="M21.53 4.306v15.363q0 .807-.472 1.433-.472.627-1.253.85l-6.888 1.974q-.136.037-.29.055-.156.019-.293.019-.396 0-.72-.105-.321-.106-.656-.292l-4.505-2.544q-.248-.137-.391-.366-.143-.23-.143-.515 0-.434.304-.738.304-.305.739-.305h5.831V4.964l-4.38 1.563q-.533.187-.856.658-.322.472-.322 1.03v8.078q0 .496-.248.912-.25.416-.683.651l-2.072 1.13q-.286.148-.571.148-.497 0-.844-.347-.348-.347-.348-.844V6.563q0-.62.33-1.19.328-.571.874-.881L11.07.285q.248-.136.534-.21.285-.075.57-.075.211 0 .38.031.166.031.364.093l6.888 1.899q.384.11.7.329.317.217.547.52.23.305.353.67.125.367.125.764zm-1.588 15.363V4.306q0-.273-.16-.478-.163-.204-.423-.28l-3.388-.93q-.397-.111-.794-.23-.397-.117-.794-.216v19.68l4.976-1.427q.26-.074.422-.28.161-.204.161-.477z" />
  </svg>
);

const OPTION_CONFIG: Record<
  CalendarLinkType,
  { labelKey: string; descriptionKey: string; icon: ReactNode; isDownload: boolean }
> = {
  [CalendarLinkType.GOOGLE_CALENDAR]: {
    labelKey: "google_calendar",
    descriptionKey: "add_to_calendar_google_description",
    icon: <GoogleIcon />,
    isDownload: false,
  },
  [CalendarLinkType.MICROSOFT_OUTLOOK]: {
    labelKey: "outlook_calendar",
    descriptionKey: "add_to_calendar_outlook_description",
    icon: <OutlookIcon />,
    isDownload: false,
  },
  [CalendarLinkType.MICROSOFT_OFFICE]: {
    labelKey: "office_365_calendar",
    descriptionKey: "add_to_calendar_office_description",
    icon: <OfficeIcon />,
    isDownload: false,
  },
  [CalendarLinkType.ICS]: {
    labelKey: "apple_calendar_ics",
    descriptionKey: "add_to_calendar_ics_description",
    icon: <Icon name="calendar" className="h-4 w-4" />,
    isDownload: true,
  },
};

const OPTION_ORDER: CalendarLinkType[] = [
  CalendarLinkType.GOOGLE_CALENDAR,
  CalendarLinkType.MICROSOFT_OUTLOOK,
  CalendarLinkType.MICROSOFT_OFFICE,
  CalendarLinkType.ICS,
];

export function AddToCalendarDialog({ calendarLinks, eventTitle, defaultOpen }: AddToCalendarDialogProps) {
  const { t } = useLocale();

  const options = OPTION_ORDER.map((id) => calendarLinks.find((link) => link.id === id)).filter(
    (link): link is CalendarLink => !!link?.link
  );

  if (options.length === 0) return null;

  return (
    <Dialog defaultOpen={defaultOpen}>
      <DialogTrigger asChild>
        <Button color="secondary" StartIcon="calendar" data-testid="add-to-calendar-button">
          {t("add_to_calendar")}
        </Button>
      </DialogTrigger>
      <DialogContent
        title={t("add_to_calendar")}
        description={t("add_to_calendar_picker_description")}
        data-testid="add-to-calendar-dialog">
        <ul className="flex flex-col gap-2">
          {options.map((option) => {
            const config = OPTION_CONFIG[option.id];
            return (
              <li key={option.id}>
                <Link
                  href={option.link}
                  data-testid={`add-to-calendar-${option.id}`}
                  {...(config.isDownload
                    ? { download: `${eventTitle}.ics` }
                    : { target: "_blank", rel: "noopener noreferrer" })}
                  className="border-subtle hover:bg-cal-muted text-default flex items-center gap-3 rounded-md border px-4 py-3 transition-colors">
                  <span className="border-subtle text-emphasis flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border">
                    {config.icon}
                  </span>
                  <span className="flex grow flex-col">
                    <span className="text-emphasis text-sm font-medium">{t(config.labelKey)}</span>
                    <span className="text-subtle text-xs">{t(config.descriptionKey)}</span>
                  </span>
                  <Icon
                    name={config.isDownload ? "download" : "external-link"}
                    className="text-subtle h-4 w-4 shrink-0"
                  />
                </Link>
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
