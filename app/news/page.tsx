import { PageHero } from "@/components/page-hero";
import { PageSection, SiteShell } from "@/components/site-shell";
import { newsItems } from "@/lib/site-content";
import { Search } from "lucide-react";

export default function NewsPage() {
  return (
    <SiteShell>
      <PageHero
        title="News and Announcements"
        description="Stay informed about enrollment schedules, seminars, and board review updates."
        crumbs={[{ href: "/", label: "Home" }, { href: "/news", label: "News" }]}
      />
      <PageSection eyebrow="Recent Updates" title="Announcements that matter to students and parents.">
        <div className="mb-6 max-w-xl rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span>Search is available on the home page header and the programs page.</span>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {newsItems.map((item) => (
            <article key={item.title} className="surface-card rounded-[2rem] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--secondary)]">{item.category}</p>
              <h3 className="mt-3 font-display text-2xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{item.date}</p>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{item.summary}</p>
            </article>
          ))}
        </div>
      </PageSection>
    </SiteShell>
  );
}