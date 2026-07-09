import { PageHero } from "@/components/page-hero";
import { PageSection, SiteShell } from "@/components/site-shell";
import { FacultyGrid } from "@/components/faculty-grid";
import { lecturers } from "@/lib/site-content";

export default function FacultyPage() {
  return (
    <SiteShell>
      <PageHero
        title="Lecturers"
        description="Meet the faculty members who lead the review program with subject depth, teaching discipline, and board-focused guidance."
        crumbs={[{ href: "/", label: "Home" }, { href: "/faculty", label: "Lecturers" }]}
      />
      <PageSection eyebrow="Faculty Profile" title="Experienced lecturers with specialist expertise.">
        <FacultyGrid lecturers={lecturers} />
      </PageSection>
    </SiteShell>
  );
}