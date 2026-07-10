import { GraduationCap } from "lucide-react";
import { EnrollmentSkeleton } from "@/components/admin/enrollment-skeleton";

export default function EnrollmentsLoading() {
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
      <EnrollmentSkeleton />
    </div>
  );
}
