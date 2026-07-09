import { PageHero } from "@/components/page-hero";
import { PageSection, SiteShell } from "@/components/site-shell";
import { faqs } from "@/lib/site-content";

export default function FaqPage() {
  return (
    <SiteShell>
      <PageHero
        title="Frequently Asked Questions"
        description="Find direct answers about enrollment, review length, board simulations, and support services."
        crumbs={[{ href: "/", label: "Home" }, { href: "/faq", label: "FAQ" }]}
      />
      <PageSection eyebrow="FAQ" title="Practical information for applicants and students.">
        <div className="grid gap-4 lg:grid-cols-2">
          {faqs.map((faqItem) => (
            <details key={faqItem.question} className="surface-card rounded-[1.75rem] p-6">
              <summary className="cursor-pointer font-semibold">{faqItem.question}</summary>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{faqItem.answer}</p>
            </details>
          ))}
        </div>
      </PageSection>
    </SiteShell>
  );
}