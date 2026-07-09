import { PageHero } from "@/components/page-hero";
import { PageSection, SiteShell } from "@/components/site-shell";
import { ContactForm } from "@/components/contact-form";
import { contactInfo } from "@/lib/site-content";

export default function ContactPage() {
  return (
    <SiteShell>
      <PageHero
        title="Contact"
        description="Reach the admissions team, view the office location, and send an inquiry about enrollment or review schedules."
        crumbs={[{ href: "/", label: "Home" }, { href: "/contact", label: "Contact" }]}
      />
      <PageSection eyebrow="Admissions Office" title="Send an inquiry or visit the office during business hours.">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="surface-card rounded-[2rem] p-7 text-sm leading-7 text-[var(--muted)]">
            <p>{contactInfo.address}</p>
            <p className="mt-2">
              Google Maps:{" "}
              <a
                href={contactInfo.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[var(--primary)] underline-offset-4 hover:underline"
              >
                {contactInfo.mapsPlusCode}
              </a>
            </p>
            <p className="mt-4">{contactInfo.phone}</p>
            <p>{contactInfo.email}</p>
            <p>{contactInfo.hours}</p>
            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[var(--border)]">
              <iframe
                title="Hypatia Review Center location"
                src={contactInfo.mapsUrl}
                className="h-80 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
          <ContactForm />
        </div>
      </PageSection>
    </SiteShell>
  );
}