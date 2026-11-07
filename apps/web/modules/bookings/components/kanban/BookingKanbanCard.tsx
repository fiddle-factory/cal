"use client";

import { Provider as TooltipPrimitiveProvider } from "@radix-ui/react-tooltip";
import type React from "react";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import classNames from "@calcom/ui/classNames";
import { Avatar } from "@calcom/ui/components/avatar/Avatar";
import { Badge } from "@calcom/ui/components/badge/Badge";
import { Button } from "@calcom/ui/components/button/Button";
import { Icon } from "@calcom/ui/components/icon/Icon";
import type { IconName } from "@calcom/ui/components/icon/Icon";
import { Tooltip } from "@calcom/ui/components/tooltip/Tooltip";

import type {
  KanbanBooking,
  KanbanCardPreviewState,
  KanbanLocationType,
  KanbanPendingAction,
} from "./types";

const MAX_VISIBLE_ATTENDEES = 3;

const LOCATION_ICONS: Record<KanbanLocationType, IconName> = {
  video: "video",
  phone: "phone",
  in_person: "map-pin",
};

export type BookingKanbanCardProps = {
  booking: KanbanBooking;
  /** Reference time used to detect bookings happening now */
  now?: Date;
  selected?: boolean;
  isDragging?: boolean;
  pendingAction?: KanbanPendingAction | null;
  onSelect?: (bookingId: number) => void;
  onConfirm?: (bookingId: number) => void;
  onReject?: (bookingId: number) => void;
  draggable?: boolean;
  onDragStart?: (event: React.DragEvent<HTMLDivElement>, bookingId: number) => void;
  onDragEnd?: (event: React.DragEvent<HTMLDivElement>) => void;
  /** Preview-only: forces the hover, focus or pressed look */
  previewState?: KanbanCardPreviewState;
  /** Preview-only: keeps the "+N" attendees tooltip open */
  previewAttendeesTooltipOpen?: boolean;
  className?: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  );
}

export function BookingKanbanCard({
  booking,
  now = new Date(),
  selected = false,
  isDragging = false,
  pendingAction = null,
  onSelect,
  onConfirm,
  onReject,
  draggable = false,
  onDragStart,
  onDragEnd,
  previewState,
  previewAttendeesTooltipOpen,
  className,
}: BookingKanbanCardProps) {
  const { t, i18n } = useLocale();
  const locale = i18n.language;

  const isCancelled = booking.status === "cancelled";
  const isPast = booking.status === "past";
  const isUnconfirmed = booking.status === "unconfirmed";
  const isHappeningNow =
    !isCancelled && !isPast && booking.start.getTime() <= now.getTime() && now.getTime() < booking.end.getTime();
  const isPending = pendingAction !== null;

  const dateLabel = isSameDay(booking.start, now)
    ? t("today")
    : new Intl.DateTimeFormat(locale, { weekday: "short", month: "short", day: "numeric" }).format(
        booking.start
      );
  const timeFormatter = new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" });
  const timeRange = `${timeFormatter.format(booking.start)} – ${timeFormatter.format(booking.end)}`;

  const visibleAttendees = booking.attendees.slice(0, MAX_VISIBLE_ATTENDEES);
  const hiddenAttendees = booking.attendees.slice(MAX_VISIBLE_ATTENDEES);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect?.(booking.id);
    }
  };

  const stopPropagation = (event: React.SyntheticEvent) => event.stopPropagation();

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={booking.title}
      aria-busy={isPending || undefined}
      data-testid="booking-kanban-card"
      data-state={isDragging ? "dragging" : selected ? "selected" : undefined}
      draggable={draggable && !isPending}
      onClick={() => onSelect?.(booking.id)}
      onKeyDown={handleKeyDown}
      onDragStart={(event) => onDragStart?.(event, booking.id)}
      onDragEnd={onDragEnd}
      className={classNames(
        "group/card bg-default relative flex w-full cursor-pointer select-none flex-col gap-2 overflow-hidden rounded-xl border py-3 pl-4 pr-3 text-left transition duration-150 ease-out",
        "focus-visible:ring-brand-default focus-visible:ring-offset-default outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        !isDragging && "active:bg-subtle hover:shadow-sm active:scale-[0.99]",
        !isDragging && !selected && "hover:border-default",
        selected ? "border-brand-default ring-brand-default bg-subtle ring-1" : "border-subtle",
        previewState === "hover" && "border-default shadow-sm",
        previewState === "focus" && "ring-brand-default ring-offset-default ring-2 ring-offset-2",
        previewState === "pressed" && "bg-subtle scale-[0.99]",
        isDragging && "border-default z-10 rotate-2 scale-[1.02] cursor-grabbing shadow-xl",
        className
      )}>
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: booking.eventColor, opacity: isCancelled || isPast ? 0.5 : 1 }}
      />

      <p
        className={classNames(
          "line-clamp-2 text-sm font-semibold leading-5",
          isCancelled ? "text-subtle line-through" : isPast ? "text-default" : "text-emphasis"
        )}>
        {booking.title}
      </p>

      <BookingKanbanCardBadges booking={booking} isHappeningNow={isHappeningNow} />

      <div className="text-subtle flex flex-col gap-1 text-xs">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="calendar" className="h-3.5 w-3.5 shrink-0" />
            <span className={classNames(isCancelled && "line-through")}>{dateLabel}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="clock" className="h-3.5 w-3.5 shrink-0" />
            <span className={classNames(isCancelled && "line-through")}>{timeRange}</span>
          </span>
        </div>
        {booking.location ? (
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <Icon name={LOCATION_ICONS[booking.location.type]} className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{booking.location.label}</span>
          </span>
        ) : (
          <span className="text-muted inline-flex items-center gap-1.5 italic">
            <Icon name="map-pin" className="h-3.5 w-3.5 shrink-0" />
            {t("no_location")}
          </span>
        )}
      </div>

      {booking.attendees.length > 0 && (
        <div className="flex items-center" aria-label={t("attendees")}>
          {visibleAttendees.map((attendee, index) => (
            <Avatar
              key={`${attendee.name}-${index}`}
              size="sm"
              alt={attendee.name}
              className={classNames("ring-default ring-2", index > 0 && "-ml-1.5")}
              fallback={
                <span className="text-emphasis text-[10px] font-medium leading-none">
                  {getInitials(attendee.name)}
                </span>
              }
            />
          ))}
          {hiddenAttendees.length > 0 && (
            <TooltipPrimitiveProvider>
              <Tooltip
                open={previewAttendeesTooltipOpen}
                content={
                  <ul className="flex flex-col gap-0.5">
                    {hiddenAttendees.map((attendee, index) => (
                      <li key={`${attendee.name}-${index}`}>{attendee.name}</li>
                    ))}
                  </ul>
                }>
                <span
                  tabIndex={0}
                  onClick={stopPropagation}
                  onKeyDown={stopPropagation}
                  aria-label={hiddenAttendees.map((attendee) => attendee.name).join(", ")}
                  className="bg-emphasis border-default text-emphasis ring-default focus-visible:ring-brand-default relative -ml-1.5 inline-flex h-6 min-w-6 items-center justify-center rounded-full border px-1 text-[10px] font-medium leading-none outline-none ring-2">
                  +{hiddenAttendees.length}
                </span>
              </Tooltip>
            </TooltipPrimitiveProvider>
          )}
        </div>
      )}

      {isUnconfirmed && (
        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            color="secondary"
            StartIcon={pendingAction === "reject" ? undefined : "x"}
            loading={pendingAction === "reject"}
            disabled={isPending}
            onClick={(event) => {
              event.stopPropagation();
              onReject?.(booking.id);
            }}
            onKeyDown={stopPropagation}>
            {t("reject")}
          </Button>
          <Button
            size="sm"
            color="primary"
            StartIcon={pendingAction === "confirm" ? undefined : "check"}
            loading={pendingAction === "confirm"}
            disabled={isPending}
            onClick={(event) => {
              event.stopPropagation();
              onConfirm?.(booking.id);
            }}
            onKeyDown={stopPropagation}>
            {t("confirm")}
          </Button>
        </div>
      )}
    </div>
  );
}

function BookingKanbanCardBadges({
  booking,
  isHappeningNow,
}: {
  booking: KanbanBooking;
  isHappeningNow: boolean;
}) {
  const { t } = useLocale();
  const badges: React.ReactNode[] = [];

  if (isHappeningNow) {
    badges.push(
      <Badge key="now" variant="green" withDot>
        {t("kanban_happening_now")}
      </Badge>
    );
  }
  if (booking.status === "unconfirmed") {
    badges.push(
      <Badge key="unconfirmed" variant="orange">
        {t("unconfirmed")}
      </Badge>
    );
  }
  if (booking.recurrence) {
    badges.push(
      <Badge key="recurring" variant="purple" startIcon="repeat">
        {t(`kanban_repeats_${booking.recurrence.frequency}`, { count: booking.recurrence.occurrences })}
      </Badge>
    );
  }
  if (booking.status === "cancelled") {
    badges.push(
      <Badge key="cancelled" variant="red">
        {t("cancelled")}
      </Badge>
    );
  }
  if (booking.rescheduled) {
    badges.push(
      <Badge key="rescheduled" variant="blue" startIcon="refresh-cw">
        {t("rescheduled")}
      </Badge>
    );
  }
  if (booking.noShow) {
    badges.push(
      <Badge key="no-show" variant="gray" startIcon="user-x">
        {t("kanban_no_show")}
      </Badge>
    );
  }
  if (booking.payment === "paid") {
    badges.push(
      <Badge key="paid" variant="green" startIcon="credit-card">
        {t("paid")}
      </Badge>
    );
  }
  if (booking.payment === "pending") {
    badges.push(
      <Badge key="payment-pending" variant="orange" startIcon="credit-card">
        {t("pending_payment")}
      </Badge>
    );
  }

  if (badges.length === 0) return null;
  return <div className="flex flex-wrap items-center gap-1">{badges}</div>;
}

export default BookingKanbanCard;
