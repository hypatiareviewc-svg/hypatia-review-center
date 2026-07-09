import { PageHero } from "@/components/page-hero";
import { PageSection, SiteShell } from "@/components/site-shell";

export default function TermsPage() {
  return (
    <SiteShell>
      <PageHero
        title="Terms of Use"
        description="A concise placeholder terms page for deployment readiness."
        crumbs={[{ href: "/", label: "Home" }, { href: "/terms", label: "Terms of Use" }]}
      />
      <PageSection eyebrow="Terms" title="Website use overview.">
        <div className="surface-card rounded-[2rem] p-7 text-sm leading-7 text-[var(--muted)]">
          <p>This website presents institutional information, enrollment guidance, and public announcements for Hypatia Review Center.</p>
          <p className="mt-4">Final legal terms should be reviewed and replaced with the center&apos;s approved policy text before live publication.</p>
        </div>
      </PageSection>
    </SiteShell>
  );
}