"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Pencil,
  Trash2,
  UserRound,
  Search,
  Filter,
  GraduationCap,
  AlertTriangle,
  X,
  Loader2,
} from "lucide-react";
import type { EnrollmentRecord } from "@/lib/enrollment-display";
import {
  enrollmentStatusMeta,
  formatStudentName,
  formatEnrollmentDate,
} from "@/lib/enrollment-display";
import { EnrollmentSkeleton } from "@/components/admin/enrollment-skeleton";
import { EnrollmentDetailModal } from "@/components/admin/enrollment-detail-modal";

type StatusFilter = "ALL" | "PENDING" | "REVIEWING" | "APPROVED" | "REJECTED";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All Status" },
  { value: "PENDING", label: "Pending" },
  { value: "REVIEWING", label: "Under Review" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

export function EnrollmentTable() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [records, setRecords] = useState<EnrollmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const queryParam = searchParams.get("q") ?? "";
  const statusParam = (searchParams.get("status") ?? "ALL") as StatusFilter;
  const [search, setSearch] = useState(queryParam);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(statusParam);

  // Modal
  const [selectedRecord, setSelectedRecord] = useState<EnrollmentRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<EnrollmentRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/applications");
      if (!res.ok) throw new Error("Failed to load enrollments.");
      const data = await res.json();
      setRecords(data as EnrollmentRecord[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Filtered records
  const filtered = records.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        formatStudentName(r).toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.applicationNumber.toLowerCase().includes(q) ||
        r.programCourse.toLowerCase().includes(q) ||
        r.schoolName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  function handleView(record: EnrollmentRecord) {
    setSelectedRecord(record);
    setModalOpen(true);
  }

  function handleSaved(updated: EnrollmentRecord) {
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setSelectedRecord(updated);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    fetch(`/api/admin/applications/${deleteTarget.id}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete.");
        setRecords((prev) => prev.filter((r) => r.id !== deleteTarget.id));
        setDeleteTarget(null);
      })
      .catch(() => setError("Failed to delete enrollment."))
      .finally(() => setDeleting(false));
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, application no., program..."
            className="focus-ring w-full rounded-full border border-[var(--border)] bg-[var(--background)] py-2 pl-10 pr-4 text-sm placeholder:text-[var(--muted)]/50"
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="focus-ring appearance-none rounded-full border border-[var(--border)] bg-[var(--background)] py-2 pl-10 pr-8 text-sm"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Result count */}
        <p className="ml-auto text-xs text-[var(--muted)]">
          {filtered.length} of {records.length} students
        </p>
      </div>

      {/* Error */}
      {error ? (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
          <button type="button" onClick={() => setError(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {/* Table */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EnrollmentSkeleton />
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="surface-card flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--primary)]">
              <GraduationCap className="h-7 w-7" />
            </div>
            <h3 className="mt-4 font-serif text-xl font-semibold text-[var(--foreground)]">
              {records.length === 0 ? "No enrollments yet" : "No matching records"}
            </h3>
            <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
              {records.length === 0
                ? "Student enrollment applications will appear here once submitted."
                : "Try adjusting your search or filter to find what you're looking for."}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* Desktop table */}
            <div className="surface-card hidden overflow-hidden rounded-2xl md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)]">
                      <th className="px-5 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Student</th>
                      <th className="px-5 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Program</th>
                      <th className="px-5 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">School</th>
                      <th className="px-5 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Status</th>
                      <th className="px-5 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Submitted</th>
                      <th className="px-5 py-3 text-right text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {filtered.map((r) => {
                      const meta = enrollmentStatusMeta[r.status];
                      return (
                        <tr key={r.id} className="transition hover:bg-[var(--surface-soft)]">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[var(--border)]">
                                {r.photoUrl ? (
                                  <Image src={r.photoUrl} alt={formatStudentName(r)} fill unoptimized className="object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-[var(--primary)]">
                                    <UserRound className="h-4 w-4 text-[var(--primary-contrast)]" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-medium text-[var(--foreground)]">{formatStudentName(r)}</p>
                                <p className="truncate text-xs text-[var(--muted)]">{r.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <p className="truncate max-w-[10rem] text-[var(--foreground)]">{r.programCourse}</p>
                          </td>
                          <td className="px-5 py-3">
                            <p className="truncate max-w-[10rem] text-[var(--muted)]">{r.schoolName}</p>
                          </td>
                          <td className="px-5 py-3">
                            <span className={["rounded-full border px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em]", meta.className].join(" ")}>
                              {meta.label}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-[var(--muted)]">
                            {formatEnrollmentDate(r.submittedAt)}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleView(r)}
                                className="focus-ring inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 text-xs font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-soft)]"
                                title="View details"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(r)}
                                className="focus-ring inline-flex h-8 items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {filtered.map((r) => {
                const meta = enrollmentStatusMeta[r.status];
                return (
                  <div key={r.id} className="surface-card overflow-hidden rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-[var(--border)]">
                        {r.photoUrl ? (
                          <Image src={r.photoUrl} alt={formatStudentName(r)} fill unoptimized className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[var(--primary)]">
                            <UserRound className="h-5 w-5 text-[var(--primary-contrast)]" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-semibold text-[var(--foreground)]">{formatStudentName(r)}</p>
                          <span className={["shrink-0 rounded-full border px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.1em]", meta.className].join(" ")}>
                            {meta.label}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-[var(--muted)]">{r.programCourse} · {r.schoolName}</p>
                        <p className="mt-0.5 text-xs text-[var(--muted)]">{formatEnrollmentDate(r.submittedAt)}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2 border-t border-[var(--border)] pt-3">
                      <button
                        type="button"
                        onClick={() => handleView(r)}
                        className="focus-ring inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--background)] py-2 text-xs font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-soft)]"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(r)}
                        className="focus-ring inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail modal */}
      <EnrollmentDetailModal
        record={selectedRecord}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedRecord(null);
        }}
        onSaved={handleSaved}
      />

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteTarget ? (
          <motion.div
            className="fixed inset-0 z-[110] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => !deleting && setDeleteTarget(null)}
              aria-hidden="true"
            />
            <motion.div
              className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.97 }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mx-auto">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mt-4 text-center font-serif text-lg font-bold text-[var(--foreground)]">
                Delete Enrollment
              </h3>
              <p className="mt-2 text-center text-sm text-[var(--muted)]">
                Are you sure you want to delete the enrollment for{" "}
                <strong className="text-[var(--foreground)]">{formatStudentName(deleteTarget)}</strong>?
                This action cannot be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="focus-ring flex-1 rounded-full border border-[var(--border)] bg-[var(--background)] py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:opacity-80"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="focus-ring flex-1 items-center justify-center gap-2 rounded-full bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-80"
                >
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
