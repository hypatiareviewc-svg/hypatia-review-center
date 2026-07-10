"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Loader2, MapPin, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EVENT_TYPES, EVENT_TYPE_META, type CalendarEvent } from "@/lib/calendar-types";

const schema = z.object({
  title: z.string().min(1, "Title is required.").max(120),
  description: z.string().max(1000).optional(),
  type: z.enum(["LECTURE", "MOCK_BOARD", "SEMINAR", "ORIENTATION", "HOLIDAY", "DEADLINE", "OTHER"]),
  startDate: z.string().min(1, "Start date is required."),
  startTime: z.string().optional(),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  allDay: z.boolean(),
  location: z.string().max(200).optional(),
});

type FormValues = z.infer<typeof schema>;

function toDateInput(iso: string) {
  return iso.slice(0, 10);
}
function toTimeInput(iso: string) {
  return iso.slice(11, 16);
}
function buildISO(date: string, time: string | undefined, allDay: boolean) {
  if (!date) return null;
  if (allDay || !time) {
    // Produce a UTC midnight ISO string
    return new Date(`${date}T00:00:00`).toISOString();
  }
  return new Date(`${date}T${time}:00`).toISOString();
}

export function CalendarEventModal({
  open,
  onClose,
  event,
  defaultDate,
  onSaved,
  onDeleted,
}: {
  open: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  defaultDate?: string; // YYYY-MM-DD
  onSaved: (e: CalendarEvent) => void;
  onDeleted?: (id: string) => void;
}) {
  const isEdit = !!event;
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "LECTURE", allDay: true },
  });

  const allDay = watch("allDay");
  const selectedType = watch("type");

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (event) {
      reset({
        title: event.title,
        description: event.description ?? "",
        type: event.type,
        startDate: toDateInput(event.startDate),
        startTime: event.allDay ? "08:00" : toTimeInput(event.startDate),
        endDate: event.endDate ? toDateInput(event.endDate) : "",
        endTime: event.endDate && !event.allDay ? toTimeInput(event.endDate) : "",
        allDay: event.allDay,
        location: event.location ?? "",
      });
    } else {
      reset({
        title: "",
        description: "",
        type: "LECTURE",
        startDate: defaultDate ?? new Date().toISOString().slice(0, 10),
        startTime: "08:00",
        endDate: "",
        endTime: "",
        allDay: true,
        location: "",
      });
    }
    setError(null);
  }, [open, event, defaultDate, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        title: values.title,
        description: values.description || null,
        type: values.type,
        startDate: buildISO(values.startDate, values.startTime, values.allDay),
        endDate: values.endDate
          ? buildISO(values.endDate, values.endTime, values.allDay)
          : null,
        allDay: values.allDay,
        location: values.location || null,
      };

      const url = isEdit ? `/api/admin/calendar/${event!.id}` : "/api/admin/calendar";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "Failed to save event.");
      }

      const saved: CalendarEvent = await res.json();
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  });

  async function handleDelete() {
    if (!event) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/calendar/${event.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete event.");
      onDeleted?.(event.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete.");
    } finally {
      setDeleting(false);
    }
  }

  const typeMeta = EVENT_TYPE_META[selectedType as keyof typeof EVENT_TYPE_META];

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !submitting && !deleting && onClose()}
            aria-hidden="true"
          />
          <motion.div
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: "spring", damping: 30, stiffness: 340 }}
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${typeMeta?.bg ?? "bg-slate-50"}`}>
                  <CalendarDays className={`h-4 w-4 ${typeMeta?.color ?? "text-slate-600"}`} />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold text-[var(--foreground)]">
                    {isEdit ? "Edit Event" : "New Event"}
                  </h3>
                  <p className="text-[0.65rem] text-[var(--muted)]">
                    {isEdit ? "Update event details" : "Add to academic calendar"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting || deleting}
                className="focus-ring flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)]"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-3 px-4 py-4">
              {/* Title */}
              <div className="grid gap-1">
                <label className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Mock Board Exam – Nursing"
                  className="focus-ring w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm placeholder:text-[var(--muted)]/40"
                  {...register("title")}
                />
                {errors.title && <span className="text-[0.65rem] text-red-400">{errors.title.message}</span>}
              </div>

              {/* Type pills */}
              <div className="grid gap-1">
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Type</span>
                <div className="flex flex-wrap gap-1.5">
                  {EVENT_TYPES.map((t) => {
                    const m = EVENT_TYPE_META[t.value];
                    const active = selectedType === t.value;
                    return (
                      <label
                        key={t.value}
                        className={[
                          "cursor-pointer select-none rounded-full border px-2.5 py-1 text-[0.65rem] font-semibold transition",
                          active
                            ? `${m.bg} ${m.color} ${m.border}`
                            : "border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:border-[var(--primary)]/30",
                        ].join(" ")}
                      >
                        <input type="radio" value={t.value} className="sr-only" {...register("type")} />
                        {t.label}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* All day toggle */}
              <label className="flex cursor-pointer items-center gap-2.5">
                <div
                  className={[
                    "relative h-5 w-9 rounded-full transition-colors",
                    allDay ? "bg-[var(--primary)]" : "bg-[var(--border)]",
                  ].join(" ")}
                  onClick={() => setValue("allDay", !allDay)}
                >
                  <div
                    className={[
                      "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                      allDay ? "translate-x-4" : "translate-x-0.5",
                    ].join(" ")}
                  />
                </div>
                <input type="checkbox" className="sr-only" {...register("allDay")} />
                <span className="text-xs font-medium text-[var(--foreground)]">All day</span>
              </label>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="grid gap-1">
                  <label className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Start Date</label>
                  <input
                    type="date"
                    className="focus-ring w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-2 text-xs"
                    {...register("startDate")}
                  />
                  {errors.startDate && <span className="text-[0.65rem] text-red-400">{errors.startDate.message}</span>}
                </div>
                <div className="grid gap-1">
                  <label className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">End Date</label>
                  <input
                    type="date"
                    className="focus-ring w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-2 text-xs"
                    {...register("endDate")}
                  />
                </div>
              </div>

              {/* Times — only when not all day */}
              {!allDay && (
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="grid gap-1">
                    <label className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Start Time</label>
                    <input
                      type="time"
                      className="focus-ring w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-2 text-xs"
                      {...register("startTime")}
                    />
                  </div>
                  <div className="grid gap-1">
                    <label className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">End Time</label>
                    <input
                      type="time"
                      className="focus-ring w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-2 text-xs"
                      {...register("endTime")}
                    />
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="grid gap-1">
                <label className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                  Location <span className="normal-case font-normal opacity-60">(optional)</span>
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    type="text"
                    placeholder="Room, building, or online link…"
                    className="focus-ring w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2 pl-7 pr-3 text-xs placeholder:text-[var(--muted)]/40"
                    {...register("location")}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="grid gap-1">
                <label className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                  Description <span className="normal-case font-normal opacity-60">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional details…"
                  className="focus-ring w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs placeholder:text-[var(--muted)]/40"
                  {...register("description")}
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[0.72rem] text-red-700">{error}</div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 border-t border-[var(--border)] pt-3">
                {isEdit && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting || submitting}
                    className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-60"
                  >
                    {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                    {deleting ? "Deleting…" : "Delete"}
                  </button>
                )}
                <div className="ml-auto flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting || deleting}
                    className="focus-ring h-8 rounded-full border border-[var(--border)] bg-[var(--background)] px-4 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface-soft)] disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || deleting}
                    className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-full bg-[var(--primary)] px-4 text-xs font-semibold text-[var(--primary-contrast)] hover:opacity-90 disabled:opacity-70"
                  >
                    {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {submitting ? "Saving…" : isEdit ? "Save Changes" : "Create Event"}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
