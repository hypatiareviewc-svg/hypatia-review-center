"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

type Program = {
  title: string;
  duration: string;
  schedule: string;
  description: string;
  features: readonly string[];
};

export function ProgramSearch({ programs }: { programs: readonly Program[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return programs;
    return programs.filter((program) => {
      return [program.title, program.duration, program.schedule, program.description, ...program.features]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [programs, query]);

  return (
    <div>
      <label className="relative block max-w-xl">
        <span className="sr-only">Search programs</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search programs, schedules, or features"
          className="focus-ring w-full rounded-full border border-[var(--border)] bg-[var(--surface)] py-3 pl-11 pr-4 text-sm"
        />
      </label>

      <p className="mt-4 text-sm text-[var(--muted)]">
        Showing {filtered.length} of {programs.length} program{programs.length === 1 ? "" : "s"}.
      </p>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {filtered.map((program) => (
          <article key={program.title} className="surface-card rounded-[2rem] p-6">
            <div className="space-y-4">
              <h3 className="font-display text-2xl font-semibold">{program.title}</h3>
              <p className="text-sm leading-7 text-[var(--muted)]">{program.description}</p>
              <dl className="grid gap-3 text-sm">
                <div className="flex justify-between gap-4 border-b border-[var(--border)] pb-2">
                  <dt className="text-[var(--muted)]">Duration</dt>
                  <dd className="font-medium">{program.duration}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-[var(--border)] pb-2">
                  <dt className="text-[var(--muted)]">Schedule</dt>
                  <dd className="font-medium">{program.schedule}</dd>
                </div>
              </dl>
              <div className="flex flex-wrap gap-2">
                {program.features.map((feature) => (
                  <span
                    key={feature}
                    className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-medium text-[var(--muted)]"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}