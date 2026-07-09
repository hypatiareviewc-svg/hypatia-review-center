import { CalendarDays, Clock3, MapPin } from "lucide-react";
import { calendarActivities } from "@/lib/site-content";

function formatActivityDate(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00`);

  return {
    weekday: new Intl.DateTimeFormat("en-PH", { weekday: "short" }).format(date),
    month: new Intl.DateTimeFormat("en-PH", { month: "short" }).format(date),
    day: new Intl.DateTimeFormat("en-PH", { day: "numeric" }).format(date),
    full: new Intl.DateTimeFormat("en-PH", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date),
  };
}

export function HomeActivityCalendar() {
  const nextActivity = calendarActivities[0];
  const nextDate = formatActivityDate(nextActivity.date);

  return (
    <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
      <aside className="surface-card rounded-[2rem] p-6 sm:p-7">
        <div className="flex items-center gap-2 text-[var(--secondary)]">
          <CalendarDays className="h-5 w-5" />
          <p className="text-xs font-semibold uppercase tracking-[0.28em]">Up Next</p>
        </div>
        <div className="mt-5 flex items-end gap-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">{nextDate.month}</p>
            <p className="font-display text-4xl font-semibold leading-none text-[var(--primary)]">{nextDate.day}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{nextDate.weekday}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--muted)]">{nextDate.full}</p>
            <h3 className="mt-1 font-display text-2xl font-semibold">{nextActivity.title}</h3>
          </div>
        </div>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex items-center gap-3 text-[var(--muted)]">
            <Clock3 className="h-4 w-4 shrink-0 text-[var(--secondary)]" />
            <dd>{nextActivity.time}</dd>
          </div>
          <div className="flex items-center gap-3 text-[var(--muted)]">
            <MapPin className="h-4 w-4 shrink-0 text-[var(--secondary)]" />
            <dd>{nextActivity.venue}</dd>
          </div>
        </dl>
        <p className="mt-5 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-xs leading-6 text-[var(--muted)]">
          Dates and venues may change. Confirm final schedules with the admissions office.
        </p>
      </aside>

      <div className="surface-card rounded-[2rem] p-6 sm:p-7">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h3 className="font-display text-2xl font-semibold">August 2026 Schedule</h3>
          <span className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
            {calendarActivities.length} activities
          </span>
        </div>
        <ul className="grid gap-3">
          {calendarActivities.map((activity) => {
            const formatted = formatActivityDate(activity.date);

            return (
              <li
                key={`${activity.title}-${activity.date}`}
                className="grid gap-3 rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface-soft)] p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center"
              >
                <div className="flex w-fit items-center gap-3 sm:flex-col sm:gap-1 sm:px-1 sm:text-center">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    {formatted.month}
                  </span>
                  <span className="font-display text-2xl font-semibold leading-none text-[var(--primary)]">
                    {formatted.day}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--foreground)]">{activity.title}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {activity.time} · {activity.venue}
                  </p>
                </div>
                <span className="w-fit rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--secondary)]">
                  {activity.type}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
