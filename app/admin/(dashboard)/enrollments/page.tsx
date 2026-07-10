import { GraduationCap } from "lucide-react";

export default function EnrollmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-[var(--primary)] sm:text-3xl">
          Enrollment
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          View and manage student enrollment applications.
        </p>
      </div>
      <div className="surface-card flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--primary)]">
          <GraduationCap className="h-7 w-7" />
        </div>
        <h2 className="mt-4 font-serif text-xl font-semibold text-[var(--foreground)]">
          Enrollment Management
        </h2>
        <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
          Full CRUD enrollment features — view, approve, reject, and update student
          records — are coming next.
        </p>
      </div>
    </div>
  );
}
