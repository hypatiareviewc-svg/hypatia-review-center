import Image from "next/image";

type Lecturer = {
  name: string;
  title: string;
  background: string;
  experience: string;
  specialization: string;
  achievements: string;
  photo: string;
  bio: string;
};

export function FacultyGrid({ lecturers }: { lecturers: readonly Lecturer[] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {lecturers.map((lecturer) => (
        <article key={lecturer.name} className="surface-card overflow-hidden rounded-[2rem]">
          <div className="grid gap-0 md:grid-cols-[220px_1fr] lg:grid-cols-[240px_1fr]">
            <div className="relative min-h-[220px] sm:min-h-[260px]">
              <Image src={lecturer.photo} alt={lecturer.name} fill className="object-cover" />
            </div>
            <div className="p-5 sm:p-7">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[var(--secondary)] sm:text-xs sm:tracking-[0.3em]">{lecturer.title}</p>
              <h3 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">{lecturer.name}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{lecturer.bio}</p>
              <dl className="mt-5 space-y-3 text-sm">
                <div>
                  <dt className="font-semibold">Academic Background</dt>
                  <dd className="text-[var(--muted)]">{lecturer.background}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Professional Experience</dt>
                  <dd className="text-[var(--muted)]">{lecturer.experience}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Specialization</dt>
                  <dd className="text-[var(--muted)]">{lecturer.specialization}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Achievements</dt>
                  <dd className="text-[var(--muted)]">{lecturer.achievements}</dd>
                </div>
              </dl>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
