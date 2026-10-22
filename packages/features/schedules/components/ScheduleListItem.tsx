"use client";

import Link from "next/link";
import { Fragment, useState } from "react";

import { availabilityAsString } from "@calcom/lib/availability";
import { useLocale } from "@calcom/lib/hooks/useLocale";
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

// Lavender family: lavender, lilac, periwinkle, orchid
const SCHEDULE_ACCENTS = [
  { stripe: "bg-purple-400", activeDay: "bg-purple-600 text-white" },
  { stripe: "bg-violet-400", activeDay: "bg-violet-600 text-white" },
  { stripe: "bg-indigo-400", activeDay: "bg-indigo-600 text-white" },
  { stripe: "bg-fuchsia-400", activeDay: "bg-fuchsia-700 text-white" },
] as const;

// 1 = Monday … 0 = Sunday (JS getDay numbering)
const WEEK_DAYS_MON_FIRST = [1, 2, 3, 4, 5, 6, 0];

export function ScheduleListItem({
  schedule,
  accentIndex,
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
  /** Picks the schedule's lavender-family accent shade; defaults to the schedule id. */
  accentIndex?: number;
}) {
  const { t, i18n } = useLocale();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  type AvailabilityItem = (typeof schedule.availability)[number];

  const accent = SCHEDULE_ACCENTS[Math.abs(accentIndex ?? schedule.id) % SCHEDULE_ACCENTS.length];
  const activeDays = new Set(schedule.availability.flatMap((availability) => availability.days));
  const dayFormatter = new Intl.DateTimeFormat(i18n.language, { weekday: "short", timeZone: "UTC" });

  return (
    <li key={schedule.id} className="relative">
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-3 left-0 w-1.5 rounded-r-full rtl:left-auto rtl:right-0 rtl:rounded-l-full rtl:rounded-r-none ${accent.stripe}`}
      />
      <div className="hover:bg-cal-muted flex items-center justify-between px-3 py-5 transition sm:px-4">
        <div className="group flex w-full items-center justify-between ">
          <Link href={redirectUrl} className="grow truncate text-sm" title={schedule.name}>
            <div className="space-x-2 rtl:space-x-reverse">
              <span className="text-emphasis truncate font-medium">{schedule.name}</span>
              {schedule.isDefault && (
                <Badge variant="purple" className="bg-purple-700 text-xs text-white">
                  {t("default")}
                </Badge>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-1" aria-hidden="true">
              {WEEK_DAYS_MON_FIRST.map((day) => {
                const isActive = activeDays.has(day);
                return (
                  <span
                    key={day}
                    className={`inline-flex min-w-9 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none ${
                      isActive ? accent.activeDay : "bg-subtle text-subtle"
                    }`}>
                    {dayFormatter.format(new Date(Date.UTC(2024, 0, day === 0 ? 7 : day)))}
                  </span>
                );
              })}
            </div>
            <p className="text-subtle mt-1">
              {schedule.availability
                .filter(
                  (availability: AvailabilityItem) => !!availability.days.length
                )
                .map((availability: AvailabilityItem) =>
                  availabilityAsString(availability, {
                    locale: i18n.language,
                    hour12: displayOptions?.hour12,
                  })
                )
                // sort the availability strings as per user's weekstart (settings)
                .sort(
                  sortAvailabilityStrings(
                    i18n.language,
                    displayOptions?.weekStart
                  )
                )
                .map((availabilityString: string) => (
                  <Fragment key={availabilityString}>
                    {availabilityString}
                    <br />
                  </Fragment>
                ))}
              {(schedule.timeZone || displayOptions?.timeZone) && (
                <span className="my-1 flex items-center first-letter:text-xs">
                  <Icon name="globe" className="h-3.5 w-3.5" />
                  &nbsp;{schedule.timeZone ?? displayOptions?.timeZone}
                </span>
              )}
            </p>
          </Link>
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
