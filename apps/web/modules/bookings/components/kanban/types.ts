export type KanbanColumnStatus = "upcoming" | "unconfirmed" | "recurring" | "past" | "cancelled";

export type KanbanLocationType = "video" | "phone" | "in_person";

export type KanbanAttendee = {
  name: string;
  email?: string;
};

export type KanbanRecurrence = {
  frequency: "daily" | "weekly" | "monthly";
  occurrences: number;
};

export type KanbanBooking = {
  id: number;
  title: string;
  start: Date;
  end: Date;
  /** Event type color, used for the card stripe */
  eventColor: string;
  status: KanbanColumnStatus;
  attendees: KanbanAttendee[];
  location?: { type: KanbanLocationType; label: string } | null;
  recurrence?: KanbanRecurrence | null;
  rescheduled?: boolean;
  noShow?: boolean;
  payment?: "paid" | "pending" | null;
};

export type KanbanPendingAction = "confirm" | "reject";

/** Preview-only: forces the look of a transient interaction state. */
export type KanbanCardPreviewState = "hover" | "focus" | "pressed";
