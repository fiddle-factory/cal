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

type Schedule = RouterOutputs["viewer"]["availability"]["list"]["schedules"][number];

export type ScheduleActionsProps = {
  schedule: Schedule;
  deleteFunction: ({ scheduleId }: { scheduleId: number }) => void;
  isDeletable: boolean;
  updateDefault: ({ scheduleId, isDefault }: { scheduleId: number; isDefault: boolean }) => void;
  duplicateFunction: ({ scheduleId }: { scheduleId: number }) => void;
  size?: "base" | "sm";
};

/** The "more" menu of a schedule (Set as default, Duplicate, Delete) with its delete confirmation. */
export function ScheduleActionsMenu({
  schedule,
  deleteFunction,
  isDeletable,
  updateDefault,
  duplicateFunction,
  size = "base",
}: ScheduleActionsProps) {
  const { t } = useLocale();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <Dropdown>
        <DropdownMenuTrigger asChild>
          <Button
            data-testid="schedule-more"
            type="button"
            variant="icon"
            color={size === "sm" ? "minimal" : "secondary"}
            size={size}
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
    </>
  );
}

export function ScheduleListItem({
  schedule,
  deleteFunction,
  displayOptions,
  updateDefault,
  isDeletable,
  duplicateFunction,
  redirectUrl,
  variant = "default",
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
  /** "compact" renders a dense single-line row. */
  variant?: "default" | "compact";
}) {
  const { t, i18n } = useLocale();

  type AvailabilityItem = (typeof schedule.availability)[number];

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

  const actions = (
    <ScheduleActionsMenu
      schedule={schedule}
      deleteFunction={deleteFunction}
      isDeletable={isDeletable}
      updateDefault={updateDefault}
      duplicateFunction={duplicateFunction}
      size={variant === "compact" ? "sm" : "base"}
    />
  );

  if (variant === "compact") {
    return (
      <li key={schedule.id}>
        <div className="hover:bg-cal-muted flex items-center gap-3 px-3 py-2 transition sm:px-4">
          <Link
            href={redirectUrl}
            className="flex min-w-0 grow items-center gap-3 text-sm"
            title={schedule.name}>
            <span className="text-emphasis w-40 shrink-0 truncate font-medium">{schedule.name}</span>
            <span className="text-subtle min-w-0 grow truncate">
              {availabilityStrings.length ? availabilityStrings.join(" · ") : t("unavailable")}
            </span>
            {timeZone && (
              <span className="text-muted hidden shrink-0 items-center gap-1 text-xs md:flex">
                <Icon name="globe" className="h-3 w-3" />
                {timeZone}
              </span>
            )}
          </Link>
          {actions}
        </div>
      </li>
    );
  }

  return (
    <li key={schedule.id}>
      <div className="hover:bg-cal-muted flex items-center justify-between px-3 py-5 transition sm:px-4">
        <div className="group flex w-full items-center justify-between ">
          <Link href={redirectUrl} className="grow truncate text-sm" title={schedule.name}>
            <div className="space-x-2 rtl:space-x-reverse">
              <span className="text-emphasis truncate font-medium">{schedule.name}</span>
              {schedule.isDefault && (
                <Badge variant="gray" className="text-xs">
                  {t("default")}
                </Badge>
              )}
            </div>
            <p className="text-subtle mt-1">
              {availabilityStrings.map((availabilityString: string) => (
                <Fragment key={availabilityString}>
                  {availabilityString}
                  <br />
                </Fragment>
              ))}
              {timeZone && (
                <span className="my-1 flex items-center first-letter:text-xs">
                  <Icon name="globe" className="h-3.5 w-3.5" />
                  &nbsp;{timeZone}
                </span>
              )}
            </p>
          </Link>
        </div>
        {actions}
      </div>
    </li>
  );
}
