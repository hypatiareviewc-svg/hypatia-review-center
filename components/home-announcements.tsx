import Link from "next/link";
import { ArrowRight, Megaphone, Pin } from "lucide-react";
import { announcements } from "@/lib/site-content";

export function HomeAnnouncements() {
  const [featured, ...rest] = announcements;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
      <article className="surface-card relative overflow-hidden rounded-[2rem] p-7 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--secondary)]/10 blur-2xl" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            {featured.pinned ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--secondary)_16%,var(--surface))] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[var(--secondary)]">
                <Pin className="h-3 w-3" />
                Pinned
              </span>
            ) : null}
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              {featured.category}
            </span>
          </div>
          <p className="mt-4 text-sm text-[var(--muted)]">{featured.date}</p>
          <h3 className="mt-2 font-display text-3xl font-semibold leading-tight">{featured.title}</h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">{featured.summary}</p>
          <Link
            href="/news"
            className="focus-ring mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] transition hover:gap-3"
          >
            View all announcements
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </article>

      <div className="grid gap-3">
        {rest.map((item) => (
          <article key={item.title} className="surface-card rounded-[1.75rem] p-5 transition hover:border-[color-mix(in_srgb,var(--secondary)_35%,var(--border))]">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--secondary)]">
                <Megaphone className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--secondary)]">
                    {item.category}
                  </span>
                  <span className="text-xs text-[var(--muted)]">{item.date}</span>
                </div>
                <h3 className="mt-1 font-display text-xl font-semibold leading-snug">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.summary}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
