import { PageHero } from "@/components/page-hero";
import { PageSection, SiteShell } from "@/components/site-shell";

export default function PrivacyPage() {
  return (
    <SiteShell>
      <PageHero
        title="Privacy Policy"
        description="A concise placeholder privacy page for deployment readiness."
        crumbs={[{ href: "/", label: "Home" }, { href: "/privacy", label: "Privacy Policy" }]}
      />
      <PageSection eyebrow="Policy" title="Information handling overview.">
        <div className="surface-card rounded-[2rem] p-7 text-sm leading-7 text-[var(--muted)]">
          <p>Hypatia Review Center respects student privacy and uses contact details only for admissions, scheduling, and academic communication.</p>
          <p className="mt-4">This page is a production-ready placeholder that can be expanded with institution-specific legal copy before launch.</p>
        </div>
      </PageSection>
    </SiteShell>
  );
}