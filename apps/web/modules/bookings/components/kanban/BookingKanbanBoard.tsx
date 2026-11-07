"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import classNames from "@calcom/ui/classNames";
import { Badge } from "@calcom/ui/components/badge/Badge";
import { Button } from "@calcom/ui/components/button/Button";
import { Switch } from "@calcom/ui/components/form/switch/Switch";

import { BookingKanbanCard } from "./BookingKanbanCard";
import type { KanbanBooking, KanbanColumnStatus, KanbanPendingAction } from "./types";

export const KANBAN_COLUMNS: { status: KanbanColumnStatus; labelKey: string; dotClassName: string }[] = [
  { status: "upcoming", labelKey: "upcoming", dotClassName: "bg-visualization-3-emphasis" },
  { status: "unconfirmed", labelKey: "unconfirmed", dotClassName: "bg-visualization-6-emphasis" },
  { status: "recurring", labelKey: "recurring", dotClassName: "bg-visualization-2-emphasis" },
  { status: "past", labelKey: "past", dotClassName: "bg-gray-400" },
  { status: "cancelled", labelKey: "cancelled", dotClassName: "bg-visualization-7-emphasis" },
];

const PENDING_ACTION_DURATION_MS = 1200;

export type BookingKanbanBoardProps = {
  bookings: KanbanBooking[];
  /** Reference time used to detect bookings happening now */
  now?: Date;
  className?: string;
};

export function BookingKanbanBoard({ bookings: initialBookings, now, className }: BookingKanbanBoardProps) {
  const { t } = useLocale();
  const [bookings, setBookings] = useState(initialBookings);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<KanbanColumnStatus | null>(null);
  const [pending, setPending] = useState<{ id: number; action: KanbanPendingAction } | null>(null);
  const [showCancelled, setShowCancelled] = useState(true);
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => setBookings(initialBookings), [initialBookings]);
  useEffect(() => () => clearTimeout(pendingTimer.current), []);

  const moveBooking = (id: number, status: KanbanColumnStatus) =>
    setBookings((current) => current.map((booking) => (booking.id === id ? { ...booking, status } : booking)));

  const runPendingAction = (id: number, action: KanbanPendingAction) => {
    setPending({ id, action });
    clearTimeout(pendingTimer.current);
    pendingTimer.current = setTimeout(() => {
      moveBooking(id, action === "confirm" ? "upcoming" : "cancelled");
      setPending(null);
    }, PENDING_ACTION_DURATION_MS);
  };

  const handleDrop = (event: React.DragEvent<HTMLElement>, status: KanbanColumnStatus) => {
    event.preventDefault();
    const id = Number(event.dataTransfer.getData("text/plain"));
    if (Number.isFinite(id) && id > 0) moveBooking(id, status);
    setDraggingId(null);
    setDropTarget(null);
  };

  const columns = KANBAN_COLUMNS.filter((column) => showCancelled || column.status !== "cancelled");

  return (
    <div className={classNames("flex flex-col gap-4", className)}>
      <div className="flex items-center justify-end">
        <Switch
          size="sm"
          checked={showCancelled}
          onCheckedChange={setShowCancelled}
          label={t("kanban_show_cancelled")}
        />
      </div>
      <div className="flex gap-3 overflow-x-auto pb-4" role="list" aria-label={t("kanban_board_label")}>
        {columns.map((column) => {
          const columnBookings = bookings
            .filter((booking) => booking.status === column.status)
            .sort((a, b) => a.start.getTime() - b.start.getTime());
          const label = t(column.labelKey);
          return (
            <section
              key={column.status}
              role="listitem"
              aria-label={label}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                if (dropTarget !== column.status) setDropTarget(column.status);
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDropTarget(null);
              }}
              onDrop={(event) => handleDrop(event, column.status)}
              className={classNames(
                "bg-cal-muted border-subtle flex w-72 shrink-0 flex-col rounded-2xl border transition-colors",
                dropTarget === column.status && draggingId !== null && "border-brand-default bg-subtle"
              )}>
              <header className="flex items-center gap-2 py-2 pl-3 pr-1.5">
                <span aria-hidden className={classNames("h-2 w-2 shrink-0 rounded-full", column.dotClassName)} />
                <h3 className="text-emphasis text-sm font-semibold">{label}</h3>
                <Badge variant="gray" size="sm" className="min-w-5 rounded-full">
                  {columnBookings.length}
                </Badge>
                <Button
                  variant="icon"
                  color="minimal"
                  size="sm"
                  StartIcon="ellipsis"
                  className="ml-auto"
                  aria-label={t("kanban_column_options", { column: label })}
                  tooltip={t("kanban_column_options", { column: label })}
                />
              </header>
              <div className="flex min-h-24 flex-col gap-2 px-2 pb-2">
                {columnBookings.length === 0 ? (
                  <p className="text-subtle border-subtle rounded-xl border border-dashed px-3 py-6 text-center text-xs">
                    {t("kanban_column_empty")}
                  </p>
                ) : (
                  columnBookings.map((booking) => (
                    <BookingKanbanCard
                      key={booking.id}
                      booking={booking}
                      now={now}
                      selected={selectedId === booking.id}
                      isDragging={draggingId === booking.id}
                      pendingAction={pending?.id === booking.id ? pending.action : null}
                      onSelect={(id) => setSelectedId((current) => (current === id ? null : id))}
                      onConfirm={(id) => runPendingAction(id, "confirm")}
                      onReject={(id) => runPendingAction(id, "reject")}
                      draggable
                      onDragStart={(event, id) => {
                        event.dataTransfer.setData("text/plain", String(id));
                        event.dataTransfer.effectAllowed = "move";
                        setDraggingId(id);
                      }}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setDropTarget(null);
                      }}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default BookingKanbanBoard;
