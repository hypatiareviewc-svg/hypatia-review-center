import type { ReactNode } from "react";

/**
 * Admin layout — intentionally does NOT use SiteShell.
 * The admin dashboard has its own chrome (sidebar, header).
 * Only the login page uses this minimal wrapper.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
      {children}
    </div>
  );
}
