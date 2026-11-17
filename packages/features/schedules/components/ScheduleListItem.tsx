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

type DisplayOptions = {
  timeZone?: string;
  hour12?: boolean;
  weekStart?: string;
};

type ScheduleListItemProps = {
  schedule: Schedule;
  deleteFunction: ({ scheduleId }: { scheduleId: number }) => void;
  displayOptions?: DisplayOptions;
  isDeletable: boolean;
  updateDefault: ({ scheduleId, isDefault }: { scheduleId: number; isDefault: boolean }) => void;
  duplicateFunction: ({ scheduleId }: { scheduleId: number }) => void;
  redirectUrl: string;
  /** "list" renders a divided list row, "card" renders a standalone card for grid layouts. */
  variant?: "list" | "card";
};

/** Maximum number of availability lines shown on a card before collapsing into "N more". */
const CARD_MAX_LINES = 2;

function useAvailabilityStrings(schedule: Schedule, displayOptions?: DisplayOptions) {
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
  ScheduleListItemProps,
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

function ScheduleCardItem({
  schedule,
  displayOptions,
  redirectUrl,
  ...actionProps
}: Omit<ScheduleListItemProps, "variant">) {
  const { t } = useLocale();
  const availabilityStrings = useAvailabilityStrings(schedule, displayOptions);
  const visibleStrings = availabilityStrings.slice(0, CARD_MAX_LINES);
  const hiddenCount = availabilityStrings.length - visibleStrings.length;
  const timeZone = schedule.timeZone ?? displayOptions?.timeZone;

  return (
    <li className="border-subtle bg-default hover:bg-cal-muted relative flex flex-col rounded-md border transition">
      <Link href={redirectUrl} className="flex h-full flex-col text-sm" title={schedule.name}>
        <div className="flex min-w-0 items-center gap-2 p-4 pb-0 ltr:pr-14 rtl:pl-14">
          <span className="text-emphasis truncate font-semibold">{schedule.name}</span>
          {schedule.isDefault && (
            <Badge variant="gray" className="shrink-0 text-xs">
              {t("default")}
            </Badge>
          )}
        </div>
        <div className="text-default mt-3 flex grow flex-col gap-1.5 px-4 pb-4">
          {visibleStrings.length === 0 ? (
            <span className="text-subtle">{t("unavailable")}</span>
          ) : (
            visibleStrings.map((availabilityString) => (
              <span key={availabilityString} className="flex items-center gap-2">
                <Icon name="clock" className="text-subtle h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{availabilityString}</span>
              </span>
            ))
          )}
          {hiddenCount > 0 && (
            <span className="text-subtle text-xs ltr:pl-[1.375rem] rtl:pr-[1.375rem]">
              {t("plus_more", { count: hiddenCount })}
            </span>
          )}
        </div>
        {timeZone && (
          <div className="border-subtle text-subtle flex items-center gap-1.5 border-t px-4 py-3 text-xs">
            <Icon name="globe" className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{timeZone}</span>
          </div>
        )}
      </Link>
      <div className="absolute top-3 ltr:right-3 rtl:left-3">
        <ScheduleActions schedule={schedule} {...actionProps} />
      </div>
    </li>
  );
}

export function ScheduleListItem({ variant = "list", ...props }: ScheduleListItemProps) {
  if (variant === "card") return <ScheduleCardItem {...props} />;

  return <ScheduleRowItem {...props} />;
}

function ScheduleRowItem({
  schedule,
  displayOptions,
  redirectUrl,
  ...actionProps
}: Omit<ScheduleListItemProps, "variant">) {
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
        <ScheduleActions schedule={schedule} {...actionProps} />
      </div>
    </li>
  );
}
