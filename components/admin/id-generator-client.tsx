"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  IdCard,
  Printer,
  Search,
  Square,
  UserRound,
  X,
} from "lucide-react";
import type { EnrollmentRecord } from "@/lib/enrollment-display";
import { formatStudentName } from "@/lib/enrollment-display";
import { StudentIdCardFront, StudentIdCardBack } from "@/components/admin/student-id-card";
import { EnrollmentSkeleton } from "@/components/admin/enrollment-skeleton";

/* ─── Print styles injected once ─────────────────────────────────────────── */
const PRINT_STYLE = `
@media print {
  body > *:not(#id-print-root) { display: none !important; }
  #id-print-root {
    display: flex !important;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 6mm;
    padding: 5mm;
  }
  .id-print-pair {
    display: flex;
    flex-direction: row;
    gap: 4mm;
    page-break-inside: avoid;
  }
  .id-card-face {
    box-shadow: none !important;
    border: 1px solid #e2e8f0 !important;
  }
}
`;

export function IdGeneratorClient() {
  const [students, setStudents] = useState<EnrollmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<EnrollmentRecord | null>(null);
  const [previewFace, setPreviewFace] = useState<"front" | "back">("front");
  const printRef = useRef<HTMLDivElement>(null);

  // Inject print CSS once
  useEffect(() => {
    const tag = document.getElementById("id-print-style");
    if (!tag) {
      const style = document.createElement("style");
      style.id = "id-print-style";
      style.textContent = PRINT_STYLE;
      document.head.appendChild(style);
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/applications");
      if (!res.ok) throw new Error("Failed to load students.");
      const all: EnrollmentRecord[] = await res.json();
      // Only APPROVED students get IDs
      setStudents(all.filter((s) => s.status === "APPROVED"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const filtered = students.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      formatStudentName(s).toLowerCase().includes(q) ||
      s.applicationNumber.toLowerCase().includes(q) ||
      s.programCourse.toLowerCase().includes(q)
    );
  });

  const allFilteredSelected = filtered.length > 0 && filtered.every((s) => selected.has(s.id));

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allFilteredSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((s) => next.delete(s.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((s) => next.add(s.id));
        return next;
      });
    }
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function handlePrint() {
    window.print();
  }

  const selectedStudents = students.filter((s) => selected.has(s.id));

  if (loading) return <EnrollmentSkeleton />;

  if (error) {
    return (
      <div className="surface-card flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <p className="mt-3 text-sm text-[var(--muted)]">{error}</p>
        <button
          type="button"
          onClick={fetchStudents}
          className="focus-ring mt-4 rounded-full border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-xs font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, ID, program…"
            className="focus-ring w-full rounded-full border border-[var(--border)] bg-[var(--background)] py-2 pl-10 pr-4 text-sm placeholder:text-[var(--muted)]/50"
          />
        </div>

        <button
          type="button"
          onClick={toggleAll}
          className="focus-ring inline-flex h-9 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)] px-4 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface-soft)]"
        >
          {allFilteredSelected
            ? <CheckSquare className="h-4 w-4 text-[var(--primary)]" />
            : <Square className="h-4 w-4 text-[var(--muted)]" />}
          {allFilteredSelected ? "Deselect All" : "Select All"}
        </button>

        {selected.size > 0 ? (
          <>
            <button
              type="button"
              onClick={clearSelection}
              className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted)] hover:bg-[var(--surface-soft)]"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="focus-ring ml-auto inline-flex h-9 items-center gap-2 rounded-full bg-[var(--primary)] px-5 text-xs font-semibold text-[var(--primary-contrast)]"
            >
              <Printer className="h-4 w-4" />
              Print {selected.size} ID{selected.size > 1 ? "s" : ""}
            </button>
          </>
        ) : null}
      </div>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <StatChip label="Approved students" value={students.length} />
        <StatChip label="Matching search" value={filtered.length} />
        <StatChip label="Selected for print" value={selected.size} accent />
      </div>

      {/* ── Student grid ─────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="surface-card flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center">
          <IdCard className="h-8 w-8 text-[var(--primary)]" />
          <p className="mt-3 text-sm text-[var(--muted)]">
            {students.length === 0
              ? "No approved students yet. Approve enrollments first."
              : "No students match your search."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((s) => {
            const isSelected = selected.has(s.id);
            return (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={[
                  "surface-card group relative cursor-pointer rounded-2xl p-3.5 transition-all",
                  isSelected
                    ? "ring-2 ring-[var(--primary)] ring-offset-1"
                    : "hover:ring-1 hover:ring-[var(--border)]",
                ].join(" ")}
                onClick={() => toggleOne(s.id)}
              >
                {/* Checkbox */}
                <div className="absolute right-3 top-3">
                  <div
                    className={[
                      "flex h-5 w-5 items-center justify-center rounded-full border-2 transition",
                      isSelected
                        ? "border-[var(--primary)] bg-[var(--primary)]"
                        : "border-[var(--border)] bg-[var(--background)]",
                    ].join(" ")}
                  >
                    {isSelected ? (
                      <svg viewBox="0 0 12 10" className="h-3 w-3" fill="none">
                        <path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : null}
                  </div>
                </div>

                {/* Student info */}
                <div className="flex items-center gap-3 pr-6">
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]">
                    {s.photoUrl ? (
                      <Image src={s.photoUrl} alt={formatStudentName(s)} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <UserRound className="h-5 w-5 text-[var(--muted)]" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                      {formatStudentName(s)}
                    </p>
                    <p className="truncate text-[0.68rem] text-[var(--muted)]">{s.programCourse}</p>
                    <p className="mt-0.5 font-mono text-[0.65rem] text-[var(--muted)]">
                      {s.applicationNumber}
                    </p>
                  </div>
                </div>

                {/* Preview button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreview(s);
                    setPreviewFace("front");
                  }}
                  className="focus-ring mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--background)] py-1.5 text-[0.68rem] font-semibold text-[var(--muted)] transition hover:text-[var(--foreground)] hover:bg-[var(--surface-soft)]"
                >
                  <IdCard className="h-3.5 w-3.5" />
                  Preview ID
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Preview modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {preview ? (
          <motion.div
            className="fixed inset-0 z-[110] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setPreview(null)}
              aria-hidden="true"
            />
            <motion.div
              className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-soft)] px-5 py-3.5">
                <div>
                  <h3 className="font-serif text-sm font-bold text-[var(--foreground)]">ID Card Preview</h3>
                  <p className="text-[0.68rem] text-[var(--muted)]">{formatStudentName(preview)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="focus-ring flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)]"
                  aria-label="Close"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Card display */}
              <div className="flex flex-col items-center gap-4 px-6 py-6">
                <div className="overflow-hidden rounded-xl">
                  <AnimatePresence mode="wait">
                    {previewFace === "front" ? (
                      <motion.div
                        key="front"
                        initial={{ opacity: 0, rotateY: -15 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        exit={{ opacity: 0, rotateY: 15 }}
                        transition={{ duration: 0.22 }}
                      >
                        <StudentIdCardFront student={preview} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="back"
                        initial={{ opacity: 0, rotateY: 15 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        exit={{ opacity: 0, rotateY: -15 }}
                        transition={{ duration: 0.22 }}
                      >
                        <StudentIdCardBack student={preview} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Face toggle */}
                <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)] p-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setPreviewFace("front")}
                    className={[
                      "rounded-full px-4 py-1.5 transition",
                      previewFace === "front"
                        ? "bg-[var(--primary)] text-[var(--primary-contrast)]"
                        : "text-[var(--muted)] hover:text-[var(--foreground)]",
                    ].join(" ")}
                  >
                    <ChevronLeft className="mr-1 inline h-3.5 w-3.5 -mt-0.5" />
                    Front
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewFace("back")}
                    className={[
                      "rounded-full px-4 py-1.5 transition",
                      previewFace === "back"
                        ? "bg-[var(--primary)] text-[var(--primary-contrast)]"
                        : "text-[var(--muted)] hover:text-[var(--foreground)]",
                    ].join(" ")}
                  >
                    Back
                    <ChevronRight className="ml-1 inline h-3.5 w-3.5 -mt-0.5" />
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--surface-soft)] px-5 py-3">
                <button
                  type="button"
                  onClick={() => {
                    toggleOne(preview.id);
                  }}
                  className={[
                    "focus-ring inline-flex h-8 items-center gap-1.5 rounded-full border px-4 text-xs font-semibold transition",
                    selected.has(preview.id)
                      ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--surface-soft)]",
                  ].join(" ")}
                >
                  {selected.has(preview.id) ? (
                    <><CheckSquare className="h-3.5 w-3.5" /> Selected</>
                  ) : (
                    <><Square className="h-3.5 w-3.5" /> Select for print</>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setPreview(null); handlePrint(); }}
                  className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-full bg-[var(--primary)] px-4 text-xs font-semibold text-[var(--primary-contrast)]"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print this ID
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ── Hidden print surface ─────────────────────────────────────────── */}
      <div id="id-print-root" className="hidden" ref={printRef} aria-hidden="true">
        {(preview && selected.size === 0
          ? [preview]
          : selectedStudents
        ).map((s) => (
          <div key={s.id} className="id-print-pair">
            <StudentIdCardFront student={s} />
            <StudentIdCardBack student={s} />
          </div>
        ))}
      </div>
    </>
  );
}

function StatChip({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs",
        accent && value > 0
          ? "border-[var(--primary)]/30 bg-[var(--primary)]/8 text-[var(--primary)]"
          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted)]",
      ].join(" ")}
    >
      <span className="font-bold text-sm">{value}</span>
      <span>{label}</span>
    </div>
  );
}
