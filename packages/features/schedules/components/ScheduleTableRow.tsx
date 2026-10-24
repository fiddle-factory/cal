"use client";

import Link from "next/link";
import { useState } from "react";

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

  return (
    <TableRow className="border-subtle">
      <TableCell className="px-3 py-4 sm:px-4">
        <Link href={redirectUrl} className="flex items-center gap-2 text-sm" title={schedule.name}>
          <span className="text-emphasis truncate font-medium">{schedule.name}</span>
          {schedule.isDefault && (
            <Badge variant="gray" className="text-xs">
              {t("default")}
            </Badge>
          )}
        </Link>
      </TableCell>
      <TableCell className="text-subtle px-3 py-4 sm:px-4">
        <Link href={redirectUrl} className="block text-sm">
          {availabilityStrings.map((availabilityString: string) => (
            <span key={availabilityString} className="block">
              {availabilityString}
            </span>
          ))}
        </Link>
      </TableCell>
      <TableCell className="text-subtle px-3 py-4 sm:px-4">
        {timeZone && (
          <Link href={redirectUrl} className="flex items-center gap-1 text-sm">
            <Icon name="globe" className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{timeZone}</span>
          </Link>
        )}
      </TableCell>
      <TableCell className="w-px px-3 py-4 text-right sm:px-4">
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
      </TableCell>
    </TableRow>
  );
}
