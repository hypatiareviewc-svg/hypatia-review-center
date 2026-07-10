import Image from "next/image";
import { UserRound } from "lucide-react";
import { enrollmentStatusMeta, formatStudentName, type EnrollmentRecord } from "@/lib/enrollment-display";

function getBadgeLabel(status: EnrollmentRecord["status"]) {
  if (status === "APPROVED") {
    return "Enrolled";
  }

  return enrollmentStatusMeta[status].label;
}

function StudentPhoto({ student }: { student: EnrollmentRecord }) {
  const studentName = formatStudentName(student);

  if (student.photoUrl) {
    return (
      <Image
        src={student.photoUrl}
        alt={studentName}
        fill
        unoptimized
        className="object-cover object-center"
      />
    );
  }

  return (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(160deg,color-mix(in_srgb,var(--primary)_88%,#000),color-mix(in_srgb,var(--primary)_62%,var(--secondary)))]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
          <UserRound className="h-8 w-8 text-white/85" aria-hidden="true" />
        </div>
      </div>
    </>
  );
}

export function StudentGrid({ students }: { students: EnrollmentRecord[] }) {
  if (students.length === 0) {
    return (
      <div className="surface-card rounded-[2rem] p-8 text-center">
        <p className="font-display text-2xl font-semibold">No enrolled students yet</p>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          Student profiles will appear here once applications are submitted through the admissions form.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {students.map((student) => {
        const badgeLabel = getBadgeLabel(student.status);
        const isEnrolled = student.status === "APPROVED";

        return (
          <article key={student.id} className="surface-card overflow-hidden rounded-[1.75rem]">
            <div className="relative aspect-[4/5] w-full sm:aspect-[3/4]">
              <StudentPhoto student={student} />
              <span
                className={[
                  "absolute right-3 top-3 z-10 rounded-full border px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] shadow-sm",
                  isEnrolled
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : enrollmentStatusMeta[student.status].className,
                ].join(" ")}
              >
                {badgeLabel}
              </span>
            </div>

            <div className="p-4">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--secondary)]">
                Student Profile
              </p>
              <h3 className="mt-2 font-display text-xl font-semibold leading-snug">
                {formatStudentName(student)}
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    Course / Program
                  </dt>
                  <dd className="mt-1 leading-6 text-[var(--foreground)]">{student.programCourse}</dd>
                </div>
                <div>
                  <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    School Graduated
                  </dt>
                  <dd className="mt-1 leading-6 text-[var(--muted)]">{student.schoolName}</dd>
                </div>
              </dl>
            </div>
          </article>
        );
      })}
    </div>
  );
}
