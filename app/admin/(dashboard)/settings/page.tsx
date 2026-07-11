import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-session";
import { SettingsClient } from "@/components/admin/settings-client";

export default async function SettingsPage() {
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-[var(--primary)] sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Manage admin account, preferences, and system configuration.
        </p>
      </div>

      <SettingsClient admin={admin} />
    </div>
  );
}