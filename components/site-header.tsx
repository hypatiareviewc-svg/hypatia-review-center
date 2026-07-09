"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Menu, MoonStar, Search, SunMedium, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { quickSearchItems } from "@/lib/site-content";

type LinkItem =
  | { href: string; label: string; items?: never }
  | { label: string; items: { href: string; label: string }[] };

export function SiteHeader({ links }: { links: readonly LinkItem[] }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    return window.localStorage.getItem("hypatia-theme") === "dark" ? "dark" : "light";
  });
  const [query, setQuery] = useState("");
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("hypatia-theme", theme);
  }, [theme]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setAboutOpen(false);
    setMobileAboutOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const aboutLink = links.find((link) => "items" in link);
    if (aboutLink && "items" in aboutLink) {
      setMobileAboutOpen(aboutLink.items.some((item) => item.href === pathname));
    }
  }, [mobileMenuOpen, pathname, links]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const filteredResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return quickSearchItems;

    return quickSearchItems.filter((item) => {
      return (
        item.label.toLowerCase().includes(normalized) ||
        item.description.toLowerCase().includes(normalized)
      );
    });
  }, [query]);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
  };

  const isActive = (href: string) => pathname === href;

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] relative">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[color-mix(in_srgb,var(--background)_90%,transparent)] backdrop-blur-xl" />
      <div className="container-shell">
        <div className="flex items-center justify-between gap-3 py-4 lg:grid lg:grid-cols-[auto_1fr_auto_auto_auto] lg:gap-x-6 lg:py-5">
          <Link href="/" className="flex items-center gap-3 md:hidden">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] shadow-sm">
              <Image
                src="/logo1.png"
                alt="Hypatia Review Center"
                width={28}
                height={31}
                priority
                className="h-auto w-auto object-contain"
              />
            </span>
          </Link>

          <Link href="/" className="hidden items-center gap-3 md:flex">
            <Image
              src="/logo1.png"
              alt="Hypatia Review Center"
              width={42}
              height={47}
              priority
              className="h-auto w-auto object-contain"
            />
            <span className="leading-tight">
              <span className="block text-lg font-semibold tracking-[0.18em] text-[var(--primary)] uppercase">
                Hypatia
              </span>
              <span className="block text-xs text-[var(--muted)]">Review Center</span>
            </span>
          </Link>

          <nav className="col-span-2 mt-1 hidden min-w-0 items-center justify-center gap-8 lg:col-span-1 lg:ml-6 lg:flex xl:gap-10" aria-label="Primary">
            {links.map((link) =>
              "items" in link ? (
                <div key={link.label} className="relative">
                  <button
                    type="button"
                    onClick={() => setAboutOpen((open) => !open)}
                    onBlur={() => setTimeout(() => setAboutOpen(false), 150)}
                    className={[
                      "focus-ring inline-flex items-center gap-1 py-2 text-[0.8rem] font-medium tracking-[0.08em] uppercase transition",
                      link.items.some((item) => isActive(item.href))
                        ? "text-[var(--foreground)]"
                        : "text-[var(--muted)] hover:text-[var(--foreground)]",
                    ].join(" ")}
                    aria-expanded={aboutOpen}
                    aria-haspopup="menu"
                  >
                    {link.label}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  {aboutOpen ? (
                    <div className="absolute left-0 top-full z-20 mt-3 w-56 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_24px_60px_rgba(16,24,40,0.16)]">
                      {link.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          aria-current={isActive(item.href) ? "page" : undefined}
                          className={[
                            "block px-4 py-3 text-sm transition hover:bg-[var(--surface-soft)]",
                            isActive(item.href) ? "text-[var(--foreground)]" : "text-[var(--muted)]",
                          ].join(" ")}
                          onClick={() => setAboutOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={[
                    "relative py-2 text-[0.8rem] font-medium tracking-[0.08em] uppercase transition",
                    isActive(link.href)
                      ? "text-[var(--foreground)] after:absolute after:left-0 after:bottom-0 after:h-px after:w-full after:bg-[var(--secondary)]"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]",
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-contrast)] shadow-[0_14px_24px_rgba(20,41,75,0.16)]"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          <div className="relative ml-auto hidden w-full max-w-xs xl:block">
            <label className="sr-only" htmlFor="site-search">
              Search site
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              id="site-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search programs, faculty, admissions"
              className="focus-ring w-full rounded-full border border-[var(--border)] bg-[var(--surface)] py-3 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]"
            />
            {query ? (
              <div className="absolute left-0 top-[calc(100%+0.5rem)] z-20 w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_24px_60px_rgba(16,24,40,0.16)]">
                {filteredResults.length > 0 ? (
                  filteredResults.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block border-b border-[var(--border)] px-4 py-3 last:border-b-0 hover:bg-[var(--surface-soft)]"
                      onClick={() => setQuery("")}
                    >
                      <div className="text-sm font-semibold text-[var(--foreground)]">{item.label}</div>
                      <div className="text-xs text-[var(--muted)]">{item.description}</div>
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-5 text-sm text-[var(--muted)]">No results found.</div>
                )}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="focus-ring hidden h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] transition hover:border-[var(--secondary)] lg:inline-flex lg:justify-self-end"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
          </button>

          <Link
            href="/admissions"
            className="focus-ring hidden rounded-full bg-[linear-gradient(135deg,var(--primary),color-mix(in_srgb,var(--primary)_72%,var(--secondary)))] px-5 py-3 text-sm font-semibold text-[var(--primary-contrast)] shadow-[0_16px_34px_rgba(20,41,75,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(20,41,75,0.24)] lg:inline-flex lg:justify-self-end"
          >
            Enroll Now
          </Link>
        </div>
      </div>

      {mounted && mobileMenuOpen
        ? createPortal(
            <MobileNavDrawer
              links={links}
              theme={theme}
              query={query}
              filteredResults={filteredResults}
              mobileAboutOpen={mobileAboutOpen}
              pathname={pathname}
              onClose={closeMobileMenu}
              onQueryChange={setQuery}
              onToggleAbout={() => setMobileAboutOpen((open) => !open)}
              onToggleTheme={toggleTheme}
            />,
            document.body,
          )
        : null}
    </header>
  );
}

function MobileNavDrawer({
  links,
  theme,
  query,
  filteredResults,
  mobileAboutOpen,
  pathname,
  onClose,
  onQueryChange,
  onToggleAbout,
  onToggleTheme,
}: {
  links: readonly LinkItem[];
  theme: "light" | "dark";
  query: string;
  filteredResults: typeof quickSearchItems;
  mobileAboutOpen: boolean;
  pathname: string;
  onClose: () => void;
  onQueryChange: (value: string) => void;
  onToggleAbout: () => void;
  onToggleTheme: () => void;
}) {
  const isActive = (href: string) => pathname === href;

  return (
    <div className="fixed inset-0 z-[100] lg:hidden">
      <button
        type="button"
        aria-label="Close menu"
        className="mobile-nav-backdrop absolute inset-0 bg-[rgba(9,17,32,0.55)] backdrop-blur-md"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className="mobile-nav-panel absolute right-0 top-0 flex h-full w-full max-w-[24rem] flex-col overflow-hidden bg-[var(--surface)] shadow-[-24px_0_80px_rgba(9,17,32,0.28)]"
      >
        <div className="relative overflow-hidden border-b border-white/10 bg-[linear-gradient(145deg,#14294b,#0d1f38)] px-5 pb-5 pt-4 text-white">
          <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-[var(--secondary)]/20 blur-2xl" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                <Image
                  src="/logo1.png"
                  alt=""
                  width={28}
                  height={31}
                  className="h-auto w-auto object-contain brightness-0 invert"
                />
              </span>
              <div>
                <p className="font-display text-xl font-semibold leading-none tracking-[0.04em]">Hypatia</p>
                <p className="mt-1 text-[0.68rem] uppercase tracking-[0.28em] text-white/70">Review Center</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="relative mt-4 max-w-[16rem] text-sm leading-6 text-white/75">
            Excellence Today. Licensed Tomorrow.
          </p>
        </div>

        <div className="border-b border-[var(--border)] px-5 py-4">
          <label className="sr-only" htmlFor="mobile-site-search">
            Search site
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              id="mobile-site-search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search programs, faculty, news..."
              className="focus-ring w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] py-3 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]"
            />
          </div>
          {query ? (
            <div className="mt-3 max-h-44 overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)]">
              {filteredResults.length > 0 ? (
                filteredResults.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block border-b border-[var(--border)] px-4 py-3 last:border-b-0 transition hover:bg-[var(--surface)]"
                    onClick={onClose}
                  >
                    <div className="text-sm font-semibold text-[var(--foreground)]">{item.label}</div>
                    <div className="text-xs text-[var(--muted)]">{item.description}</div>
                  </Link>
                ))
              ) : (
                <div className="px-4 py-4 text-sm text-[var(--muted)]">No results found.</div>
              )}
            </div>
          ) : null}
        </div>

        <nav className="flex-1 overflow-y-auto px-5 py-4" aria-label="Mobile primary">
          <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[var(--secondary)]">
            Explore
          </p>
          <ul className="grid gap-1.5">
            {links.map((link) =>
              "items" in link ? (
                <li key={link.label}>
                  <button
                    type="button"
                    onClick={onToggleAbout}
                    className={[
                      "focus-ring flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left transition",
                      link.items.some((item) => isActive(item.href)) || mobileAboutOpen
                        ? "bg-[var(--surface-soft)] text-[var(--foreground)]"
                        : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]",
                    ].join(" ")}
                    aria-expanded={mobileAboutOpen}
                  >
                    <span className="font-medium">{link.label}</span>
                    <ChevronDown
                      className={[
                        "h-4 w-4 transition-transform duration-200",
                        mobileAboutOpen ? "rotate-180 text-[var(--secondary)]" : "",
                      ].join(" ")}
                    />
                  </button>
                  <div
                    className={[
                      "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
                      mobileAboutOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                    ].join(" ")}
                  >
                    <ul className="overflow-hidden">
                      <li className="grid gap-1 border-l-2 border-[var(--secondary)]/35 py-2 pl-3">
                        {link.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            aria-current={isActive(item.href) ? "page" : undefined}
                            className={[
                              "focus-ring flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition",
                              isActive(item.href)
                                ? "bg-[color-mix(in_srgb,var(--secondary)_12%,var(--surface))] font-semibold text-[var(--foreground)]"
                                : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]",
                            ].join(" ")}
                          >
                            <span>{item.label}</span>
                            {isActive(item.href) ? (
                              <span className="h-1.5 w-1.5 rounded-full bg-[var(--secondary)]" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                            )}
                          </Link>
                        ))}
                      </li>
                    </ul>
                  </div>
                </li>
              ) : (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={[
                      "focus-ring flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-medium transition",
                      isActive(link.href)
                        ? "bg-[color-mix(in_srgb,var(--secondary)_12%,var(--surface))] text-[var(--foreground)] shadow-[inset_3px_0_0_var(--secondary)]"
                        : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]",
                    ].join(" ")}
                  >
                    <span>{link.label}</span>
                    {isActive(link.href) ? (
                      <span className="rounded-full bg-[var(--secondary)]/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--secondary)]">
                        Current
                      </span>
                    ) : (
                      <ChevronRight className="h-4 w-4 opacity-35" />
                    )}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="border-t border-[var(--border)] bg-[var(--surface-soft)] px-5 py-4">
          <div className="grid gap-3">
            <Link
              href="/admissions"
              onClick={onClose}
              className="focus-ring inline-flex h-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--primary),color-mix(in_srgb,var(--primary)_72%,var(--secondary)))] px-5 text-sm font-semibold text-[var(--primary-contrast)] shadow-[0_16px_34px_rgba(20,41,75,0.2)] transition hover:-translate-y-0.5"
            >
              Enroll Now
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onToggleTheme}
                className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--secondary)]"
                aria-label="Toggle theme"
              >
                {theme === "light" ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
                {theme === "light" ? "Dark" : "Light"}
              </button>
              <Link
                href="/contact"
                onClick={onClose}
                className="focus-ring inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--secondary)]"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
