import { useState } from "react";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Avatar } from "@calcom/ui/components/avatar/Avatar";
import { Button } from "@calcom/ui/components/button/Button";
import { TextAreaField } from "@calcom/ui/components/form/inputs/Input";
import { InputField } from "@calcom/ui/components/form/inputs/TextField";
import { Icon } from "@calcom/ui/components/icon";

export interface BookingDetailsFormCardProps {
  title: string;
  formattedDate: string;
  formattedTime: string;
  endTime: string;
  formattedTimeZone: string;
  duration: string;
  hostName: string;
  hostAvatarUrl?: string | null;
  location: string | null;
  defaultName?: string;
  defaultEmail?: string;
  defaultNotes?: string;
  defaultGuests?: string[];
  onBack?: () => void;
  onConfirm?: (values: { name: string; email: string; notes: string; guests: string[] }) => void;
}

export function BookingDetailsFormCard({
  title,
  formattedDate,
  formattedTime,
  endTime,
  formattedTimeZone,
  duration,
  hostName,
  hostAvatarUrl,
  location,
  defaultName = "",
  defaultEmail = "",
  defaultNotes = "",
  defaultGuests = [],
  onBack,
  onConfirm,
}: BookingDetailsFormCardProps) {
  const { t } = useLocale();
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [notes, setNotes] = useState(defaultNotes);
  const [guests, setGuests] = useState<string[]>(defaultGuests);

  const updateGuest = (index: number, value: string) =>
    setGuests((current) => current.map((guest, i) => (i === index ? value : guest)));
  const removeGuest = (index: number) => setGuests((current) => current.filter((_, i) => i !== index));

  return (
    <div className="h-screen">
      <main className="mx-auto max-w-4xl">
        <div className="flex items-end justify-center px-4 pb-20 pt-4 sm:p-0">
          <div className="bg-default dark:bg-cal-muted border-booker border-booker-width my-4 grid w-full overflow-hidden rounded-lg text-left sm:my-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <aside className="border-subtle border-b p-6 md:border-b-0 md:border-r rtl:md:border-l rtl:md:border-r-0">
              <div className="flex items-center gap-2">
                <Avatar size="sm" alt={hostName} imageSrc={hostAvatarUrl} />
                <p className="text-subtle text-sm font-medium">{hostName}</p>
              </div>
              <h1 className="text-emphasis mt-3 text-xl font-semibold">{title}</h1>
              <ul className="text-default mt-5 space-y-4 text-sm font-medium">
                <li className="flex items-start gap-2">
                  <Icon name="calendar" className="text-subtle mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {formattedDate}
                    <br />
                    {formattedTime}
                    {endTime && ` - ${endTime}`}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="clock" className="text-subtle h-4 w-4 shrink-0" />
                  <span>{duration}</span>
                </li>
                {location && (
                  <li className="flex items-center gap-2">
                    <Icon name="video" className="text-subtle h-4 w-4 shrink-0" />
                    <span>{location}</span>
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <Icon name="globe" className="text-subtle h-4 w-4 shrink-0" />
                  <span>{formattedTimeZone}</span>
                </li>
              </ul>
            </aside>

            <form
              className="flex flex-col gap-5 p-6"
              onSubmit={(event) => {
                event.preventDefault();
                onConfirm?.({ name, email, notes, guests: guests.filter(Boolean) });
              }}>
              <InputField
                name="name"
                label={t("your_name")}
                required
                showAsteriskIndicator
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <InputField
                name="email"
                type="email"
                label={t("email_address")}
                required
                showAsteriskIndicator
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <TextAreaField
                name="notes"
                label={
                  <>
                    {t("additional_notes")} <span className="text-subtle font-normal">({t("optional")})</span>
                  </>
                }
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />

              <div>
                {guests.length > 0 && (
                  <div className="mb-3 space-y-2">
                    <p className="text-emphasis text-sm font-medium leading-none">{t("guests")}</p>
                    {guests.map((guest, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <InputField
                          name={`guest-${index}`}
                          type="email"
                          noLabel
                          containerClassName="flex-1"
                          placeholder={t("guest_email")}
                          value={guest}
                          onChange={(event) => updateGuest(index, event.target.value)}
                        />
                        <Button
                          type="button"
                          color="minimal"
                          variant="icon"
                          StartIcon="x"
                          aria-label={t("remove")}
                          onClick={() => removeGuest(index)}
                        />
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  type="button"
                  color="minimal"
                  StartIcon="user-plus"
                  onClick={() => setGuests((current) => [...current, ""])}>
                  {guests.length > 0 ? t("add_another") : t("additional_guests")}
                </Button>
              </div>

              <div className="border-subtle mt-auto flex justify-end gap-2 border-t pt-5">
                <Button type="button" color="minimal" onClick={onBack}>
                  {t("back")}
                </Button>
                <Button type="submit" color="primary">
                  {t("confirm")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
