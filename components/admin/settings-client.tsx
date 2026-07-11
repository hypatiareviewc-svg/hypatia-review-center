"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check, KeyRound, Loader2, Plus, Shield,
  Trash2, User, UserCog, Users, X,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { CurrentAdmin } from "@/lib/admin-session";

/* ── types ──────────────────────────────────────────────────────────────── */
type AdminUser = { id: string; username: string; name: string; createdAt: string };
type Tab = "account" | "password" | "users";

/* ── schemas ────────────────────────────────────────────────────────────── */
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  username: z.string().min(3, "Username must be at least 3 characters.")
    .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores."),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(8, "Must be at least 8 characters."),
  confirmPassword: z.string().min(1, "Please confirm your password."),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

const createUserSchema = z.object({
  name: z.string().min(2, "Name is required."),
  username: z.string().min(3, "Min 3 characters.")
    .regex(/^[a-z0-9_]+$/, "Only lowercase, numbers, underscores."),
  password: z.string().min(8, "Min 8 characters."),
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;
type CreateUserForm = z.infer<typeof createUserSchema>;

/* ── main component ─────────────────────────────────────────────────────── */
export function SettingsClient({ admin }: { admin: CurrentAdmin }) {
  const [tab, setTab] = useState<Tab>("account");

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "account",  label: "Account",        icon: <User className="h-4 w-4" /> },
    { id: "password", label: "Password",        icon: <KeyRound className="h-4 w-4" /> },
    { id: "users",    label: "Admin Users",     icon: <Users className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--background)] p-1 no-scrollbar">
        {tabs.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={[
              "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition",
              tab === t.id
                ? "bg-[var(--primary)] text-[var(--primary-contrast)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--foreground)]",
            ].join(" ")}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "account" && (
          <motion.div key="account" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <AccountTab admin={admin} />
          </motion.div>
        )}
        {tab === "password" && (
          <motion.div key="password" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <PasswordTab adminId={admin.id} />
          </motion.div>
        )}
        {tab === "users" && (
          <motion.div key="users" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <UsersTab currentAdminId={admin.id} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Account tab ────────────────────────────────────────────────────────── */
function AccountTab({ admin }: { admin: CurrentAdmin }) {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: admin.name, username: admin.username },
  });

  const onSubmit = handleSubmit(async values => {
    setSaving(true); setError(null); setSuccess(false);
    try {
      const res = await fetch(`/api/admin/users/${admin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to save.");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally { setSaving(false); }
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Profile form */}
      <div className="surface-card rounded-2xl p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-soft)]">
            <UserCog className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <div>
            <h2 className="font-serif text-base font-bold text-[var(--foreground)]">Profile Information</h2>
            <p className="text-xs text-[var(--muted)]">Update your display name and username</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-1.5">
            <label className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Display Name</label>
            <input type="text" className="focus-ring rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm" {...register("name")} />
            {errors.name && <span className="text-xs text-red-400">{errors.name.message}</span>}
          </div>

          <div className="grid gap-1.5">
            <label className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Username</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]">@</span>
              <input type="text" className="focus-ring w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-2.5 pl-8 pr-3 text-sm" {...register("username")} />
            </div>
            {errors.username && <span className="text-xs text-red-400">{errors.username.message}</span>}
          </div>

          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</div>}
          {success && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
              <Check className="h-4 w-4" /> Profile updated successfully.
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button type="submit" disabled={saving || !isDirty}
              className="focus-ring inline-flex h-9 items-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--primary-contrast)] disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Account info card */}
      <div className="surface-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)] text-[var(--primary-contrast)]">
            <span className="font-serif text-xl font-bold">{admin.name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="font-semibold text-[var(--foreground)]">{admin.name}</p>
            <p className="text-xs text-[var(--muted)]">@{admin.username}</p>
          </div>
        </div>
        <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)]">
          <InfoRow label="Role" value="Administrator" />
          <InfoRow label="Member since" value={new Intl.DateTimeFormat("en-PH", { year: "numeric", month: "long", day: "numeric" }).format(new Date(admin.createdAt))} />
        </div>
      </div>
    </div>
  );
}

/* ── Password tab ───────────────────────────────────────────────────────── */
function PasswordTab({ adminId }: { adminId: string }) {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = handleSubmit(async values => {
    setSaving(true); setError(null); setSuccess(false);
    try {
      const res = await fetch(`/api/admin/users/${adminId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: values.currentPassword, newPassword: values.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to update password.");
      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally { setSaving(false); }
  });

  return (
    <div className="max-w-lg">
      <div className="surface-card rounded-2xl p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-soft)]">
            <KeyRound className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <div>
            <h2 className="font-serif text-base font-bold text-[var(--foreground)]">Change Password</h2>
            <p className="text-xs text-[var(--muted)]">Use a strong password with at least 8 characters</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-1.5">
            <label className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Current Password</label>
            <div className="relative">
              <input type={showCurrent ? "text" : "password"} className="focus-ring w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 pr-10 text-sm" {...register("currentPassword")} />
              <button type="button" onClick={() => setShowCurrent(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.65rem] font-semibold text-[var(--muted)] hover:text-[var(--foreground)]">
                {showCurrent ? "Hide" : "Show"}
              </button>
            </div>
            {errors.currentPassword && <span className="text-xs text-red-400">{errors.currentPassword.message}</span>}
          </div>

          <div className="grid gap-1.5">
            <label className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">New Password</label>
            <div className="relative">
              <input type={showNew ? "text" : "password"} className="focus-ring w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 pr-10 text-sm" {...register("newPassword")} />
              <button type="button" onClick={() => setShowNew(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.65rem] font-semibold text-[var(--muted)] hover:text-[var(--foreground)]">
                {showNew ? "Hide" : "Show"}
              </button>
            </div>
            {errors.newPassword && <span className="text-xs text-red-400">{errors.newPassword.message}</span>}
          </div>

          <div className="grid gap-1.5">
            <label className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Confirm New Password</label>
            <input type="password" className="focus-ring rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm" {...register("confirmPassword")} />
            {errors.confirmPassword && <span className="text-xs text-red-400">{errors.confirmPassword.message}</span>}
          </div>

          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</div>}
          {success && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
              <Check className="h-4 w-4" /> Password updated successfully.
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button type="submit" disabled={saving}
              className="focus-ring inline-flex h-9 items-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--primary-contrast)] disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
              {saving ? "Updating…" : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Users tab ──────────────────────────────────────────────────────────── */
function UsersTab({ currentAdminId }: { currentAdminId: string }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to load users.");
      setUsers(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user.");
    } finally { setDeleting(false); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-base font-bold text-[var(--foreground)]">Admin Users</h2>
          <p className="text-xs text-[var(--muted)]">Manage who has access to this admin panel</p>
        </div>
        <button type="button" onClick={() => setCreateOpen(true)}
          className="focus-ring inline-flex h-9 items-center gap-2 rounded-full bg-[var(--primary)] px-4 text-xs font-semibold text-[var(--primary-contrast)]">
          <Plus className="h-4 w-4" /> Add User
        </button>
      </div>

      {error && <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><X className="h-4 w-4 shrink-0" />{error}<button onClick={() => setError(null)} className="ml-auto"><X className="h-3.5 w-3.5" /></button></div>}

      <div className="surface-card overflow-hidden rounded-2xl">
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[var(--muted)]" /></div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {users.map(user => (
              <div key={user.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-contrast)]">
                  <span className="font-serif text-sm font-bold">{user.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-[var(--foreground)]">{user.name}</p>
                    {user.id === currentAdminId && (
                      <span className="rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-[var(--primary)]">You</span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--muted)]">@{user.username}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[0.65rem] text-[var(--muted)]">
                    Joined {new Intl.DateTimeFormat("en-PH", { month: "short", year: "numeric" }).format(new Date(user.createdAt))}
                  </p>
                  {user.id !== currentAdminId && user.username !== "admin@hrc.com" && (
                    <button type="button" onClick={() => setDeleteTarget(user)}
                      className="focus-ring mt-1.5 inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[0.65rem] font-semibold text-red-600 hover:bg-red-100">
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create user modal */}
      <AnimatePresence>
        {createOpen && (
          <CreateUserModal
            onClose={() => setCreateOpen(false)}
            onCreated={u => { setUsers(prev => [...prev, u]); setCreateOpen(false); }}
          />
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div className="fixed inset-0 z-[110] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !deleting && setDeleteTarget(null)} />
            <motion.div className="relative z-10 w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.97 }}>
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-100"><Trash2 className="h-5 w-5 text-red-600" /></div>
              <h3 className="mt-4 text-center font-serif text-base font-bold text-[var(--foreground)]">Remove Admin User</h3>
              <p className="mt-2 text-center text-xs text-[var(--muted)]">Remove <strong className="text-[var(--foreground)]">{deleteTarget.name}</strong> (@{deleteTarget.username})? They will lose all admin access immediately.</p>
              <div className="mt-5 flex gap-2">
                <button type="button" onClick={() => setDeleteTarget(null)} disabled={deleting} className="focus-ring flex-1 rounded-full border border-[var(--border)] bg-[var(--background)] py-2.5 text-sm font-semibold">Cancel</button>
                <button type="button" onClick={handleDelete} disabled={deleting} className="focus-ring flex flex-1 items-center justify-center gap-2 rounded-full bg-red-600 py-2.5 text-sm font-semibold text-white disabled:opacity-70">
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  {deleting ? "Removing…" : "Remove"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── CreateUserModal ────────────────────────────────────────────────────── */
function CreateUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: (u: AdminUser) => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
  });

  const onSubmit = handleSubmit(async values => {
    setSubmitting(true); setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to create user.");
      onCreated(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally { setSubmitting(false); }
  });

  return (
    <motion.div className="fixed inset-0 z-[110] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !submitting && onClose()} />
      <motion.div
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
        initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ type: "spring", damping: 30, stiffness: 340 }}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-soft)] px-5 py-4">
          <div>
            <h3 className="font-serif text-sm font-bold text-[var(--foreground)]">Add Admin User</h3>
            <p className="text-[0.65rem] text-[var(--muted)]">Grant someone access to the admin panel</p>
          </div>
          <button type="button" onClick={onClose} disabled={submitting} className="focus-ring flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] text-[var(--muted)]"><X className="h-3.5 w-3.5" /></button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5 px-5 py-5">
          <div className="grid gap-1.5">
            <label className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Full Name</label>
            <input type="text" placeholder="e.g. Maria Santos" className="focus-ring rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm placeholder:text-[var(--muted)]/40" {...register("name")} />
            {errors.name && <span className="text-xs text-red-400">{errors.name.message}</span>}
          </div>

          <div className="grid gap-1.5">
            <label className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Username</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]">@</span>
              <input type="text" placeholder="e.g. maria_santos" className="focus-ring w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-2.5 pl-8 pr-3 text-sm placeholder:text-[var(--muted)]/40" {...register("username")} />
            </div>
            {errors.username && <span className="text-xs text-red-400">{errors.username.message}</span>}
          </div>

          <div className="grid gap-1.5">
            <label className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Password</label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} placeholder="Min. 8 characters" className="focus-ring w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 pr-14 text-sm placeholder:text-[var(--muted)]/40" {...register("password")} />
              <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.65rem] font-semibold text-[var(--muted)] hover:text-[var(--foreground)]">{showPass ? "Hide" : "Show"}</button>
            </div>
            {errors.password && <span className="text-xs text-red-400">{errors.password.message}</span>}
          </div>

          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</div>}

          <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-4">
            <button type="button" onClick={onClose} disabled={submitting} className="focus-ring h-9 rounded-full border border-[var(--border)] bg-[var(--background)] px-5 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--surface-soft)] disabled:opacity-60">Cancel</button>
            <button type="submit" disabled={submitting} className="focus-ring inline-flex h-9 items-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--primary-contrast)] disabled:opacity-70">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {submitting ? "Creating…" : "Create User"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ── helpers ────────────────────────────────────────────────────────────── */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="font-medium text-[var(--foreground)]">{value}</span>
    </div>
  );
}
