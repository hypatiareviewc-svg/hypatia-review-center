import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-session";
import { DashboardShell } from "@/components/admin/dashboard-shell";

/**
 * Server layout for all authenticated admin dashboard pages.
 * Fetches the current admin user (redirects to login if missing)
 * and renders the sidebar + topbar shell.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/admin/login");
  }

  return <DashboardShell admin={admin}>{children}</DashboardShell>;
}
