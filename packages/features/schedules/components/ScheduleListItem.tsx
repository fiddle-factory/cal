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
import { TableCell, TableRow } from "@calcom/ui/components/table";
import { showToast } from "@calcom/ui/components/toast";

type Schedule = RouterOutputs["viewer"]["availability"]["list"]["schedules"][number];

type ScheduleItemProps = {
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
};

function useAvailabilityStrings(schedule: Schedule, displayOptions: ScheduleItemProps["displayOptions"]) {
  const { i18n } = useLocale();
  type AvailabilityItem = (typeof schedule.availability)[number];
  return (
    schedule.availability
      .filter((availability: AvailabilityItem) => !!availability.days.length)
      .map((availability: AvailabilityItem) =>
        availabilityAsString(availability, {
          locale: i18n.language,
          hour12: displayOptions?.hour12,
        })
      )
      // sort the availability strings as per user's weekstart (settings)
      .sort(sortAvailabilityStrings(i18n.language, displayOptions?.weekStart))
  );
}

function ScheduleActions({
  schedule,
  deleteFunction,
  updateDefault,
  isDeletable,
  duplicateFunction,
}: Pick<
  ScheduleItemProps,
  "schedule" | "deleteFunction" | "updateDefault" | "isDeletable" | "duplicateFunction"
>) {
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
}: ScheduleItemProps) {
  const { t } = useLocale();
  const availabilityStrings = useAvailabilityStrings(schedule, displayOptions);

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
              {(schedule.timeZone || displayOptions?.timeZone) && (
                <span className="my-1 flex items-center first-letter:text-xs">
                  <Icon name="globe" className="h-3.5 w-3.5" />
                  &nbsp;{schedule.timeZone ?? displayOptions?.timeZone}
                </span>
              )}
            </p>
          </Link>
        </div>
        <ScheduleActions
          schedule={schedule}
          deleteFunction={deleteFunction}
          updateDefault={updateDefault}
          isDeletable={isDeletable}
          duplicateFunction={duplicateFunction}
        />
      </div>
    </li>
  );
}

export function ScheduleTableRow({
  schedule,
  deleteFunction,
  displayOptions,
  updateDefault,
  isDeletable,
  duplicateFunction,
  redirectUrl,
}: ScheduleItemProps) {
  const { t } = useLocale();
  const availabilityStrings = useAvailabilityStrings(schedule, displayOptions);
  const timeZone = schedule.timeZone ?? displayOptions?.timeZone;

  return (
    <TableRow className="border-subtle align-top">
      <TableCell className="px-3 py-4 align-top sm:px-4">
        <Link
          href={redirectUrl}
          className="flex items-center gap-2 text-sm rtl:flex-row-reverse rtl:justify-end"
          title={schedule.name}>
          <span className="text-emphasis truncate font-medium">{schedule.name}</span>
          {schedule.isDefault && (
            <Badge variant="gray" className="text-xs">
              {t("default")}
            </Badge>
          )}
        </Link>
      </TableCell>
      <TableCell className="text-subtle px-3 py-4 align-top sm:px-4">
        <Link href={redirectUrl} className="block">
          {availabilityStrings.map((availabilityString: string) => (
            <span key={availabilityString} className="block">
              {availabilityString}
            </span>
          ))}
        </Link>
      </TableCell>
      <TableCell className="text-subtle hidden px-3 py-4 align-top sm:px-4 md:table-cell">
        {timeZone && (
          <span className="flex items-center gap-1">
            <Icon name="globe" className="h-3.5 w-3.5 shrink-0" />
            {timeZone}
          </span>
        )}
      </TableCell>
      <TableCell className="w-px px-3 py-3 text-right align-top sm:px-4">
        <ScheduleActions
          schedule={schedule}
          deleteFunction={deleteFunction}
          updateDefault={updateDefault}
          isDeletable={isDeletable}
          duplicateFunction={duplicateFunction}
        />
      </TableCell>
    </TableRow>
  );
}
