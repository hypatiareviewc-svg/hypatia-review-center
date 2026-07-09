import { PageHero } from "@/components/page-hero";
import { PageSection, SiteShell } from "@/components/site-shell";
import { ProgramSearch } from "@/components/program-search";
import { programs, programSubjects } from "@/lib/site-content";

export default function ProgramsPage() {
  return (
    <SiteShell>
      <PageHero
        title="Programs"
        description="Explore the main LEC review track, focused coaching options, and seminar offerings designed for criminology graduates who want a structured path to board readiness."
        crumbs={[{ href: "/", label: "Home" }, { href: "/programs", label: "Programs" }]}
      />
      <PageSection eyebrow="Program Finder" title="Search the review program that fits your schedule.">
        <ProgramSearch programs={programs} />
      </PageSection>
      <PageSection eyebrow="Subjects Covered" title="Comprehensive coverage of the criminology board syllabus.">
        <div className="flex flex-wrap gap-2">
          {programSubjects.map((subject) => (
            <span key={subject} className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--muted)]">{subject}</span>
          ))}
        </div>
      </PageSection>
    </SiteShell>
  );
}