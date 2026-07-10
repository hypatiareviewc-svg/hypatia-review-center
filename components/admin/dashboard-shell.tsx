"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import type { CurrentAdmin } from "@/lib/admin-session";

/**
 * Client shell — manages sidebar open/close state for mobile.
 */
export function DashboardShell({
  children,
  admin,
}: {
  children: React.ReactNode;
  admin: CurrentAdmin;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-72">
        <AdminTopbar admin={admin} onMenuClick={() => setSidebarOpen(true)} />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
