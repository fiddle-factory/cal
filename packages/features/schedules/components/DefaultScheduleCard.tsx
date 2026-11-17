"use client";

import Link from "next/link";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { nameOfDay } from "@calcom/lib/weekday";
import { weekStartNum } from "@calcom/lib/weekstart";
import classNames from "@calcom/ui/classNames";
import { Badge } from "@calcom/ui/components/badge";
import { Button } from "@calcom/ui/components/button";
import { Icon } from "@calcom/ui/components/icon";

import type { ScheduleActionsProps } from "./ScheduleListItem";
import { ScheduleActionsMenu } from "./ScheduleListItem";

type DefaultScheduleCardProps = Omit<ScheduleActionsProps, "size"> & {
  redirectUrl: string;
  displayOptions?: {
    timeZone?: string;
    hour12?: boolean;
    weekStart?: string;
  };
};

const formatTime = (date: Date, locale: string, hour12?: boolean) =>
  new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "numeric", hour12 }).format(
    // availability times are stored as UTC wall-clock times
    new Date(new Date(date).toISOString().slice(0, -1))
  );

/** Prominent card featuring the default schedule with its full weekly hours. */
export function DefaultScheduleCard({
  schedule,
  redirectUrl,
  displayOptions,
  ...actionProps
}: DefaultScheduleCardProps) {
  const { t, i18n } = useLocale();
  const weekStart = weekStartNum(displayOptions?.weekStart);
  const timeZone = schedule.timeZone ?? displayOptions?.timeZone;

  const days = Array.from({ length: 7 }, (_, index) => {
    const day = (index + weekStart) % 7;
    const ranges = schedule.availability
      .filter((availability) => availability.days.includes(day))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .map(
        (availability) =>
          `${formatTime(availability.startTime, i18n.language, displayOptions?.hour12)} – ${formatTime(
            availability.endTime,
            i18n.language,
            displayOptions?.hour12
          )}`
      );
    return { day, label: nameOfDay(i18n.language, day, "short"), ranges };
  });

  return (
    <section
      data-testid="default-schedule"
      className="border-subtle bg-default overflow-hidden rounded-xl border">
      <div className="flex items-start justify-between gap-4 p-4 sm:p-6">
        <div className="flex min-w-0 items-start gap-3">
          <div className="bg-subtle text-emphasis flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
            <Icon name="clock" className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href={redirectUrl}
                className="text-emphasis truncate text-lg font-semibold leading-6 hover:underline"
                title={schedule.name}>
                {schedule.name}
              </Link>
              <Badge variant="blue" startIcon="star">
                {t("default")}
              </Badge>
            </div>
            {timeZone && (
              <p className="text-subtle mt-1 flex items-center gap-1 text-sm">
                <Icon name="globe" className="h-3.5 w-3.5" />
                {timeZone}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button color="secondary" StartIcon="pencil" href={redirectUrl} data-testid="edit-default-schedule">
            {t("edit")}
          </Button>
          <ScheduleActionsMenu schedule={schedule} {...actionProps} />
        </div>
      </div>
      <dl className="border-subtle bg-subtle grid grid-cols-2 gap-px border-t sm:grid-cols-4 xl:grid-cols-7">
        {days.map(({ day, label, ranges }) => (
          <div key={day} className="bg-default px-4 py-3">
            <dt className="text-subtle text-xs font-medium uppercase tracking-wide">{label}</dt>
            <dd
              className={classNames(
                "mt-1 space-y-0.5 text-sm",
                ranges.length ? "text-emphasis font-medium" : "text-muted"
              )}>
              {ranges.length
                ? ranges.map((range) => <span key={range} className="block">{range}</span>)
                : t("unavailable")}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
