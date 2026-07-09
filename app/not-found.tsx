import Link from "next/link";
import { SiteShell } from "@/components/site-shell";

export default function NotFound() {
  return (
    <SiteShell>
      <section className="py-24 sm:py-32">
        <div className="container-shell max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--secondary)]">404</p>
          <h1 className="mt-4 font-display text-5xl font-semibold sm:text-6xl">Page not found</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
            The page you requested does not exist. Return to the main site to continue exploring programs, faculty, and admissions information.
          </p>
          <Link
            href="/"
            className="focus-ring mt-8 inline-flex rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--primary-contrast)]"
          >
            Back to home
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}