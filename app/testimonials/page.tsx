import { PageHero } from "@/components/page-hero";
import { PageSection, SiteShell } from "@/components/site-shell";
import { TestimonialCarousel } from "@/components/testimonial-carousel";
import { passers, testimonials } from "@/lib/site-content";

export default function TestimonialsPage() {
  return (
    <SiteShell>
      <PageHero
        title="Testimonials"
        description="Read how students describe the review process, the lecturers, and the atmosphere of the center."
        crumbs={[{ href: "/", label: "Home" }, { href: "/testimonials", label: "Testimonials" }]}
      />
      <PageSection eyebrow="Student Voice" title="Experiences from recent batches.">
        <TestimonialCarousel testimonials={testimonials} />
      </PageSection>
      <PageSection eyebrow="Board Passers" title="Selected passers from recent review cycles.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {passers.map((passer) => (
            <article key={passer.name} className="surface-card rounded-[2rem] p-6">
              <h3 className="font-display text-2xl font-semibold">{passer.name}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{passer.school}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--secondary)]">Passed {passer.year}</p>
            </article>
          ))}
        </div>
      </PageSection>
    </SiteShell>
  );
}