"use client";

import dayjs from "@calcom/dayjs";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import classNames from "@calcom/ui/classNames";
import { Avatar } from "@calcom/ui/components/avatar";
import { Badge } from "@calcom/ui/components/badge";
import { Button } from "@calcom/ui/components/button";
import { ToggleGroup } from "@calcom/ui/components/form";
import { Icon } from "@calcom/ui/components/icon";
import type { IconName } from "@calcom/ui/components/icon";

import type { BookingListingStatus } from "../types";

export type KanbanBookingLocation = {
  type: "video" | "phone" | "inPerson";
  label: string;
};

export type KanbanBookingAttendee = {
  name: string;
  email: string;
};

export type KanbanBooking = {
  uid: string;
  title: string;
  startTime: string;
  endTime: string;
  eventTypeColor?: string;
  attendees: KanbanBookingAttendee[];
  location: KanbanBookingLocation;
  recurringLabel?: string;
};

export type KanbanColumn = {
  status: BookingListingStatus;
  bookings: KanbanBooking[];
};

type BookingKanbanBoardProps = {
  columns: KanbanColumn[];
  onViewChange?: (view: string) => void;
};

const statusDotClass: Record<BookingListingStatus, string> = {
  upcoming: "bg-blue-500",
  unconfirmed: "bg-orange-400",
  recurring: "bg-purple-500",
  past: "bg-gray-400",
  cancelled: "bg-red-500",
};

const locationIcon: Record<KanbanBookingLocation["type"], IconName> = {
  video: "video",
  phone: "phone",
  inPerson: "map-pin",
};

const MAX_AVATARS = 3;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function AttendeeAvatars({ attendees }: { attendees: KanbanBookingAttendee[] }) {
  const visible = attendees.slice(0, MAX_AVATARS);
  const hiddenCount = attendees.length - visible.length;
  return (
    <ul className="flex items-center">
      {visible.map((attendee) => (
        <li key={attendee.email} className="-mr-1.5 inline-block">
          <Avatar
            size="sm"
            alt={attendee.name}
            title={attendee.name}
            className="border-default ring-default ring-2"
            fallback={
              <span className="text-emphasis text-[10px] font-semibold leading-none">
                {getInitials(attendee.name)}
              </span>
            }
          />
        </li>
      ))}
      {hiddenCount > 0 && (
        <li className="bg-emphasis text-emphasis ring-default -mr-1.5 inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-[10px] font-semibold ring-2">
          +{hiddenCount}
        </li>
      )}
    </ul>
  );
}

function KanbanCard({ booking, status }: { booking: KanbanBooking; status: BookingListingStatus }) {
  const { t } = useLocale();
  const isCancelled = status === "cancelled";
  const isPast = status === "past";
  const start = dayjs(booking.startTime);
  const end = dayjs(booking.endTime);

  return (
    <div
      data-testid="kanban-booking-card"
      className={classNames(
        "bg-default border-subtle hover:border-emphasis group relative flex cursor-pointer flex-col gap-3 overflow-hidden rounded-xl border p-3 shadow-sm transition",
        (isPast || isCancelled) && "opacity-80"
      )}>
      {booking.eventTypeColor && (
        <div
          className="absolute bottom-3 left-0 top-3 w-0.5 rounded-r"
          style={{ backgroundColor: booking.eventTypeColor }}
        />
      )}
      <div className="flex items-start justify-between gap-2">
        <p
          className={classNames(
            "text-emphasis line-clamp-2 text-sm font-semibold leading-5",
            isCancelled && "line-through"
          )}>
          {booking.title}
        </p>
        <Button
          color="minimal"
          variant="icon"
          size="xs"
          StartIcon="ellipsis"
          className="-mr-1 -mt-0.5 shrink-0"
          aria-label="more"
        />
      </div>

      <div className="text-subtle flex flex-col gap-1.5 text-xs">
        <div className="flex items-center gap-1.5">
          <Icon name="calendar" className="h-3.5 w-3.5 shrink-0" />
          <span>{start.format("ddd, D MMM")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Icon name="clock" className="h-3.5 w-3.5 shrink-0" />
          <span>
            {start.format("h:mma")} – {end.format("h:mma")}
          </span>
        </div>
        {booking.recurringLabel && (
          <div className="flex items-center gap-1.5">
            <Icon name="repeat" className="h-3.5 w-3.5 shrink-0" />
            <span>{booking.recurringLabel}</span>
          </div>
        )}
      </div>

      <div className="border-subtle flex items-center justify-between gap-2 border-t pt-3">
        <AttendeeAvatars attendees={booking.attendees} />
        <div
          className="text-default flex min-w-0 items-center gap-1 text-xs"
          title={booking.location.label}>
          <Icon name={locationIcon[booking.location.type]} className="text-subtle h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{booking.location.label}</span>
        </div>
      </div>

      {status === "unconfirmed" && (
        <div className="flex gap-2">
          <Button color="secondary" size="sm" className="flex-1 justify-center">
            {t("reject")}
          </Button>
          <Button color="primary" size="sm" className="flex-1 justify-center">
            {t("confirm")}
          </Button>
        </div>
      )}
    </div>
  );
}

function KanbanColumnView({ column }: { column: KanbanColumn }) {
  const { t } = useLocale();
  return (
    <section
      data-testid={`kanban-column-${column.status}`}
      className="bg-muted border-subtle flex w-72 shrink-0 flex-col rounded-2xl border">
      <header className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className={classNames("h-2 w-2 rounded-full", statusDotClass[column.status])} />
          <h3 className="text-emphasis text-sm font-semibold">{t(column.status)}</h3>
          <Badge variant="gray" size="sm" rounded>
            {column.bookings.length}
          </Badge>
        </div>
        <Button color="minimal" variant="icon" size="xs" StartIcon="ellipsis" aria-label="more" />
      </header>
      <div className="flex flex-1 flex-col gap-2 px-2 pb-2">
        {column.bookings.length === 0 ? (
          <div className="border-subtle text-subtle flex h-24 items-center justify-center rounded-xl border border-dashed text-xs">
            {t("no_bookings_in_column")}
          </div>
        ) : (
          column.bookings.map((booking) => (
            <KanbanCard key={booking.uid} booking={booking} status={column.status} />
          ))
        )}
      </div>
    </section>
  );
}

export function BookingKanbanBoard({ columns, onViewChange }: BookingKanbanBoardProps) {
  const { t } = useLocale();
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button color="secondary" StartIcon="list-filter" size="sm">
          {t("filter")}
        </Button>
        <div className="hidden grow md:block" />
        <ToggleGroup
          value="board"
          onValueChange={(value: string) => {
            if (!value) return;
            onViewChange?.(value);
          }}
          options={[
            {
              value: "list",
              label: "",
              tooltip: t("list_view"),
              iconLeft: <Icon name="menu" className="h-4 w-4" />,
            },
            {
              value: "calendar",
              label: "",
              tooltip: t("calendar_view"),
              iconLeft: <Icon name="calendar" className="h-4 w-4" />,
            },
            {
              value: "board",
              label: "",
              tooltip: t("board_view"),
              iconLeft: <Icon name="columns-3" className="h-4 w-4" />,
            },
          ]}
        />
      </div>
      <div className="mt-4 overflow-x-auto pb-4">
        <div className="flex items-start gap-3">
          {columns.map((column) => (
            <KanbanColumnView key={column.status} column={column} />
          ))}
        </div>
      </div>
    </>
  );
}
