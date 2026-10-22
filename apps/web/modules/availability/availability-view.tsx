"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { revalidateAvailabilityList } from "app/(use-page-wrapper)/(main-nav)/availability/actions";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import posthog from "posthog-js";

import { BulkEditDefaultForEventsModal } from "@calcom/web/modules/event-types/components/BulkEditDefaultForEventsModal";
import type { BulkUpdatParams } from "@calcom/web/modules/event-types/components/BulkEditDefaultForEventsModal";
import { NewScheduleButton } from "@calcom/features/schedules/components/NewScheduleButton";
import { ScheduleListItem } from "@calcom/features/schedules/components/ScheduleListItem";
import { useCompatSearchParams } from "@calcom/lib/hooks/useCompatSearchParams";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { HttpError } from "@calcom/lib/http-error";
import type { RouterOutputs } from "@calcom/trpc/react";
import { trpc } from "@calcom/trpc/react";
import useMeQuery from "@calcom/trpc/react/hooks/useMeQuery";
import { EmptyScreen } from "@calcom/ui/components/empty-screen";
import { ToggleGroup } from "@calcom/ui/components/form";
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

  const [animationParentRef] = useAutoAnimate<HTMLUListElement>();

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
          <div className="border-subtle bg-default overflow-hidden rounded-md border">
            <ul className="divide-subtle divide-y" data-testid="schedules" ref={animationParentRef}>
              {availabilities.schedules.map((schedule) => (
                <ScheduleListItem
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
            </ul>
          </div>
          <div className="text-default mb-16 mt-4 block text-center text-sm">
            {t("temporarily_out_of_office")}{" "}
            <Link href="settings/my-account/out-of-office" className="underline">
              {t("add_a_redirect")}
            </Link>
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

type Schedule = AvailabilityListProps["availabilities"]["schedules"][number];

const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

type AvailabilityStatus =
  | { kind: "available"; until: string }
  | { kind: "later"; from: string }
  | { kind: "away" };

// Schedule ranges store wall-clock times as UTC hours/minutes in the schedule's time zone.
function getAvailabilityStatus(schedule: Schedule, now: Date, hour12: boolean): AvailabilityStatus {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: schedule.timeZone ?? undefined,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekday = WEEKDAY_INDEX[part("weekday")];
  const nowMinutes = Number(part("hour")) * 60 + Number(part("minute"));
  const toMinutes = (date: Date) => new Date(date).getUTCHours() * 60 + new Date(date).getUTCMinutes();
  const formatTime = (date: Date) =>
    new Intl.DateTimeFormat(undefined, { timeZone: "UTC", hour: "numeric", minute: "2-digit", hour12 }).format(
      new Date(date)
    );

  const today = schedule.availability
    .filter((range) => range.days.includes(weekday))
    .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

  const current = today.find(
    (range) => toMinutes(range.startTime) <= nowMinutes && nowMinutes < toMinutes(range.endTime)
  );
  if (current) return { kind: "available", until: formatTime(current.endTime) };

  const next = today.find((range) => toMinutes(range.startTime) > nowMinutes);
  if (next) return { kind: "later", from: formatTime(next.startTime) };

  return { kind: "away" };
}

type AvailabilityHeroProps = {
  heading: string;
  subtitle: string;
  schedules: Schedule[];
  CTA?: ReactNode;
};
export function AvailabilityHero({ heading, subtitle, schedules, CTA }: AvailabilityHeroProps) {
  const { t } = useLocale();
  const { data: user } = useMeQuery();
  const defaultSchedule = schedules.find((schedule) => schedule.isDefault);
  const hour12 = user?.timeFormat ? user.timeFormat === 12 : true;
  const [status, setStatus] = useState<AvailabilityStatus | null>(null);

  // Computed after mount so server and client markup match.
  useEffect(() => {
    if (!defaultSchedule) return setStatus(null);
    setStatus(getAvailabilityStatus(defaultSchedule, new Date(), hour12));
  }, [defaultSchedule, hour12]);

  return (
    <section className="border-subtle mb-6 rounded-xl border bg-linear-to-r from-purple-50 via-purple-50 to-pink-50 px-5 py-6 sm:px-6 lg:mb-8 dark:from-purple-950/40 dark:via-purple-950/30 dark:to-pink-950/40">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="font-heading text-emphasis text-xl tracking-wide md:text-2xl">{heading}</h3>
          <p className="text-default mt-1 text-sm" data-testid="subtitle">
            {subtitle}
          </p>
          {status && (
            <p
              className="text-emphasis mt-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-sm font-semibold dark:bg-black/30"
              data-testid="availability-status">
              <span
                aria-hidden
                className={
                  status.kind === "available"
                    ? "h-2 w-2 rounded-full bg-green-500"
                    : "h-2 w-2 rounded-full bg-gray-400"
                }
              />
              <span>{status.kind === "available" ? t("available_now") : t("unavailable")}</span>
              {status.kind !== "away" && (
                <>
                  <span aria-hidden className="text-subtle">
                    ·
                  </span>
                  <span className="font-medium">
                    {status.kind === "available"
                      ? `${t("until")} ${status.until}`
                      : `${t("available_from")} ${status.from}`}
                  </span>
                </>
              )}
            </p>
          )}
        </div>
        {CTA && <div className="shrink-0 [-webkit-app-region:no-drag]">{CTA}</div>}
      </div>
    </section>
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
