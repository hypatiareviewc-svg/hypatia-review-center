"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  Pencil,
} from "lucide-react";
import { CalendarEventModal } from "@/components/admin/calendar-event-modal";
import { EVENT_TYPE_META, type CalendarEvent } from "@/lib/calendar-types";

/* ─── helpers ─────────────────────────────────────────────────────────────── */

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function eventFallsOnDay(event: CalendarEvent, dayStr: string): boolean {
  const start = isoDate(new Date(event.startDate));
  const end = event.endDate ? isoDate(new Date(event.endDate)) : start;
  return dayStr >= start && dayStr <= end;
}

function formatEventTime(event: CalendarEvent) {
  if (event.allDay) return "All day";
  return new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(event.startDate));
}

function formatFullDate(iso: string) {
  return new Intl.DateTimeFormat("en-PH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

/* ─── main component ──────────────────────────────────────────────────────── */

export function CalendarClient() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(isoDate(today));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<string | undefined>();

  /* fetch events for current month */
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/calendar?year=${year}&month=${month}`);
      if (!res.ok) throw new Error("Failed to load events.");
      const data: CalendarEvent[] = await res.json();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  /* calendar grid */
  const { calDays, firstWeekday } = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = firstDay.getDay();
    const calDays: { date: Date; dayStr: string; isCurrentMonth: boolean }[] = [];

    // leading empty cells
    for (let i = 0; i < firstWeekday; i++) {
      const d = new Date(year, month, 1 - (firstWeekday - i));
      calDays.push({ date: d, dayStr: isoDate(d), isCurrentMonth: false });
    }
    // current month
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      calDays.push({ date, dayStr: isoDate(date), isCurrentMonth: true });
    }
    // trailing
    const remaining = 42 - calDays.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      calDays.push({ date: d, dayStr: isoDate(d), isCurrentMonth: false });
    }

    return { calDays, firstWeekday };
  }, [year, month]);

  /* events on selected day */
  const dayEvents = useMemo(() => {
    if (!selectedDay) return [];
    return events.filter((e) => eventFallsOnDay(e, selectedDay));
  }, [events, selectedDay]);

  /* upcoming events (next 30 days from today if no day selected) */
  const upcomingEvents = useMemo(() => {
    const todayStr = isoDate(today);
    return events
      .filter((e) => isoDate(new Date(e.startDate)) >= todayStr)
      .slice(0, 5);
  }, [events]);

  /* navigation */
  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }
  function goToToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDay(isoDate(today));
  }

  /* modal helpers */
  function openCreate(dayStr?: string) {
    setEditingEvent(null);
    setModalDefaultDate(dayStr);
    setModalOpen(true);
  }
  function openEdit(event: CalendarEvent) {
    setEditingEvent(event);
    setModalDefaultDate(undefined);
    setModalOpen(true);
  }
  function handleSaved(saved: CalendarEvent) {
    setEvents(prev => {
      const idx = prev.findIndex(e => e.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved].sort((a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
    });
  }
  function handleDeleted(id: string) {
    setEvents(prev => prev.filter(e => e.id !== id));
  }

  const todayStr = isoDate(today);

  return (
    <div className="space-y-4">
      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(EVENT_TYPE_META).map(([type, meta]) => {
          const count = events.filter(e => e.type === type).length;
          if (count === 0) return null;
          return (
            <div
              key={type}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${meta.bg} ${meta.color} ${meta.border}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
              {meta.label}
              <span className="font-bold">{count}</span>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        {/* ── Calendar grid ────────────────────────────────────────────── */}
        <div className="surface-card rounded-2xl overflow-hidden">
          {/* Month navigation */}
          <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevMonth}
                className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)] transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)] transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <h2 className="font-serif text-base font-bold text-[var(--foreground)] ml-1">
                {MONTHS[month]} {year}
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={goToToday}
                className="focus-ring h-8 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => openCreate(selectedDay ?? undefined)}
                className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-lg bg-[var(--primary)] px-3 text-xs font-semibold text-[var(--primary-contrast)]"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Event
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-[var(--border)]">
            {DAYS.map(d => (
              <div key={d} className="py-2 text-center text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          {loading ? (
            <div className="flex items-center justify-center py-20 text-sm text-[var(--muted)]">
              Loading calendar…
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <AlertTriangle className="h-6 w-6 text-red-400" />
              <p className="text-sm text-[var(--muted)]">{error}</p>
              <button onClick={fetchEvents} className="text-xs text-[var(--primary)] underline">Retry</button>
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {calDays.map(({ date, dayStr, isCurrentMonth }, i) => {
                const dayEvts = events.filter(e => eventFallsOnDay(e, dayStr));
                const isToday = dayStr === todayStr;
                const isSelected = dayStr === selectedDay;
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                return (
                  <div
                    key={dayStr + i}
                    className={[
                      "relative min-h-[72px] cursor-pointer border-b border-r border-[var(--border)] p-1.5 transition-colors",
                      isCurrentMonth ? "" : "opacity-30",
                      isSelected ? "bg-[var(--primary)]/5" : isWeekend ? "bg-[var(--surface-soft)]/60" : "",
                      "hover:bg-[var(--surface-soft)]",
                    ].join(" ")}
                    onClick={() => setSelectedDay(dayStr)}
                    onDoubleClick={() => openCreate(dayStr)}
                  >
                    {/* Date number */}
                    <div className="flex justify-end">
                      <span
                        className={[
                          "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                          isToday
                            ? "bg-[var(--primary)] text-[var(--primary-contrast)]"
                            : isSelected
                              ? "text-[var(--primary)] font-bold"
                              : "text-[var(--foreground)]",
                        ].join(" ")}
                      >
                        {date.getDate()}
                      </span>
                    </div>

                    {/* Event dots / pills */}
                    <div className="mt-1 space-y-0.5">
                      {dayEvts.slice(0, 3).map(evt => {
                        const m = EVENT_TYPE_META[evt.type as keyof typeof EVENT_TYPE_META];
                        return (
                          <div
                            key={evt.id}
                            className={`truncate rounded px-1 py-0.5 text-[0.6rem] font-semibold leading-tight ${m.bg} ${m.color}`}
                            title={evt.title}
                          >
                            {evt.title}
                          </div>
                        );
                      })}
                      {dayEvts.length > 3 && (
                        <div className="px-1 text-[0.58rem] text-[var(--muted)]">
                          +{dayEvts.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Right sidebar ─────────────────────────────────────────────── */}
        <div className="space-y-3">
          {/* Selected day panel */}
          <div className="surface-card rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                  {selectedDay ? "Selected Day" : "Select a day"}
                </p>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {selectedDay ? formatFullDate(selectedDay + "T00:00:00") : "—"}
                </p>
              </div>
              {selectedDay && (
                <button
                  type="button"
                  onClick={() => openCreate(selectedDay)}
                  className="focus-ring flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-contrast)]"
                  title="Add event on this day"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="px-3 py-3">
              <AnimatePresence mode="wait">
                {dayEvents.length === 0 ? (
                  <motion.p
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-4 text-center text-xs text-[var(--muted)]"
                  >
                    No events — double-click a day to add one.
                  </motion.p>
                ) : (
                  <motion.div
                    key={selectedDay}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    {dayEvents.map(evt => (
                      <EventCard key={evt.id} event={evt} onEdit={() => openEdit(evt)} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Upcoming events */}
          {!loading && upcomingEvents.length > 0 && (
            <div className="surface-card rounded-2xl overflow-hidden">
              <div className="border-b border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2.5">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                  Upcoming This Month
                </p>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {upcomingEvents.map(evt => {
                  const m = EVENT_TYPE_META[evt.type as keyof typeof EVENT_TYPE_META];
                  return (
                    <button
                      key={evt.id}
                      type="button"
                      onClick={() => {
                        setSelectedDay(isoDate(new Date(evt.startDate)));
                        openEdit(evt);
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left hover:bg-[var(--surface-soft)] transition"
                    >
                      <span className={`h-2 w-2 shrink-0 rounded-full ${m.dot}`} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-[var(--foreground)]">{evt.title}</p>
                        <p className="text-[0.65rem] text-[var(--muted)]">
                          {new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric" }).format(new Date(evt.startDate))}
                        </p>
                      </div>
                      <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[0.55rem] font-semibold ${m.bg} ${m.color} ${m.border}`}>
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <CalendarEventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        event={editingEvent}
        defaultDate={modalDefaultDate}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    </div>
  );
}

/* ─── EventCard ────────────────────────────────────────────────────────────── */

function EventCard({ event, onEdit }: { event: CalendarEvent; onEdit: () => void }) {
  const m = EVENT_TYPE_META[event.type as keyof typeof EVENT_TYPE_META];
  return (
    <div className={`rounded-xl border p-3 ${m.bg} ${m.border}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${m.dot}`} />
            <p className="truncate text-xs font-semibold text-[var(--foreground)]">{event.title}</p>
          </div>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
            <span className={`flex items-center gap-1 text-[0.63rem] ${m.color}`}>
              <Clock className="h-2.5 w-2.5" />
              {formatEventTime(event)}
            </span>
            {event.location && (
              <span className="flex items-center gap-1 text-[0.63rem] text-[var(--muted)]">
                <MapPin className="h-2.5 w-2.5" />
                {event.location}
              </span>
            )}
          </div>
          {event.description && (
            <p className="mt-1 line-clamp-2 text-[0.63rem] text-[var(--muted)]">{event.description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="focus-ring shrink-0 flex h-6 w-6 items-center justify-center rounded-md border border-[var(--border)] bg-white/60 text-[var(--muted)] hover:text-[var(--foreground)] transition"
          aria-label="Edit event"
        >
          <Pencil className="h-3 w-3" />
        </button>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className={`rounded-full border px-2 py-0.5 text-[0.58rem] font-semibold ${m.bg} ${m.color} ${m.border}`}>
          {m.label}
        </span>
        {event.createdBy && (
          <span className="text-[0.58rem] text-[var(--muted)]">by {event.createdBy}</span>
        )}
      </div>
    </div>
  );
}
