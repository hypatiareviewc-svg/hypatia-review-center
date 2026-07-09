import Link from "next/link";
import { Globe2, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { contactInfo } from "@/lib/site-content";
import { NewsletterForm } from "@/components/newsletter-form";

type LinkItem =
  | { href: string; label: string; items?: never }
  | { label: string; items: { href: string; label: string }[] };

type GroupedLink = { label: string; items: { href: string; label: string }[] };
type SoloLink = { href: string; label: string };

export function SiteFooter({ links }: { links: readonly LinkItem[] }) {
  const { grouped, solo } = links.reduce<{ grouped: GroupedLink[]; solo: SoloLink[] }>(
    (acc, link) => {
      if ("items" in link) {
        acc.grouped.push({ label: link.label, items: link.items! });
      } else {
        acc.solo.push(link);
      }
      return acc;
    },
    { grouped: [], solo: [] },
  );

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="container-shell py-14 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.8fr_0.8fr_1.1fr] lg:gap-8">
          {/* Column 1 — Brand & Contact */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--secondary)]">
              Hypatia Review Center
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold leading-tight">
              Excellence Today.<br />Licensed Tomorrow.
            </h2>
            <p className="mt-4 max-w-xs text-sm leading-7 text-[var(--muted)]">
              A professional review environment for criminology graduates who want structure,
              accountability, and board-ready preparation.
            </p>
            <div className="mt-6 space-y-3 text-sm text-[var(--muted)]">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--secondary)]" />
                <span>{contactInfo.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-[var(--secondary)]" />
                {contactInfo.phone}
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-[var(--secondary)]" />
                {contactInfo.email}
              </div>
            </div>
          </div>

          {/* Column 2 — About & grouped links */}
          <div>
            {grouped.map((group) => (
              <div key={group.label} className="mb-8 last:mb-0">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--secondary)]">
                  {group.label}
                </p>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-[var(--muted)] transition hover:text-[var(--foreground)] hover:underline"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Column 3 — Quick Links */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--secondary)]">
              Quick Links
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {solo.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[var(--muted)] transition hover:text-[var(--foreground)] hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/admissions"
                  className="text-[var(--muted)] transition hover:text-[var(--foreground)] hover:underline"
                >
                  Admissions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 — Newsletter & Social */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--secondary)]">
              Newsletter
            </p>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              Receive enrollment reminders, review announcements, and seminar schedules.
            </p>
            <div className="mt-4">
              <NewsletterForm />
            </div>
            <div className="mt-6 flex items-center gap-3 border-t border-[var(--border)] pt-5">
              <Link
                href={contactInfo.facebook}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-[var(--border)] px-3.5 text-sm font-medium text-[var(--muted)] transition hover:-translate-y-0.5 hover:border-[var(--secondary)] hover:text-[var(--foreground)]"
              >
                <Globe2 className="h-3.5 w-3.5" />
                Facebook
              </Link>
              <Link
                href={contactInfo.messenger}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted)] transition hover:-translate-y-0.5 hover:border-[var(--secondary)] hover:text-[var(--foreground)]"
                aria-label="Open Messenger"
              >
                <MessageCircle className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-3 border-t border-[var(--border)] pt-6 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Hypatia Review Center. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy" className="transition hover:text-[var(--foreground)] hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition hover:text-[var(--foreground)] hover:underline">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
