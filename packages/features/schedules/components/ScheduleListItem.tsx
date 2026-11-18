"use client";

import Link from "next/link";
import React, { useState } from "react";

import { availabilityAsString } from "@calcom/lib/availability";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { nameOfDay } from "@calcom/lib/weekday";
import { sortAvailabilityStrings } from "@calcom/lib/weekstart";
import type { RouterOutputs } from "@calcom/trpc/react";
import { Dialog } from "@calcom/features/components/controlled-dialog";
import { Badge } from "@calcom/ui/components/badge";
import { Button } from "@calcom/ui/components/button";
import {
  Dropdown,
  DropdownItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@calcom/ui/components/dropdown";
import { ConfirmationDialogContent } from "@calcom/ui/components/dialog";
import { Icon } from "@calcom/ui/components/icon";
import { showToast } from "@calcom/ui/components/toast";

export function ScheduleListItem({
  schedule,
  deleteFunction,
  displayOptions,
  updateDefault,
  isDeletable,
  duplicateFunction,
  redirectUrl,
}: {
  schedule: RouterOutputs["viewer"]["availability"]["list"]["schedules"][number];
  deleteFunction: ({ scheduleId }: { scheduleId: number }) => void;
  displayOptions?: {
    timeZone?: string;
    hour12?: boolean;
    weekStart?: string;
  };
  isDeletable: boolean;
  updateDefault: ({ scheduleId, isDefault }: { scheduleId: number; isDefault: boolean }) => void;
  duplicateFunction: ({ scheduleId }: { scheduleId: number }) => void;
  redirectUrl: string;
}) {
  const { t, i18n } = useLocale();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  type AvailabilityItem = (typeof schedule.availability)[number];

  const availabilitySummary = schedule.availability
    .filter((availability: AvailabilityItem) => !!availability.days.length)
    .map((availability: AvailabilityItem) =>
      availabilityAsString(availability, {
        locale: i18n.language,
        hour12: displayOptions?.hour12,
      })
    )
    // sort the availability strings as per user's weekstart (settings)
    .sort(sortAvailabilityStrings(i18n.language, displayOptions?.weekStart));

  return (
    <li key={schedule.id}>
      <div className="hover:bg-cal-muted flex items-center justify-between gap-2 px-3 py-4 transition sm:px-4">
        <div className="group flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <Link href={redirectUrl} className="min-w-0 grow truncate text-sm" title={schedule.name}>
            <div className="space-x-2 rtl:space-x-reverse">
              <span className="text-emphasis truncate text-sm font-medium">{schedule.name}</span>
              {schedule.isDefault && (
                <Badge variant="gray" className="text-xs">
                  {t("default")}
                </Badge>
              )}
            </div>
            {(schedule.timeZone || displayOptions?.timeZone) && (
              <p className="text-subtle mt-1 flex items-center">
                <Icon name="globe" className="h-3.5 w-3.5" />
                &nbsp;{schedule.timeZone ?? displayOptions?.timeZone}
              </p>
            )}
            <p className="sr-only">{availabilitySummary.join(", ")}</p>
          </Link>
          <WeekTimeline
            availability={schedule.availability}
            locale={i18n.language}
            hour12={displayOptions?.hour12}
            unavailableLabel={t("unavailable")}
          />
        </div>
        <Dropdown>
          <DropdownMenuTrigger asChild>
            <Button
              data-testid="schedule-more"
              type="button"
              variant="icon"
              color="secondary"
              StartIcon="ellipsis"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {!schedule.isDefault && (
              <DropdownMenuItem className="min-w-40 focus:ring-muted">
                <DropdownItem
                  type="button"
                  StartIcon="star"
                  onClick={() => {
                    updateDefault({
                      scheduleId: schedule.id,
                      isDefault: true,
                    });
                  }}>
                  {t("set_as_default")}
                </DropdownItem>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="outline-none">
              <DropdownItem
                type="button"
                data-testid={`schedule-duplicate${schedule.id}`}
                StartIcon="copy"
                onClick={() => {
                  duplicateFunction({
                    scheduleId: schedule.id,
                  });
                }}>
                {t("duplicate")}
              </DropdownItem>
            </DropdownMenuItem>
            <DropdownMenuItem className="min-w-40 focus:ring-muted">
              <DropdownItem
                type="button"
                color="destructive"
                StartIcon="trash"
                data-testid="delete-schedule"
                className="rounded-t-none"
                onClick={() => {
                  if (!isDeletable) {
                    showToast(t("requires_at_least_one_schedule"), "error");
                  } else {
                    setIsDeleteDialogOpen(true);
                  }
                }}>
                {t("delete")}
              </DropdownItem>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </Dropdown>
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <ConfirmationDialogContent
            variety="danger"
            title={t("delete_schedule")}
            confirmBtnText={t("delete")}
            loadingText={t("delete")}
            onConfirm={(e) => {
              e.preventDefault();
              deleteFunction({
                scheduleId: schedule.id,
              });
            }}>
            {t("delete_schedule_description")}
          </ConfirmationDialogContent>
        </Dialog>
      </div>
    </li>
  );
}

type TimelineAvailability = { days: number[]; startTime: Date; endTime: Date };

// Monday → Sunday, as day indexes where 0 is Sunday.
const TIMELINE_DAYS = [1, 2, 3, 4, 5, 6, 0];

const TIMELINE_DEFAULT_COLORS = {
  available: "#111827", // bg-brand-default
  track: "#eeeff2", // bg-subtle
  dayLabel: "#3c3e44", // text-default
  unavailableLabel: "#9ca3b0", // text-muted
};

const hourOf = (date: Date) => date.getUTCHours() + date.getUTCMinutes() / 60;

function WeekTimeline({
  availability,
  locale,
  hour12,
  unavailableLabel,
}: {
  availability: TimelineAvailability[];
  locale: string;
  hour12?: boolean;
  unavailableLabel: string;
}) {
  // Light-mode token values; while a colour equals its default the theme token is used,
  // so dark mode (and custom brand colours) keep working until a colour is adjusted.
  const [availableColor, setAvailableColor] = useState("#af1818");
  const [trackColor, setTrackColor] = useState("#d1daf6");
  const [dayLabelColor, setDayLabelColor] = useState(TIMELINE_DEFAULT_COLORS.dayLabel);
  const [unavailableLabelColor, setUnavailableLabelColor] = useState(TIMELINE_DEFAULT_COLORS.unavailableLabel);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="Layout-div-0"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.availableColor === "string") setAvailableColor(p.availableColor);
      if (typeof p.trackColor === "string") setTrackColor(p.trackColor);
      if (typeof p.dayLabelColor === "string") setDayLabelColor(p.dayLabelColor);
      if (typeof p.unavailableLabelColor === "string") setUnavailableLabelColor(p.unavailableLabelColor);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const override = (value: string, fallback: string) =>
    value.toLowerCase() === fallback ? undefined : value;
  const availableOverride = override(availableColor, TIMELINE_DEFAULT_COLORS.available);
  const trackOverride = override(trackColor, TIMELINE_DEFAULT_COLORS.track);
  const dayLabelOverride = override(dayLabelColor, TIMELINE_DEFAULT_COLORS.dayLabel);
  const unavailableLabelOverride = override(
    unavailableLabelColor,
    TIMELINE_DEFAULT_COLORS.unavailableLabel
  );

  const formatTime = (date: Date) =>
    new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "numeric", hour12 }).format(
      new Date(date.toISOString().slice(0, -1))
    );

  return (
    <div className="flex shrink-0 items-end gap-1" aria-hidden="true">
      {TIMELINE_DAYS.map((day) => {
        const ranges = availability
          .filter((item) => item.days.includes(day))
          .map((item) => {
            const start = hourOf(item.startTime);
            const rawEnd = hourOf(item.endTime);
            const end = rawEnd <= start ? 24 : rawEnd;
            return { start, end, label: `${formatTime(item.startTime)} - ${formatTime(item.endTime)}` };
          })
          .sort((a, b) => a.start - b.start);
        const dayName = nameOfDay(locale, day, "short");
        const tooltip = `${dayName}: ${
          ranges.length ? ranges.map((range) => range.label).join(", ") : unavailableLabel
        }`;

        return (
          <div key={day} className="flex w-8 flex-col items-center gap-1" title={tooltip}>
            <div
              className="bg-subtle relative h-12 w-3 overflow-hidden rounded-sm"
              style={trackOverride ? { backgroundColor: trackOverride } : undefined}>
              {ranges.map((range) => (
                <div
                  key={`${range.start}-${range.end}`}
                  className="bg-brand-default absolute inset-x-0 rounded-sm"
                  style={{
                    top: `${(range.start / 24) * 100}%`,
                    height: `${Math.max(((range.end - range.start) / 24) * 100, 4)}%`,
                    ...(availableOverride ? { backgroundColor: availableOverride } : {}),
                  }}
                />
              ))}
            </div>
            <span
              className={ranges.length ? "text-default text-xs" : "text-muted text-xs"}
              style={
                ranges.length
                  ? dayLabelOverride
                    ? { color: dayLabelOverride }
                    : undefined
                  : unavailableLabelOverride
                  ? { color: unavailableLabelOverride }
                  : undefined
              }>
              {dayName}
            </span>
          </div>
        );
      })}
    </div>
  );
}
