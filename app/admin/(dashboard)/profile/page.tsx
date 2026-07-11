import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminUser } from "@/lib/admin-session";

export default async function ProfilePage() {
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-[var(--primary)] sm:text-3xl">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          View your admin profile information.
        </p>
      </div>

      <div className="surface-card max-w-2xl rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary)] text-[var(--primary-contrast)]">
            <span className="font-serif text-2xl font-bold">
              {admin.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-lg font-semibold text-[var(--foreground)]">
              {admin.name}
            </p>
            <p className="text-sm text-[var(--muted)]">@{admin.username}</p>
          </div>
        </div>

        <div className="mt-6 divide-y divide-[var(--border)] rounded-xl border border-[var(--border)]">
          <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
            <span className="text-[var(--muted)]">Role</span>
            <span className="font-medium text-[var(--foreground)]">Administrator</span>
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
            <span className="text-[var(--muted)]">Member since</span>
            <span className="font-medium text-[var(--foreground)]">
              {new Intl.DateTimeFormat("en-PH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }).format(new Date(admin.createdAt))}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/admin/settings"
            className="focus-ring inline-flex h-9 items-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--primary-contrast)]"
          >
            Edit Profile & Settings
          </Link>
        </div>
      </div>
    </div>
  );
}