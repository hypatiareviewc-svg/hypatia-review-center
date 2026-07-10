"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, Menu, Search, Settings, User } from "lucide-react";
import type { CurrentAdmin } from "@/lib/admin-session";

function useLiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Sync to the client immediately, then tick every second
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return now;
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-PH", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AdminTopbar({
  admin,
  onMenuClick,
}: {
  admin: CurrentAdmin;
  onMenuClick: () => void;
}) {
  const router = useRouter();
  const now = useLiveClock();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/admin/enrollments?q=${encodeURIComponent(q)}`);
  }

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    window.location.href = "/admin/login";
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)]/90 px-4 backdrop-blur-md sm:px-6">
      {/* Mobile menu toggle */}
      <button
        type="button"
        onClick={onMenuClick}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted)] transition hover:text-[var(--foreground)] lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search enrollments, students..."
          className="focus-ring w-full rounded-full border border-[var(--border)] bg-[var(--background)] py-2 pl-10 pr-4 text-sm placeholder:text-[var(--muted)]/60"
        />
      </form>

      {/* Right cluster */}
      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        {/* Live date & time */}
        <div className="hidden text-right md:block">
          <p className="text-sm font-semibold leading-tight text-[var(--foreground)]">
            {now ? formatTime(now) : "--:--"}
          </p>
          <p className="text-[0.65rem] uppercase tracking-[0.12em] text-[var(--muted)]">
            {now ? formatDate(now) : "Loading…"}
          </p>
        </div>

        {/* Notifications */}
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted)] transition hover:text-[var(--foreground)]"
          aria-label="Notifications"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--secondary)]" />
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-[var(--border)] py-1.5 pl-1.5 pr-2 transition hover:bg-[var(--surface-soft)] sm:pr-3"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-[var(--primary-contrast)]">
              {getInitials(admin.name)}
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-xs font-semibold text-[var(--foreground)]">{admin.name}</span>
              <span className="block text-[0.6rem] uppercase tracking-[0.12em] text-[var(--muted)]">@{admin.username}</span>
            </span>
            <ChevronDown
              className={["h-4 w-4 text-[var(--muted)] transition-transform", profileOpen ? "rotate-180" : ""].join(" ")}
            />
          </button>

          {profileOpen ? (
            <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl">
              {/* Profile header */}
              <div className="border-b border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
                <p className="text-sm font-semibold text-[var(--foreground)]">{admin.name}</p>
                <p className="text-xs text-[var(--muted)]">@{admin.username}</p>
              </div>
              {/* Menu items */}
              <ul className="py-1.5 text-sm">
                <li>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                </li>
              </ul>
              {/* Logout */}
              <div className="border-t border-[var(--border)] py-1.5">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
