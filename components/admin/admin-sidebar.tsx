"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  GraduationCap,
  Wallet,
  IdCard,
  CalendarDays,
  ClipboardCheck,
  Settings,
  LogOut,
  X,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-[1.15rem] w-[1.15rem]" /> },
  { href: "/admin/enrollments", label: "Enrollment", icon: <GraduationCap className="h-[1.15rem] w-[1.15rem]" /> },
  { href: "/admin/financial", label: "Financial Account", icon: <Wallet className="h-[1.15rem] w-[1.15rem]" /> },
  { href: "/admin/id-generator", label: "ID Generator", icon: <IdCard className="h-[1.15rem] w-[1.15rem]" /> },
  { href: "/admin/calendar", label: "Calendar", icon: <CalendarDays className="h-[1.15rem] w-[1.15rem]" /> },
  { href: "/admin/attendance", label: "Attendance", icon: <ClipboardCheck className="h-[1.15rem] w-[1.15rem]" /> },
  { href: "/admin/settings", label: "Settings", icon: <Settings className="h-[1.15rem] w-[1.15rem]" /> },
];

export function AdminSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin/dashboard") return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Mobile backdrop */}
      {open ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Brand header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border)] px-5">
          <Link href="/admin/dashboard" className="flex items-center gap-3" onClick={onClose}>
            <div className="relative h-9 w-9 overflow-hidden rounded-lg border border-[var(--border)]">
              <Image src="/logo1.png" alt="Hypatia" fill className="object-cover" />
            </div>
            <div className="leading-tight">
              <p className="font-serif text-sm font-bold text-[var(--primary)]">Hypatia</p>
              <p className="text-[0.6rem] uppercase tracking-[0.2em] text-[var(--secondary)]">Admin Panel</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--foreground)] lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="px-3 pb-2 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            Menu
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={[
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                      active
                        ? "bg-[var(--primary)] text-[var(--primary-contrast)] shadow-sm"
                        : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]",
                    ].join(" ")}
                  >
                    <span className={active ? "text-[var(--secondary)]" : ""}>{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer / logout */}
        <div className="shrink-0 border-t border-[var(--border)] p-3">
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}

function LogoutButton() {
  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    window.location.href = "/admin/login";
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--muted)] transition hover:bg-red-50 hover:text-red-600"
    >
      <LogOut className="h-[1.15rem] w-[1.15rem]" />
      Sign out
    </button>
  );
}
