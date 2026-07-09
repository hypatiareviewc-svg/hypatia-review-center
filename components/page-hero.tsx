import Link from "next/link";

export function PageHero({
  title,
  description,
  crumbs,
}: {
  title: string;
  description: string;
  crumbs: Array<{ href: string; label: string }>;
}) {
  return (
    <section className="border-b border-[var(--border)] bg-[linear-gradient(180deg,_rgba(20,41,75,0.05),_transparent)] py-14 sm:py-18">
      <div className="container-shell">
        <nav aria-label="Breadcrumb" className="text-sm text-[var(--muted)]">
          <ol className="flex flex-wrap items-center gap-2">
            {crumbs.map((crumb, index) => (
              <li key={crumb.href} className="flex items-center gap-2">
                <Link href={crumb.href} className="hover:text-[var(--foreground)]">
                  {crumb.label}
                </Link>
                {index < crumbs.length - 1 ? <span aria-hidden="true">/</span> : null}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
          {description}
        </p>
      </div>
    </section>
  );
}