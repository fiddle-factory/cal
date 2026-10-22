import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button } from "@calcom/ui/components/button";
import { Dialog, DialogClose, DialogContent, DialogFooter } from "@calcom/ui/components/dialog";
import { Icon } from "@calcom/ui/components/icon";
import type { ReactNode } from "react";

export type CalendarOptionId = "google" | "outlook" | "apple";

type CalendarOption = {
  id: CalendarOptionId;
  label: string;
  icon: ReactNode;
};

const iconClassName = "h-5 w-5 shrink-0";

const CALENDAR_OPTIONS: CalendarOption[] = [
  {
    id: "google",
    label: "Google Calendar",
    icon: (
      <svg className={iconClassName} fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Google</title>
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
      </svg>
    ),
  },
  {
    id: "outlook",
    label: "Outlook",
    icon: (
      <svg className={iconClassName} fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Microsoft Outlook</title>
        <path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.5V2.55q0-.44.3-.75.3-.3.75-.3h12.9q.44 0 .75.3.3.3.3.75V10.85l1.24.72h.01q.1.07.18.18.07.12.07.25zm-6-8.25v3h3v-3zm0 4.5v3h3v-3zm0 4.5v1.83l3.05-1.83zm-5.25-9v3h3.75v-3zm0 4.5v3h3.75v-3zm0 4.5v2.03l2.41 1.5 1.34-.8v-2.73zM9 3.75V6h2l.13.01.12.04v-2.3zM5.98 15.98q.9 0 1.6-.3.7-.32 1.19-.86.48-.55.73-1.28.25-.74.25-1.61 0-.83-.25-1.55-.24-.71-.71-1.24t-1.15-.83q-.68-.3-1.55-.3-.92 0-1.64.3-.71.3-1.2.85-.5.54-.75 1.3-.25.74-.25 1.63 0 .85.26 1.56.26.72.74 1.23.48.52 1.17.81.69.3 1.56.3zM7.5 21h12.39L12 16.08V17q0 .41-.3.7-.29.3-.7.3H7.5zm15-.13v-7.24l-5.9 3.54Z" />
      </svg>
    ),
  },
  {
    id: "apple",
    label: "Apple Calendar",
    icon: (
      <svg className={iconClassName} fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Apple</title>
        <path d="M16.37 1.43c0 1.14-.42 2.2-1.25 3.17-1 1.17-2.21 1.84-3.52 1.74a3.5 3.5 0 0 1-.03-.43c0-1.1.48-2.27 1.33-3.24.42-.49.96-.89 1.61-1.21.65-.32 1.26-.49 1.84-.52.01.16.02.33.02.49zm4.57 16.19c-.42.97-.92 1.86-1.5 2.68-.79 1.12-1.44 1.9-1.94 2.33-.77.71-1.6 1.07-2.49 1.09-.64 0-1.4-.18-2.3-.55-.89-.36-1.71-.54-2.46-.54-.79 0-1.63.18-2.53.54-.9.37-1.63.56-2.18.58-.85.04-1.7-.33-2.54-1.12-.54-.47-1.22-1.27-2.03-2.42-.87-1.22-1.58-2.63-2.14-4.24C.24 14.23 0 12.55 0 10.92c0-1.86.4-3.47 1.21-4.82a7.1 7.1 0 0 1 2.53-2.56 6.8 6.8 0 0 1 3.42-.97c.67 0 1.55.21 2.65.62 1.09.41 1.79.62 2.1.62.23 0 1.01-.24 2.33-.73 1.25-.45 2.31-.64 3.17-.56 2.34.19 4.1 1.11 5.27 2.77-2.09 1.27-3.13 3.05-3.11 5.33.02 1.78.66 3.26 1.93 4.43.57.54 1.21.96 1.92 1.26-.15.45-.32.88-.49 1.31z" />
      </svg>
    ),
  },
];

export interface AddToCalendarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCalendar?: (calendar: CalendarOptionId) => void;
}

export function AddToCalendarDialog({ open, onOpenChange, onSelectCalendar }: AddToCalendarDialogProps) {
  const { t } = useLocale();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={t("add_to_calendar")} description={t("add_event_to_your_calendar")}>
        <ul className="flex flex-col gap-2">
          {CALENDAR_OPTIONS.map((option) => (
            <li key={option.id}>
              <Button
                color="secondary"
                size="lg"
                className="w-full justify-start"
                CustomStartIcon={<span className="text-default mr-2 flex items-center">{option.icon}</span>}
                onClick={() => {
                  onSelectCalendar?.(option.id);
                  onOpenChange(false);
                }}>
                <span className="grow text-left">{option.label}</span>
                <Icon name="chevron-right" className="text-subtle h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
        <DialogFooter noSticky>
          <DialogClose />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
