"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  Loader2,
  Plus,
  QrCode,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { AttendanceSession, AttendanceRecord } from "@/lib/attendance-types";
import { EnrollmentSkeleton } from "@/components/admin/enrollment-skeleton";

/* ── helpers ──────────────────────────────────────────────────────────────── */
function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("en-PH", {
    weekday: "short", year: "numeric", month: "short", day: "numeric",
  }).format(new Date(iso));
}
function fmtTime(iso: string) {
  return new Intl.DateTimeFormat("en-PH", {
    hour: "numeric", minute: "2-digit", hour12: true,
  }).format(new Date(iso));
}

/* ── new session form ─────────────────────────────────────────────────────── */
// Time string validation: "HH:mm" format
const timePattern = /^([01]?\d|2[0-3]):[0-5]\d$/;

const sessionSchema = z.object({
  title: z.string().min(1, "Title is required.").max(120),
  description: z.string().max(500).optional(),
  sessionDate: z.string().min(1, "Date is required."),
  // Time settings
  morningIn: z.string().regex(timePattern, "Use 24-hour format like 08:00").optional().or(z.literal("")),
  morningOut: z.string().regex(timePattern, "Use 24-hour format like 12:00").optional().or(z.literal("")),
  afternoonIn: z.string().regex(timePattern, "Use 24-hour format like 13:00").optional().or(z.literal("")),
  afternoonOut: z.string().regex(timePattern, "Use 24-hour format like 17:00").optional().or(z.literal("")),
  lateMinutes: z.number().int().min(1).max(120),
});
type SessionForm = z.infer<typeof sessionSchema>;

/* ── main component ───────────────────────────────────────────────────────── */
export function AttendanceDashboard() {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AttendanceSession | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/attendance");
      if (!res.ok) throw new Error("Failed to load sessions.");
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  async function openSession(session: AttendanceSession) {
    setActiveSession(session);
    setRecordsLoading(true);
    try {
      const res = await fetch(`/api/admin/attendance/${session.id}`);
      if (!res.ok) throw new Error("Failed to load records.");
      const data = await res.json();
      setRecords(data.records);
    } catch {
      setRecords([]);
    } finally {
      setRecordsLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/attendance/${deleteTarget.id}`, { method: "DELETE" });
      setSessions(prev => prev.filter(s => s.id !== deleteTarget.id));
      if (activeSession?.id === deleteTarget.id) setActiveSession(null);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const scanUrl = typeof window !== "undefined"
    ? `${window.location.origin}/attendance/scan`
    : "/attendance/scan";

  if (loading) return <EnrollmentSkeleton />;

  return (
    <div className="space-y-4">
      {/* Stat chips */}
      <div className="flex flex-wrap gap-3">
        <StatChip icon={<ClipboardCheck className="h-4 w-4" />} label="Sessions" value={sessions.length} />
        <StatChip
          icon={<Users className="h-4 w-4" />}
          label="Total scans"
          value={sessions.reduce((a, s) => a + (s._count?.records ?? 0), 0)}
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <a
          href={scanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring inline-flex h-9 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)] px-4 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface-soft)]"
        >
          <QrCode className="h-4 w-4" />
          Open Scanner
          <ExternalLink className="h-3 w-3 opacity-50" />
        </a>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="focus-ring ml-auto inline-flex h-9 items-center gap-2 rounded-full bg-[var(--primary)] px-4 text-xs font-semibold text-[var(--primary-contrast)]"
        >
          <Plus className="h-4 w-4" />
          New Session
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        {/* Sessions list */}
        <div className="space-y-2">
          {sessions.length === 0 ? (
            <div className="surface-card flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center">
              <ClipboardCheck className="h-8 w-8 text-[var(--primary)]" />
              <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">No sessions yet</p>
              <p className="mt-1 text-xs text-[var(--muted)]">Create a session then open the QR scanner to start taking attendance.</p>
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="focus-ring mt-4 inline-flex h-8 items-center gap-1.5 rounded-full bg-[var(--primary)] px-4 text-xs font-semibold text-[var(--primary-contrast)]"
              >
                <Plus className="h-3.5 w-3.5" />
                New Session
              </button>
            </div>
          ) : (
            sessions.map(session => (
              <motion.div
                key={session.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={[
                  "surface-card group flex cursor-pointer items-center gap-4 rounded-2xl p-4 transition-all",
                  activeSession?.id === session.id
                    ? "ring-2 ring-[var(--primary)] ring-offset-1"
                    : "hover:ring-1 hover:ring-[var(--border)]",
                ].join(" ")}
                onClick={() => openSession(session)}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-soft)]">
                  <CalendarDays className="h-5 w-5 text-[var(--primary)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--foreground)]">{session.title}</p>
                  <p className="text-xs text-[var(--muted)]">{fmtDate(session.sessionDate)}</p>
                  {session.description && (
                    <p className="mt-0.5 truncate text-[0.68rem] text-[var(--muted)]">{session.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-700">
                    {session._count?.records ?? 0} present
                  </span>
                  <div className="flex gap-1">
                    <a
                      href={`${scanUrl}?session=${session.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="focus-ring flex h-6 w-6 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)]"
                      title="Open scanner for this session"
                    >
                      <QrCode className="h-3 w-3" />
                    </a>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setDeleteTarget(session); }}
                      className="focus-ring flex h-6 w-6 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
                      title="Delete session"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Records panel */}
        {activeSession && (
          <div className="surface-card overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
              <div>
                <p className="text-xs font-semibold text-[var(--foreground)]">{activeSession.title}</p>
                <p className="text-[0.65rem] text-[var(--muted)]">{fmtDate(activeSession.sessionDate)}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSession(null)}
                className="focus-ring flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] text-[var(--muted)]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {recordsLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--muted)]" />
              </div>
            ) : records.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                <Users className="h-7 w-7 text-[var(--muted)]" />
                <p className="mt-2 text-sm text-[var(--muted)]">No students scanned yet.</p>
                <a
                  href={`${scanUrl}?session=${activeSession.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] underline-offset-2 hover:underline"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  Open QR Scanner
                </a>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)] max-h-[480px] overflow-y-auto">
                {records.map((r, i) => (
                  <div key={r.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="w-5 shrink-0 text-center text-[0.65rem] font-bold text-[var(--muted)]">{i + 1}</span>
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-soft)]">
                      {r.photoUrl ? (
                        <Image src={r.photoUrl} alt={r.studentName} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[var(--muted)]">
                          <Users className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-[var(--foreground)]">{r.studentName}</p>
                      <p className="truncate text-[0.63rem] text-[var(--muted)]">{r.programCourse}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mb-0.5 ml-auto" />
                      <p className="text-[0.6rem] text-[var(--muted)]">{fmtTime(r.scannedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create session modal */}
      <AnimatePresence>
        {createOpen && (
          <CreateSessionModal
            onClose={() => setCreateOpen(false)}
            onCreated={s => {
              setSessions(prev => [s, ...prev]);
              setCreateOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            className="fixed inset-0 z-[110] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !deleting && setDeleteTarget(null)} />
            <motion.div
              className="relative z-10 w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.97 }}
            >
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="mt-4 text-center font-serif text-base font-bold text-[var(--foreground)]">Delete Session</h3>
              <p className="mt-2 text-center text-xs text-[var(--muted)]">
                Delete <strong>"{deleteTarget.title}"</strong>? All attendance records will be permanently removed.
              </p>
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="focus-ring flex-1 rounded-full border border-[var(--border)] bg-[var(--background)] py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="focus-ring flex flex-1 items-center justify-center gap-1.5 rounded-full bg-red-600 py-2 text-xs font-semibold text-white"
                >
                  {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── CreateSessionModal ───────────────────────────────────────────────────── */
function CreateSessionModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (s: AttendanceSession) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<SessionForm>({
    resolver: zodResolver(sessionSchema),
    defaultValues: { sessionDate: new Date().toISOString().slice(0, 10) },
  });

  const onSubmit = handleSubmit(async values => {
    setSubmitting(true);
    setError(null);
    try {
      // Filter out empty time strings before sending
      const timeFields = ["morningIn", "morningOut", "afternoonIn", "afternoonOut"] as const;
      const cleaned: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(values)) {
        if (timeFields.includes(key as typeof timeFields[number])) {
          if (value && value !== "") cleaned[key] = value;
        } else {
          cleaned[key] = value;
        }
      }
      
      const res = await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...cleaned,
          sessionDate: new Date(values.sessionDate + "T00:00:00").toISOString(),
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message ?? "Failed to create session.");
      }
      onCreated(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <motion.div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !submitting && onClose()} />
      <motion.div
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ type: "spring", damping: 30, stiffness: 340 }}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
          <div>
            <h3 className="font-serif text-sm font-bold text-[var(--foreground)]">New Attendance Session</h3>
            <p className="text-[0.65rem] text-[var(--muted)]">Create a session to start scanning</p>
          </div>
          <button type="button" onClick={onClose} disabled={submitting} className="focus-ring flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] text-[var(--muted)]">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3 px-4 py-4">
          <div className="grid gap-1">
            <label className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Session Title</label>
            <input type="text" placeholder="e.g. Lecture – July 11" className="focus-ring w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" {...register("title")} />
            {errors.title && <span className="text-[0.65rem] text-red-400">{errors.title.message}</span>}
          </div>
          <div className="grid gap-1">
            <label className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Date</label>
            <input type="date" className="focus-ring w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" {...register("sessionDate")} />
          </div>
          <div className="grid gap-1">
            <label className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Description <span className="normal-case font-normal opacity-60">(optional)</span></label>
            <textarea rows={2} className="focus-ring w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs" {...register("description")} />
          </div>

          {/* Time Settings */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
            <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Time Settings</p>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Morning */}
              <div className="grid gap-1">
                <label className="text-[0.6rem] text-[var(--muted)]">Morning In</label>
                <input type="time" className="focus-ring rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-xs" {...register("morningIn")} />
              </div>
              <div className="grid gap-1">
                <label className="text-[0.6rem] text-[var(--muted)]">Morning Out</label>
                <input type="time" className="focus-ring rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-xs" {...register("morningOut")} />
              </div>
              {/* Afternoon */}
              <div className="grid gap-1">
                <label className="text-[0.6rem] text-[var(--muted)]">Afternoon In</label>
                <input type="time" className="focus-ring rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-xs" {...register("afternoonIn")} />
              </div>
              <div className="grid gap-1">
                <label className="text-[0.6rem] text-[var(--muted)]">Afternoon Out</label>
                <input type="time" className="focus-ring rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-xs" {...register("afternoonOut")} />
              </div>
            </div>
            {/* Late threshold */}
            <div className="mt-2.5 grid gap-1">
              <label className="text-[0.6rem] text-[var(--muted)]">Late Threshold (minutes)</label>
              <input 
                type="number" 
                min="1" 
                max="120" 
                className="focus-ring w-20 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-xs" 
                {...register("lateMinutes", { valueAsNumber: true })} 
                defaultValue={15}
              />
              <p className="text-[0.55rem] text-[var(--muted)]">Students arriving after this many minutes are marked as late</p>
            </div>
          </div>

          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[0.72rem] text-red-700">{error}</div>}
          <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-3">
            <button type="button" onClick={onClose} disabled={submitting} className="focus-ring h-8 rounded-full border border-[var(--border)] bg-[var(--background)] px-4 text-xs font-semibold text-[var(--foreground)]">Cancel</button>
            <button type="submit" disabled={submitting} className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-full bg-[var(--primary)] px-4 text-xs font-semibold text-[var(--primary-contrast)]">
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              {submitting ? "Creating…" : "Create Session"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function StatChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)] px-3.5 py-1.5 text-xs text-[var(--muted)]">
      {icon}
      <span className="font-bold text-sm text-[var(--foreground)]">{value}</span>
      <span>{label}</span>
    </div>
  );
}
