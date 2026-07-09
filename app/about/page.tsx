import { PageHero } from "@/components/page-hero";
import { PageSection, SiteShell } from "@/components/site-shell";
import { timeline, values, whyChooseUs, story } from "@/lib/site-content";

export default function AboutPage() {
  return (
    <SiteShell>
      <PageHero
        title="About Hypatia Review Center"
        description="Learn how the center was built, what it stands for, and why its review culture feels more like a serious academic institution than a generic training room."
        crumbs={[{ href: "/", label: "Home" }, { href: "/about", label: "About" }]}
      />

      <PageSection eyebrow="Our Story" title="Founded to serve criminology graduates with purpose and discipline.">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="surface-card rounded-[2rem] p-7 text-sm leading-7 text-[var(--muted)]">
            <p>{story.history}</p>
            <p className="mt-4">{story.mission}</p>
            <p className="mt-4">{story.vision}</p>
          </div>
          <div className="surface-card rounded-[2rem] p-7">
            <h3 className="font-display text-2xl font-semibold">Core values</h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {values.map((value) => (
                <span key={value} className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2 text-sm">{value}</span>
              ))}
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection eyebrow="Timeline" title="A brief institutional history.">
        <div className="grid gap-4 lg:grid-cols-4">
          {timeline.map((entry) => (
            <article key={entry.year} className="surface-card rounded-[2rem] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--secondary)]">{entry.year}</p>
              <h3 className="mt-3 font-display text-2xl font-semibold">{entry.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{entry.text}</p>
            </article>
          ))}
        </div>
      </PageSection>

      <PageSection eyebrow="Why Choose Us" title="A professional experience that students can trust.">
        <div className="grid gap-4 lg:grid-cols-2">
          {whyChooseUs.map((item) => (
            <div key={item} className="surface-card rounded-[1.75rem] p-6 text-sm leading-7 text-[var(--muted)]">{item}</div>
          ))}
        </div>
      </PageSection>
    </SiteShell>
  );
}