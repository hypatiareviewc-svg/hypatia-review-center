export type CalendarEventType =
  | "LECTURE"
  | "MOCK_BOARD"
  | "SEMINAR"
  | "ORIENTATION"
  | "HOLIDAY"
  | "DEADLINE"
  | "OTHER";

export type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  type: CalendarEventType;
  startDate: string; // ISO
  endDate: string | null; // ISO
  allDay: boolean;
  location: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export const EVENT_TYPE_META: Record<
  CalendarEventType,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  LECTURE: {
    label: "Lecture",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  MOCK_BOARD: {
    label: "Mock Board",
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
    dot: "bg-purple-500",
  },
  SEMINAR: {
    label: "Seminar",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  ORIENTATION: {
    label: "Orientation",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  HOLIDAY: {
    label: "Holiday",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-500",
  },
  DEADLINE: {
    label: "Deadline",
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    dot: "bg-orange-500",
  },
  OTHER: {
    label: "Other",
    color: "text-slate-700",
    bg: "bg-slate-50",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
};

export const EVENT_TYPES = Object.entries(EVENT_TYPE_META).map(
  ([value, meta]) => ({ value: value as CalendarEventType, label: meta.label }),
);
