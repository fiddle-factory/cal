"use client";

import Link from "next/link";
import { useState } from "react";

import { availabilityAsString } from "@calcom/lib/availability";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { nameOfDay } from "@calcom/lib/weekday";
import { sortAvailabilityStrings, weekStartNum } from "@calcom/lib/weekstart";
import type { RouterOutputs } from "@calcom/trpc/react";
import { Dialog } from "@calcom/features/components/controlled-dialog";
import classNames from "@calcom/ui/classNames";
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
import { TableCell, TableRow } from "@calcom/ui/components/table/TableNew";
import { showToast } from "@calcom/ui/components/toast";

type Schedule = RouterOutputs["viewer"]["availability"]["list"]["schedules"][number];

export function ScheduleTableRow({
  schedule,
  deleteFunction,
  displayOptions,
  updateDefault,
  isDeletable,
  duplicateFunction,
  redirectUrl,
}: {
  schedule: Schedule;
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

  type AvailabilityItem = Schedule["availability"][number];

  const availabilityStrings = schedule.availability
    .filter((availability: AvailabilityItem) => !!availability.days.length)
    .map((availability: AvailabilityItem) =>
      availabilityAsString(availability, {
        locale: i18n.language,
        hour12: displayOptions?.hour12,
      })
    )
    // sort the availability strings as per user's weekstart (settings)
    .sort(sortAvailabilityStrings(i18n.language, displayOptions?.weekStart));

  const timeZone = schedule.timeZone ?? displayOptions?.timeZone;

  const weekStartIndex = weekStartNum(displayOptions?.weekStart);
  const orderedDays = Array.from({ length: 7 }, (_, index) => (index + weekStartIndex) % 7);
  const formatTime = (date: Date) =>
    new Intl.DateTimeFormat(i18n.language, {
      hour: "numeric",
      minute: "numeric",
      hour12: displayOptions?.hour12,
    }).format(new Date(new Date(date).toISOString().slice(0, -1)));
  const rangesForDay = (day: number) =>
    schedule.availability
      .filter((availability: AvailabilityItem) => availability.days.includes(day))
      .map(
        (availability: AvailabilityItem) =>
          `${formatTime(availability.startTime)} - ${formatTime(availability.endTime)}`
      );

  return (
    <TableRow className="border-subtle group">
      <TableCell className="px-3 py-4 align-top sm:px-4">
        <Link href={redirectUrl} className="block min-w-0 text-sm" title={schedule.name}>
          <span className="flex items-center gap-2">
            <span className="text-emphasis truncate font-semibold group-hover:underline">
              {schedule.name}
            </span>
            {schedule.isDefault && (
              <Badge variant="blue" startIcon="star" className="shrink-0 text-xs">
                {t("default")}
              </Badge>
            )}
          </span>
          {timeZone && (
            <span className="text-subtle mt-1.5 flex items-center gap-1 text-xs">
              <Icon name="globe" className="h-3 w-3 shrink-0" />
              <span className="truncate">{timeZone}</span>
            </span>
          )}
        </Link>
      </TableCell>
      <TableCell className="px-3 py-4 align-top sm:px-4">
        <Link href={redirectUrl} className="block text-sm">
          <span className="flex items-center gap-1" aria-hidden="true">
            {orderedDays.map((day) => {
              const ranges = rangesForDay(day);
              const isActive = ranges.length > 0;
              return (
                <span
                  key={day}
                  title={`${nameOfDay(i18n.language, day, "long")}: ${
                    isActive ? ranges.join(", ") : t("unavailable")
                  }`}
                  className={classNames(
                    "flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-semibold",
                    isActive ? "bg-inverted text-inverted" : "bg-cal-muted text-muted"
                  )}>
                  {new Intl.DateTimeFormat(i18n.language, { weekday: "narrow" }).format(
                    new Date(1970, 0, day + 4)
                  )}
                </span>
              );
            })}
          </span>
          <span className="text-subtle mt-2 block text-xs">
            {availabilityStrings.length > 0
              ? availabilityStrings.map((availabilityString: string) => (
                  <span key={availabilityString} className="block">
                    {availabilityString}
                  </span>
                ))
              : t("unavailable")}
          </span>
        </Link>
      </TableCell>
      <TableCell className="w-px px-3 py-4 text-right align-top sm:px-4">
        <div className="flex items-center justify-end gap-2">
          {!schedule.isDefault && (
            <Button
              type="button"
              color="minimal"
              size="sm"
              StartIcon="star"
              className="hidden whitespace-nowrap lg:inline-flex"
              onClick={() => {
                updateDefault({
                  scheduleId: schedule.id,
                  isDefault: true,
                });
              }}>
              {t("set_as_default")}
            </Button>
          )}
          <Button
            href={redirectUrl}
            color="secondary"
            size="sm"
            StartIcon="pencil"
            className="hidden sm:inline-flex">
            {t("edit")}
          </Button>
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
        </div>
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
      </TableCell>
    </TableRow>
  );
}
