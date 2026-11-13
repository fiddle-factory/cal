import React from "react";

import dayjs from "@calcom/dayjs";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import classNames from "@calcom/ui/classNames";

import { useCalendarStore } from "@calcom/features/calendars/weeklyview/state/store";
import type { BorderColor } from "@calcom/features/calendars/weeklyview/types/common";

type Props = {
  showBorder: boolean;
  borderColor: BorderColor;
  days: dayjs.Dayjs[];
  containerNavRef: React.RefObject<HTMLDivElement>;
};

export function DateValues({ showBorder, borderColor, days, containerNavRef }: Props) {
  const { i18n, t } = useLocale();
  const timezone = useCalendarStore((state) => state.timezone);
  const events = useCalendarStore((state) => state.events);
  const allDayEvents = events.filter((event) => event.options?.allDay);
  const hasAllDayEvents = allDayEvents.some((event) =>
    days.some((day) => dayjs(event.start).isSame(day, "day"))
  );
  const showTimezone = useCalendarStore((state) => state.showTimezone ?? false);

  const formatDate = (date: dayjs.Dayjs): string => {
    return new Intl.DateTimeFormat(i18n.language, { weekday: "short" }).format(date.toDate());
  };

  const getTimezoneDisplay = () => {
    if (!showTimezone || !timezone) return null;
    try {
      const timeRaw = dayjs().tz(timezone);
      const utcOffsetInMinutes = timeRaw.utcOffset();

      // Convert offset to decimal hours
      const offsetInHours = Math.abs(utcOffsetInMinutes / 60);
      const sign = utcOffsetInMinutes < 0 ? "-" : "+";

      // If offset is 0, just return "GMT"
      if (utcOffsetInMinutes === 0) {
        return "GMT";
      }

      // Format as decimal (e.g., 1.5 for 1:30, 1 for 1:00)
      const offsetFormatted = `${sign}${offsetInHours}`;

      return `GMT ${offsetFormatted}`;
    } catch {
      // Fallback to showing the timezone name if formatting fails
      return timezone.split("/").pop()?.replace(/_/g, " ") || timezone;
    }
  };

  return (
    <div
      ref={containerNavRef}
      className={classNames(
        "bg-default dark:bg-cal-muted top-(--calendar-dates-sticky-offset,0px) z-80 sticky flex-none border-b",
        borderColor === "subtle" ? "border-b-subtle" : "border-b-default",
        showBorder && (borderColor === "subtle" ? "border-r-subtle border-r" : "border-r-default border-r")
      )}>
      <div className="text-subtle flex leading-6 sm:hidden" data-dayslength={days.length}>
        {days.map((day) => {
          const isToday = dayjs().isSame(day, "day");
          return (
            <button
              key={day.toString()}
              type="button"
              className="flex flex-1 flex-col items-center pb-3 pt-2">
              {day.format("dd")}{" "}
              <span
                className={classNames(
                  "text-emphasis mt-1 flex h-8 w-8 items-center justify-center font-medium",
                  isToday && "bg-inverted text-inverted rounded-sm"
                )}>
                {day.format("D")}
              </span>
            </button>
          );
        })}
      </div>
      <div className="text-subtle -mr-px hidden auto-cols-fr leading-6 sm:flex">
        <div
          className={classNames(
            "col-end-1 flex w-16 items-center justify-center",
            showBorder &&
              (borderColor === "subtle" ? "border-l-subtle border-l" : "border-l-default border-l")
          )}>
          {showTimezone && timezone && (
            <span className="text-muted text-xs font-medium">{getTimezoneDisplay()}</span>
          )}
        </div>
        {days.map((day) => {
          const isToday = dayjs().isSame(day, "day");
          return (
            <div
              key={day.toString()}
              className={classNames(
                "flex flex-1 items-center justify-center py-3 text-xs font-medium uppercase",
                isToday && "text-default"
              )}>
              <span>
                {formatDate(day)}{" "}
                <span
                  className={classNames(
                    "items-center justify-center p-1",
                    isToday && "bg-brand-default text-brand ml-1 rounded-md"
                  )}>
                  {day.format("DD")}
                </span>
              </span>
            </div>
          );
        })}
      </div>
      {hasAllDayEvents && (
        <div className="-mr-px hidden pb-2 sm:flex" data-testid="calendar-all-day-row">
          <div
            className={classNames(
              "col-end-1 flex w-16 items-start justify-center pt-1",
              showBorder &&
                (borderColor === "subtle" ? "border-l-subtle border-l" : "border-l-default border-l")
            )}>
            <span className="text-muted text-[10px] font-medium uppercase">{t("all_day")}</span>
          </div>
          {days.map((day) => {
            const dayEvents = allDayEvents.filter((event) => dayjs(event.start).isSame(day, "day"));
            return (
              <div key={day.toString()} className="flex min-w-0 flex-1 flex-col gap-1 px-0.5">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    title={event.title}
                    className={classNames(
                      "bg-subtle text-emphasis flex min-w-0 items-center gap-1.5 overflow-hidden rounded-md px-1.5 py-1 text-xs font-medium leading-4",
                      event.options?.className
                    )}>
                    {event.options?.color && (
                      <span
                        className="h-3 w-[3px] shrink-0 rounded-sm"
                        style={{ backgroundColor: event.options.color }}
                      />
                    )}
                    <span className="truncate">{event.title}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
