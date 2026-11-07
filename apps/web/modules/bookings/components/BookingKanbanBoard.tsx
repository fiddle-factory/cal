"use client";

import dayjs from "@calcom/dayjs";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import classNames from "@calcom/ui/classNames";
import { Avatar } from "@calcom/ui/components/avatar";
import { Badge } from "@calcom/ui/components/badge";
import { Button } from "@calcom/ui/components/button";
import { ToggleGroup } from "@calcom/ui/components/form";
import type { IconName } from "@calcom/ui/components/icon";
import { Icon } from "@calcom/ui/components/icon";
import { useState } from "react";

import type { BookingListingStatus } from "../types";

export type KanbanBookingLocation = {
  type: "video" | "phone" | "inPerson";
  label: string;
};

export type KanbanBookingAttendee = {
  name: string;
  email: string;
};

export type KanbanBookingPaymentStatus = "paid" | "pending";

export type KanbanBooking = {
  uid: string;
  title: string;
  startTime: string;
  endTime: string;
  eventTypeColor?: string;
  attendees: KanbanBookingAttendee[];
  /** `null` when the event type has no location defined */
  location: KanbanBookingLocation | null;
  recurringLabel?: string;
  /** The booking was moved to a new time slot */
  rescheduled?: boolean;
  /** One or more attendees were marked as no-show */
  noShow?: boolean;
  /** Only set for paid event types */
  paymentStatus?: KanbanBookingPaymentStatus;
};

export type KanbanColumn = {
  status: BookingListingStatus;
  bookings: KanbanBooking[];
};

export type KanbanCardPendingAction = "confirm" | "reject";

/** Forces a pointer/keyboard state so it can be previewed without interaction */
export type KanbanCardPreviewState = "hover" | "focus" | "active";

type BookingKanbanBoardProps = {
  columns: KanbanColumn[];
  onViewChange?: (view: string) => void;
  onConfirm?: (uid: string) => Promise<void> | void;
  onReject?: (uid: string) => Promise<void> | void;
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
        <li
          className="bg-emphasis text-emphasis ring-default -mr-1.5 inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-[10px] font-semibold ring-2"
          title={attendees
            .slice(MAX_AVATARS)
            .map((attendee) => attendee.name)
            .join(", ")}>
          +{hiddenCount}
        </li>
      )}
    </ul>
  );
}

export type KanbanCardProps = {
  booking: KanbanBooking;
  status: BookingListingStatus;
  isSelected?: boolean;
  isDragging?: boolean;
  pendingAction?: KanbanCardPendingAction | null;
  previewState?: KanbanCardPreviewState;
  now?: Date;
  onSelect?: (uid: string) => void;
  onConfirm?: (uid: string) => Promise<void> | void;
  onReject?: (uid: string) => Promise<void> | void;
};

export function KanbanCard({
  booking,
  status,
  isSelected = false,
  isDragging: isDraggingProp = false,
  pendingAction: pendingActionProp = null,
  previewState,
  now,
  onSelect,
  onConfirm,
  onReject,
}: KanbanCardProps) {
  const { t } = useLocale();
  const [isDraggingLocal, setIsDraggingLocal] = useState(false);
  const [pendingActionLocal, setPendingActionLocal] = useState<KanbanCardPendingAction | null>(null);
  const isDragging = isDraggingProp || isDraggingLocal;
  const pendingAction = pendingActionProp ?? pendingActionLocal;
  const isCancelled = status === "cancelled";
  const isPast = status === "past";
  const start = dayjs(booking.startTime);
  const end = dayjs(booking.endTime);
  const current = dayjs(now);
  const isHappeningNow = !isCancelled && !isPast && !current.isBefore(start) && current.isBefore(end);

  const runAction = async (action: KanbanCardPendingAction) => {
    const handler = action === "confirm" ? onConfirm : onReject;
    if (!handler || pendingAction) return;
    setPendingActionLocal(action);
    try {
      await handler(booking.uid);
    } finally {
      setPendingActionLocal(null);
    }
  };

  const hasBadges = isHappeningNow || booking.rescheduled || booking.noShow || booking.paymentStatus;

  return (
    <div
      data-testid="kanban-booking-card"
      data-preview-state={previewState}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-busy={pendingAction ? true : undefined}
      draggable={!pendingAction}
      onClick={() => onSelect?.(booking.uid)}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect?.(booking.uid);
        }
      }}
      onDragStart={() => setIsDraggingLocal(true)}
      onDragEnd={() => setIsDraggingLocal(false)}
      className={classNames(
        "hover:border-emphasis group relative flex cursor-pointer flex-col gap-3 overflow-hidden rounded-xl border p-3 transition",
        "focus-visible:ring-emphasis focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "active:bg-cal-muted active:shadow-none",
        "data-[preview-state=hover]:border-emphasis",
        "data-[preview-state=focus]:ring-emphasis data-[preview-state=focus]:ring-2 data-[preview-state=focus]:ring-offset-2",
        "data-[preview-state=active]:bg-cal-muted data-[preview-state=active]:border-emphasis data-[preview-state=active]:shadow-none",
        (isPast || isCancelled) && !isSelected && !isDragging && "opacity-80",
        isSelected ? "border-brand-default ring-brand-default bg-subtle ring-1" : "bg-default",
        isDragging
          ? "border-emphasis cursor-grabbing rotate-2 shadow-lg opacity-90"
          : classNames("shadow-sm", !isSelected && "border-subtle"),
        pendingAction && "cursor-progress"
      )}>
      {booking.eventTypeColor && (
        <div
          className="absolute bottom-3 left-0 top-3 w-0.5 rounded-r"
          style={{ backgroundColor: booking.eventTypeColor }}
        />
      )}
      <div className="flex items-start justify-between gap-2">
        <p
          title={booking.title}
          className={classNames(
            "text-emphasis line-clamp-2 min-w-0 break-words text-sm font-semibold leading-5",
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
          onClick={(event) => event.stopPropagation()}
        />
      </div>

      {hasBadges && (
        <div className="-mt-1 flex flex-wrap gap-1">
          {isHappeningNow && (
            <Badge variant="green" size="sm" withDot>
              {t("happening_now")}
            </Badge>
          )}
          {booking.rescheduled && (
            <Badge variant="blue" size="sm" startIcon="calendar-range">
              {t("rescheduled")}
            </Badge>
          )}
          {booking.noShow && (
            <Badge variant="orange" size="sm" startIcon="user-x">
              {t("no_show")}
            </Badge>
          )}
          {booking.paymentStatus === "paid" && (
            <Badge variant="green" size="sm" startIcon="credit-card">
              {t("paid")}
            </Badge>
          )}
          {booking.paymentStatus === "pending" && (
            <Badge variant="orange" size="sm" startIcon="credit-card">
              {t("pending_payment")}
            </Badge>
          )}
        </div>
      )}

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
        {booking.location ? (
          <div
            className="text-default flex min-w-0 items-center gap-1 text-xs"
            title={booking.location.label}>
            <Icon name={locationIcon[booking.location.type]} className="text-subtle h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{booking.location.label}</span>
          </div>
        ) : (
          <div className="text-muted flex min-w-0 items-center gap-1 text-xs" title={t("no_location")}>
            <Icon name="map-pin" className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{t("no_location")}</span>
          </div>
        )}
      </div>

      {status === "unconfirmed" && (
        <div className="flex gap-2">
          <Button
            color="secondary"
            size="sm"
            className="flex-1 justify-center"
            loading={pendingAction === "reject"}
            disabled={!!pendingAction}
            onClick={(event) => {
              event.stopPropagation();
              void runAction("reject");
            }}>
            {t("reject")}
          </Button>
          <Button
            color="primary"
            size="sm"
            className="flex-1 justify-center"
            loading={pendingAction === "confirm"}
            disabled={!!pendingAction}
            onClick={(event) => {
              event.stopPropagation();
              void runAction("confirm");
            }}>
            {t("confirm")}
          </Button>
        </div>
      )}
    </div>
  );
}

type KanbanColumnViewProps = {
  column: KanbanColumn;
  selectedUid: string | null;
  onSelect: (uid: string) => void;
  onConfirm?: (uid: string) => Promise<void> | void;
  onReject?: (uid: string) => Promise<void> | void;
};

function KanbanColumnView({ column, selectedUid, onSelect, onConfirm, onReject }: KanbanColumnViewProps) {
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
            <KanbanCard
              key={booking.uid}
              booking={booking}
              status={column.status}
              isSelected={selectedUid === booking.uid}
              onSelect={onSelect}
              onConfirm={onConfirm}
              onReject={onReject}
            />
          ))
        )}
      </div>
    </section>
  );
}

export function BookingKanbanBoard({ columns, onViewChange, onConfirm, onReject }: BookingKanbanBoardProps) {
  const { t } = useLocale();
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const handleSelect = (uid: string) => setSelectedUid((current) => (current === uid ? null : uid));
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
            <KanbanColumnView
              key={column.status}
              column={column}
              selectedUid={selectedUid}
              onSelect={handleSelect}
              onConfirm={onConfirm}
              onReject={onReject}
            />
          ))}
        </div>
      </div>
    </>
  );
}
