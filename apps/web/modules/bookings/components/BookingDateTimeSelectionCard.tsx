import { useMemo, useState } from "react";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import classNames from "@calcom/ui/classNames";
import { Avatar } from "@calcom/ui/components/avatar";
import { Button } from "@calcom/ui/components/button";
import { ToggleGroup } from "@calcom/ui/components/form";
import { Icon } from "@calcom/ui/components/icon";
import type { IconName } from "@calcom/ui/components/icon";

import { EventTitle } from "./event-meta/Title";

export interface BookingDateTimeSelectionCardProps {
  hostName: string;
  hostAvatarUrl?: string | null;
  title: string;
  description?: string | null;
  durationMinutes: number;
  location: string;
  timeZone: string;
  /** Month shown in the calendar, formatted as YYYY-MM. */
  month: string;
  /** Days with availability, formatted as YYYY-MM-DD. */
  availableDates: string[];
  /** Initially selected day, formatted as YYYY-MM-DD. */
  selectedDate?: string | null;
  /** Available start times for the selected day, formatted as HH:mm (24-hour). */
  timeSlots: string[];
  /** Initially selected start time, formatted as HH:mm (24-hour). */
  selectedTime?: string | null;
  onConfirm?: (date: string, time: string) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const pad = (value: number) => String(value).padStart(2, "0");

const formatSlot = (time: string, format: "12" | "24") => {
  const [hours, minutes] = time.split(":").map(Number);
  if (format === "24") return `${pad(hours)}:${minutes === undefined ? "00" : pad(minutes)}`;
  const suffix = hours >= 12 ? "pm" : "am";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${pad(minutes ?? 0)}${suffix}`;
};

const MetaBlock = ({ icon, children }: { icon: IconName; children: React.ReactNode }) => (
  <div className="text-text flex items-start justify-start text-sm">
    <Icon name={icon} className="relative z-20 mr-2 mt-[2px] h-4 w-4 shrink-0 rtl:ml-2" />
    <div className="relative z-10 max-w-full wrap-break-word">{children}</div>
  </div>
);

export function BookingDateTimeSelectionCard({
  hostName,
  hostAvatarUrl,
  title,
  description,
  durationMinutes,
  location,
  timeZone,
  month,
  availableDates,
  selectedDate: initialSelectedDate = null,
  timeSlots,
  selectedTime: initialSelectedTime = null,
  onConfirm,
}: BookingDateTimeSelectionCardProps) {
  const { t } = useLocale();
  const [selectedDate, setSelectedDate] = useState<string | null>(initialSelectedDate);
  const [selectedTime, setSelectedTime] = useState<string | null>(initialSelectedTime);
  const [timeFormat, setTimeFormat] = useState<"12" | "24">("12");

  const [year, monthIndex] = month.split("-").map(Number);
  const monthStart = new Date(year, monthIndex - 1, 1);
  const monthName = monthStart.toLocaleDateString("en-US", { month: "long" });

  const days = useMemo(() => {
    const totalDays = new Date(year, monthIndex, 0).getDate();
    const leadingBlanks = new Date(year, monthIndex - 1, 1).getDay();
    const cells: (number | null)[] = Array.from({ length: leadingBlanks }, () => null);
    for (let day = 1; day <= totalDays; day++) cells.push(day);
    return cells;
  }, [year, monthIndex]);

  const selectedDay = selectedDate ? new Date(`${selectedDate}T00:00:00`) : null;

  return (
    <div className="main text-default flex min-h-full w-full flex-col items-center sm:my-20">
      <div
        data-testid="booker-container"
        className="bg-default dark:bg-cal-muted border-subtle flex max-w-full flex-col items-stretch rounded-md border dark:scheme-dark md:flex-row">
        {/* Event meta */}
        <div className="relative z-10 flex w-full flex-col p-6 md:w-[240px] lg:w-[280px]" data-testid="event-meta">
          <div className="flex items-center gap-2">
            <Avatar size="sm" imageSrc={hostAvatarUrl} alt={hostName} />
            <p className="text-subtle text-sm font-semibold">{hostName}</p>
          </div>
          <EventTitle className="my-2">{title}</EventTitle>
          {description && <p className="text-subtle mb-8 text-sm">{description}</p>}
          <div className="stack-y-4 font-medium rtl:-mr-2">
            {selectedDay && selectedTime && (
              <MetaBlock icon="calendar">
                {selectedDay.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
                <br />
                {formatSlot(selectedTime, timeFormat)}
              </MetaBlock>
            )}
            <MetaBlock icon="clock">{`${durationMinutes} ${t("minute_timeUnit")}`}</MetaBlock>
            <MetaBlock icon="video">{location}</MetaBlock>
            <MetaBlock icon="globe">{timeZone}</MetaBlock>
          </div>
        </div>

        {/* Month calendar */}
        <div className="md:border-subtle -ml-px h-full shrink px-5 py-3 md:w-[480px] md:border-l">
          <div className="mb-1 flex items-center justify-between text-xl">
            <span className="text-default w-1/2 text-base">
              <time dateTime={month} data-testid="selected-month-label">
                <strong className="text-emphasis font-semibold">{monthName}</strong>{" "}
                <span className="text-subtle font-medium">{year}</span>
              </time>
            </span>
            <div className="text-emphasis flex">
              <Button
                className="group p-1 opacity-70 transition hover:opacity-100 rtl:rotate-180"
                color="minimal"
                variant="icon"
                StartIcon="chevron-left"
                aria-label="View previous month"
              />
              <Button
                className="group p-1 opacity-70 transition hover:opacity-100 rtl:rotate-180"
                color="minimal"
                variant="icon"
                StartIcon="chevron-right"
                aria-label="View next month"
              />
            </div>
          </div>
          <div className="border-subtle mb-2 grid grid-cols-7 gap-4 border-b border-t text-center md:mb-0 md:border-0">
            {WEEKDAYS.map((weekDay) => (
              <div key={weekDay} className="text-emphasis my-4 text-xs font-medium uppercase tracking-widest">
                {weekDay}
              </div>
            ))}
          </div>
          <div className="relative grid grid-cols-7 grid-rows-6 gap-1 text-center">
            {days.map((day, idx) => {
              if (day === null) return <div key={`e-${idx}`} />;
              const dateKey = `${year}-${pad(monthIndex)}-${pad(day)}`;
              const disabled = !availableDates.includes(dateKey);
              const active = dateKey === selectedDate;
              return (
                <div key={dateKey} className="relative w-full pt-[100%]">
                  <button
                    type="button"
                    data-testid="day"
                    data-disabled={disabled}
                    disabled={disabled}
                    onClick={() => {
                      setSelectedDate(dateKey);
                      setSelectedTime(null);
                    }}
                    className={classNames(
                      "disabled:text-bookinglighter absolute bottom-0 left-0 right-0 top-0 mx-auto w-full rounded-md border-2 border-transparent text-center text-sm font-medium transition disabled:cursor-default disabled:border-transparent disabled:font-light",
                      active
                        ? "bg-brand-default text-brand"
                        : !disabled
                        ? "hover:border-brand-default text-emphasis bg-emphasis"
                        : "text-mute"
                    )}>
                    {day}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time slots */}
        <div className="border-subtle rtl:border-default flex h-full w-full flex-col overflow-x-auto px-5 py-3 pb-0 rtl:border-r md:w-[240px] lg:w-[280px] ltr:md:border-l">
          {selectedDay ? (
            <>
              <header className="bg-default dark:bg-cal-muted mb-3 flex w-full flex-row items-center font-medium">
                <span className="text-emphasis font-semibold">
                  {WEEKDAYS[selectedDay.getDay()]}
                  <span className="text-default inline-flex items-center justify-center rounded-3xl px-1 pt-0.5 text-sm font-medium">
                    {pad(selectedDay.getDate())}
                  </span>
                </span>
                <div className="ml-auto rtl:mr-auto">
                  <ToggleGroup
                    value={timeFormat}
                    onValueChange={(value) => {
                      if (value === "12" || value === "24") setTimeFormat(value);
                    }}
                    options={[
                      { value: "12", label: "12h" },
                      { value: "24", label: "24h" },
                    ]}
                  />
                </div>
              </header>
              <div className="h-full pb-4">
                {!timeSlots.length && (
                  <div className="bg-subtle border-subtle flex h-full flex-col items-center rounded-md border p-6 dark:bg-transparent">
                    <Icon name="calendar-x-2" className="text-muted mb-2 h-4 w-4" />
                    <p className="text-muted -mt-1 text-lg">{t("all_booked_today")}</p>
                  </div>
                )}
                {timeSlots.map((slot) => {
                  const isSelected = slot === selectedTime;
                  return (
                    <div key={slot} className="flex gap-2">
                      <Button
                        data-testid="time"
                        data-time={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={classNames(
                          "hover:border-brand-default min-h-9 mb-2 flex h-auto w-full grow flex-col justify-center py-2",
                          isSelected && "border-brand-default"
                        )}
                        color="secondary">
                        {formatSlot(slot, timeFormat)}
                      </Button>
                      {isSelected && selectedDate && (
                        <Button
                          type="button"
                          color="primary"
                          data-testid="skip-confirm-book-button"
                          onClick={() => onConfirm?.(selectedDate, slot)}>
                          Next
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-subtle py-6 text-center text-sm">Select a date to see available times</p>
          )}
        </div>
      </div>
    </div>
  );
}
