"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { revalidateAvailabilityList } from "app/(use-page-wrapper)/(main-nav)/availability/actions";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import posthog from "posthog-js";

import { BulkEditDefaultForEventsModal } from "@calcom/web/modules/event-types/components/BulkEditDefaultForEventsModal";
import type { BulkUpdatParams } from "@calcom/web/modules/event-types/components/BulkEditDefaultForEventsModal";
import { NewScheduleButton } from "@calcom/features/schedules/components/NewScheduleButton";
import { ScheduleTableRow } from "@calcom/features/schedules/components/ScheduleTableRow";
import { useCompatSearchParams } from "@calcom/lib/hooks/useCompatSearchParams";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { HttpError } from "@calcom/lib/http-error";
import type { RouterOutputs } from "@calcom/trpc/react";
import { trpc } from "@calcom/trpc/react";
import useMeQuery from "@calcom/trpc/react/hooks/useMeQuery";
import { Button } from "@calcom/ui/components/button";
import { EmptyScreen } from "@calcom/ui/components/empty-screen";
import { ToggleGroup } from "@calcom/ui/components/form";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@calcom/ui/components/table/TableNew";
import { Icon } from "@calcom/ui/components/icon";
import { showToast } from "@calcom/ui/components/toast";

type AvailabilityListProps = {
  availabilities: RouterOutputs["viewer"]["availability"]["list"];
};
export function AvailabilityList({ availabilities }: AvailabilityListProps) {
  const { t } = useLocale();
  const [bulkUpdateModal, setBulkUpdateModal] = useState(false);
  const utils = trpc.useUtils();
  const router = useRouter();
  const { data: user } = useMeQuery();

  const deleteMutation = trpc.viewer.availability.schedule.delete.useMutation({
    onMutate: async ({ scheduleId }) => {
      await utils.viewer.availability.list.cancel();
      const previousValue = utils.viewer.availability.list.getData();
      if (previousValue) {
        const filteredValue = previousValue.schedules.filter(({ id }) => id !== scheduleId);
        utils.viewer.availability.list.setData(undefined, { ...previousValue, schedules: filteredValue });
      }

      return { previousValue };
    },

    onError: (err, variables, context) => {
      if (context?.previousValue) {
        utils.viewer.availability.list.setData(undefined, context.previousValue);
      }
      if (err instanceof HttpError) {
        const message = `${err.statusCode}: ${err.message}`;
        showToast(message, "error");
      }
    },
    onSettled: () => {
      utils.viewer.availability.list.invalidate();
    },
    onSuccess: () => {
      revalidateAvailabilityList();
      showToast(t("schedule_deleted_successfully"), "success");
    },
  });

  const updateMutation = trpc.viewer.availability.schedule.update.useMutation({
    onSuccess: async ({ schedule }) => {
      await utils.viewer.availability.list.invalidate();
      revalidateAvailabilityList();
      showToast(
        t("availability_updated_successfully", {
          scheduleName: schedule.name,
        }),
        "success"
      );
      setBulkUpdateModal(true);
    },
    onError: (err) => {
      if (err instanceof HttpError) {
        const message = `${err.statusCode}: ${err.message}`;
        showToast(message, "error");
      }
    },
  });

  const bulkUpdateDefaultAvailabilityMutation =
    trpc.viewer.availability.schedule.bulkUpdateToDefaultAvailability.useMutation();

  const { data: eventTypesQueryData, isFetching: isEventTypesFetching } =
    trpc.viewer.eventTypes.bulkEventFetch.useQuery();

  const bulkUpdateFunction = ({ eventTypeIds, callback }: BulkUpdatParams) => {
    bulkUpdateDefaultAvailabilityMutation.mutate(
      {
        eventTypeIds,
      },
      {
        onSuccess: () => {
          utils.viewer.availability.list.invalidate();
          revalidateAvailabilityList();
          showToast(t("bulk_updated_schedule_successfully"), "success");
          callback();
        },
      }
    );
  };

  const handleBulkEditDialogToggle = () => {
    utils.viewer.apps.getUsersDefaultConferencingApp.invalidate();
  };

  const duplicateMutation = trpc.viewer.availability.schedule.duplicate.useMutation({
    onSuccess: async ({ schedule }) => {
      await router.push(`/availability/${schedule.id}`);
      showToast(t("schedule_created_successfully", { scheduleName: schedule.name }), "success");
    },
    onError: (err) => {
      if (err instanceof HttpError) {
        const message = `${err.statusCode}: ${err.message}`;
        showToast(message, "error");
      }
    },
  });

  // Adds smooth delete button - item fades and old item slides into place

  const [animationParentRef] = useAutoAnimate<HTMLTableSectionElement>();

  return (
    <>
      {availabilities.schedules.length === 0 ? (
        <div className="flex justify-center">
          <EmptyScreen
            Icon="clock"
            headline={t("new_schedule_heading")}
            description={t("new_schedule_description")}
            className="w-full"
            buttonRaw={<NewScheduleButton />}
          />
        </div>
      ) : (
        <>
          <div className="border-subtle bg-default overflow-x-auto rounded-md border">
            <Table className="border-0">
              <TableHeader>
                <TableRow className="border-subtle bg-cal-muted hover:bg-cal-muted">
                  <TableHead className="text-subtle h-10 px-3 text-xs font-medium sm:px-4">{t("name")}</TableHead>
                  <TableHead className="text-subtle h-10 px-3 text-xs font-medium sm:px-4">
                    {t("availability")}
                  </TableHead>
                  <TableHead className="h-10 px-3 sm:px-4">
                    <span className="sr-only">{t("options")}</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody data-testid="schedules" ref={animationParentRef}>
                {availabilities.schedules.map((schedule) => (
                  <ScheduleTableRow
                    redirectUrl={`/availability/${schedule.id}`}
                    displayOptions={{
                      hour12: user?.timeFormat ? user.timeFormat === 12 : undefined,
                      timeZone: user?.timeZone,
                      weekStart: user?.weekStart || "Sunday",
                    }}
                    key={schedule.id}
                    schedule={schedule}
                    isDeletable={availabilities.schedules.length !== 1}
                    updateDefault={updateMutation.mutate}
                    deleteFunction={deleteMutation.mutate}
                    duplicateFunction={duplicateMutation.mutate}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="border-subtle bg-default mb-16 mt-6 flex flex-col gap-4 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="bg-subtle text-emphasis flex h-9 w-9 shrink-0 items-center justify-center rounded-md">
                <Icon name="calendar-x-2" className="h-4 w-4" />
              </div>
              <div>
                <p className="text-emphasis text-sm font-semibold">{t("temporarily_out_of_office")}</p>
                <p className="text-subtle mt-0.5 text-sm">{t("out_of_office_description")}</p>
              </div>
            </div>
            <Button
              href="/settings/my-account/out-of-office"
              color="secondary"
              StartIcon="plus"
              className="self-start sm:self-auto">
              {t("add_a_redirect")}
            </Button>
          </div>
          {bulkUpdateModal && (
            <BulkEditDefaultForEventsModal
              isPending={bulkUpdateDefaultAvailabilityMutation.isPending}
              open={bulkUpdateModal}
              setOpen={setBulkUpdateModal}
              bulkUpdateFunction={bulkUpdateFunction}
              description={t("default_schedules_bulk_description")}
              eventTypes={eventTypesQueryData?.eventTypes}
              isEventTypesFetching={isEventTypesFetching}
              handleBulkEditDialogToggle={handleBulkEditDialogToggle}
            />
          )}
        </>
      )}
    </>
  );
}

type AvailabilityCTAProps = {
  canViewTeamAvailability: boolean;
};
export const AvailabilityCTA = ({ canViewTeamAvailability }: AvailabilityCTAProps) => {
  const searchParams = useCompatSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLocale();

  const toggleGroupOptions = [
    { value: "mine", label: t("my_availability") },
    ...(canViewTeamAvailability ? [{ value: "team", label: t("team_availability"), onClick: () => { posthog.capture("team_availability_toggle_clicked") } }] : []),
  ]

  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams ?? undefined);
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  return (
    <div className="flex items-center gap-2">
      <ToggleGroup
        className="hidden h-fit md:block"
        defaultValue={searchParams?.get("type") ?? "mine"}
        onValueChange={(value) => {
          if (!value) return;
          router.push(`${pathname}?${createQueryString("type", value)}`);
        }}
        options={toggleGroupOptions}
      />
      <NewScheduleButton />
    </div>
  );
};
