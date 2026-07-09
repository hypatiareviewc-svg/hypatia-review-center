import Link from "next/link";
import { navLinks } from "@/lib/site-content";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BackToTop } from "@/components/back-to-top";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-grid min-h-screen bg-[radial-gradient(circle_at_top,_rgba(168,130,55,0.08),_transparent_36%),linear-gradient(180deg,_rgba(255,255,255,0.35),_transparent_26%)] text-[var(--foreground)]">
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[var(--surface)] focus:px-4 focus:py-2"
        href="#main-content"
      >
        Skip to content
      </a>
      <SiteHeader links={navLinks} />
      <main id="main-content">{children}</main>
      <SiteFooter links={navLinks} />
      <BackToTop />
    </div>
  );
}

export function Container({ children }: { children: React.ReactNode }) {
  return <div className="container-shell">{children}</div>;
}

export function PageSection({
  eyebrow,
  title,
  description,
  children,
  id,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="py-16 sm:py-20">
      <Container>
        <div className="mb-8 max-w-3xl">
          {eyebrow ? (
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-[var(--secondary)]">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="font-display text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
        {children}
      </Container>
    </section>
  );
}

export function SectionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="focus-ring inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--secondary)] hover:text-[var(--primary)]"
    >
      {children}
    </Link>
  );
}