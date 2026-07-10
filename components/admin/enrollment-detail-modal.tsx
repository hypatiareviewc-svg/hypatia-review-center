"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Pencil, UserRound, X } from "lucide-react";
import type { EnrollmentRecord } from "@/lib/enrollment-display";
import {
  enrollmentStatusMeta,
  formatStudentName,
  formatEnrollmentDate,
} from "@/lib/enrollment-display";
import { formatCurrency } from "@/lib/format";

const STATUSES = ["PENDING", "REVIEWING", "APPROVED", "REJECTED"] as const;

type EditState = {
  lastName: string;
  firstName: string;
  middleName: string;
  sex: string;
  birthday: string;
  birthPlace: string;
  street: string;
  barangay: string;
  cityMunicipality: string;
  province: string;
  zipcode: string;
  email: string;
  contactNumber: string;
  schoolName: string;
  schoolAddress: string;
  yearGraduated: string;
  programCourse: string;
  guardianFullName: string;
  guardianAddress: string;
  guardianContactNumber: string;
  status: string;
  tuitionFee: string;
  amountPaid: string;
};

function toEditState(r: EnrollmentRecord): EditState {
  return {
    lastName: r.lastName,
    firstName: r.firstName,
    middleName: r.middleName,
    sex: r.sex ?? "",
    birthday: r.birthday ?? "",
    birthPlace: r.birthPlace ?? "",
    street: r.street,
    barangay: r.barangay,
    cityMunicipality: r.cityMunicipality,
    province: r.province,
    zipcode: r.zipcode,
    email: r.email,
    contactNumber: r.contactNumber,
    schoolName: r.schoolName,
    schoolAddress: r.schoolAddress,
    yearGraduated: r.yearGraduated,
    programCourse: r.programCourse,
    guardianFullName: r.guardianFullName,
    guardianAddress: r.guardianAddress,
    guardianContactNumber: r.guardianContactNumber,
    status: r.status,
    tuitionFee: r.tuitionFee ?? "",
    amountPaid: r.amountPaid ?? "",
  };
}

export function EnrollmentDetailModal({
  record,
  open,
  onClose,
  onSaved,
}: {
  record: EnrollmentRecord | null;
  open: boolean;
  onClose: () => void;
  onSaved: (updated: EnrollmentRecord) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (record) {
      setForm(toEditState(record));
      setEditing(false);
      setError(null);
    }
  }, [record]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!record || !form) return null;

  const statusMeta = enrollmentStatusMeta[record.status];
  const tuition = record.tuitionFee ? Number(record.tuitionFee) : 0;
  const paid = record.amountPaid ? Number(record.amountPaid) : 0;
  const balance = Math.max(tuition - paid, 0);

  function set<K extends keyof EditState>(key: K, value: EditState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave() {
    if (!form || !record) return;
    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...form,
        tuitionFee: form.tuitionFee ? Number(form.tuitionFee) : undefined,
        amountPaid: form.amountPaid ? Number(form.amountPaid) : undefined,
      };

      const res = await fetch(`/api/admin/applications/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = "Failed to save changes.";
        try {
          const data = await res.json();
          if (data.message) msg = data.message;
        } catch {}
        throw new Error(msg);
      }

      const updated = (await res.json()) as EnrollmentRecord;
      onSaved(updated);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !saving && onClose()}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Student Information"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface-soft)] px-5 py-4 sm:px-6">
              <div className="flex items-center gap-4">
                {/* Photo */}
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-[var(--border)]">
                  {record.photoUrl ? (
                    <Image src={record.photoUrl} alt={formatStudentName(record)} fill unoptimized className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[var(--primary)]">
                      <UserRound className="h-6 w-6 text-[var(--primary-contrast)]" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-serif text-lg font-bold text-[var(--foreground)]">
                    {formatStudentName(record)}
                  </h3>
                  <p className="truncate text-xs text-[var(--muted)]">
                    {record.applicationNumber} · {formatEnrollmentDate(record.submittedAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!editing ? (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--primary)] px-4 text-xs font-semibold text-[var(--primary-contrast)] transition hover:opacity-95"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] text-[var(--muted)] transition hover:text-[var(--foreground)]"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              {/* Status badge + financial summary */}
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className={["rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em]", statusMeta.className].join(" ")}>
                  {statusMeta.label}
                </span>
                <span className="text-xs text-[var(--muted)]">
                  Tuition: <strong className="text-[var(--foreground)]">{formatCurrency(tuition)}</strong>
                </span>
                <span className="text-xs text-[var(--muted)]">
                  Paid: <strong className="text-emerald-600">{formatCurrency(paid)}</strong>
                </span>
                <span className="text-xs text-[var(--muted)]">
                  Balance: <strong className="text-red-600">{formatCurrency(balance)}</strong>
                </span>
              </div>

              {error ? (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              {/* Sections */}
              <div className="space-y-6">
                <ModalSection title="Personal Information">
                  <FieldDisplay label="Last Name" value={form.lastName} editing={editing} onChange={(v) => set("lastName", v)} />
                  <FieldDisplay label="First Name" value={form.firstName} editing={editing} onChange={(v) => set("firstName", v)} />
                  <FieldDisplay label="Middle Name" value={form.middleName} editing={editing} onChange={(v) => set("middleName", v)} />
                  <FieldDisplay
                    label="Sex"
                    value={form.sex}
                    editing={editing}
                    onChange={(v) => set("sex", v)}
                    type="select"
                    options={["Male", "Female"]}
                  />
                  <FieldDisplay label="Birthday" value={form.birthday} editing={editing} onChange={(v) => set("birthday", v)} type="date" />
                  <FieldDisplay label="Birth Place" value={form.birthPlace} editing={editing} onChange={(v) => set("birthPlace", v)} />
                </ModalSection>

                <ModalSection title="Address & Contact">
                  <FieldDisplay label="Street" value={form.street} editing={editing} onChange={(v) => set("street", v)} />
                  <FieldDisplay label="Barangay" value={form.barangay} editing={editing} onChange={(v) => set("barangay", v)} />
                  <FieldDisplay label="City / Municipality" value={form.cityMunicipality} editing={editing} onChange={(v) => set("cityMunicipality", v)} />
                  <FieldDisplay label="Province" value={form.province} editing={editing} onChange={(v) => set("province", v)} />
                  <FieldDisplay label="Zip Code" value={form.zipcode} editing={editing} onChange={(v) => set("zipcode", v)} />
                  <FieldDisplay label="Email Address" value={form.email} editing={editing} onChange={(v) => set("email", v)} type="email" />
                  <FieldDisplay label="Contact Number" value={form.contactNumber} editing={editing} onChange={(v) => set("contactNumber", v)} />
                </ModalSection>

                <ModalSection title="School & Program">
                  <FieldDisplay label="School Name" value={form.schoolName} editing={editing} onChange={(v) => set("schoolName", v)} />
                  <FieldDisplay label="School Address" value={form.schoolAddress} editing={editing} onChange={(v) => set("schoolAddress", v)} />
                  <FieldDisplay label="Year Graduated" value={form.yearGraduated} editing={editing} onChange={(v) => set("yearGraduated", v)} />
                  <FieldDisplay label="Program / Course" value={form.programCourse} editing={editing} onChange={(v) => set("programCourse", v)} />
                </ModalSection>

                <ModalSection title="Guardian Information">
                  <FieldDisplay label="Full Name" value={form.guardianFullName} editing={editing} onChange={(v) => set("guardianFullName", v)} />
                  <FieldDisplay label="Address" value={form.guardianAddress} editing={editing} onChange={(v) => set("guardianAddress", v)} />
                  <FieldDisplay label="Contact Number" value={form.guardianContactNumber} editing={editing} onChange={(v) => set("guardianContactNumber", v)} />
                </ModalSection>

                <ModalSection title="Enrollment & Financial">
                  <FieldDisplay
                    label="Status"
                    value={form.status}
                    editing={editing}
                    onChange={(v) => set("status", v)}
                    type="select"
                    options={[...STATUSES]}
                  />
                  <FieldDisplay label="Tuition Fee (₱)" value={form.tuitionFee} editing={editing} onChange={(v) => set("tuitionFee", v)} type="number" />
                  <FieldDisplay label="Amount Paid (₱)" value={form.amountPaid} editing={editing} onChange={(v) => set("amountPaid", v)} type="number" />
                </ModalSection>
              </div>
            </div>

            {/* Footer — only in edit mode */}
            {editing ? (
              <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] px-5 py-4 sm:px-6">
                <button
                  type="button"
                  onClick={() => {
                    setForm(toEditState(record));
                    setEditing(false);
                    setError(null);
                  }}
                  disabled={saving}
                  className="focus-ring inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)] px-5 text-sm font-semibold text-[var(--foreground)] transition hover:opacity-80"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="focus-ring inline-flex h-10 items-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--primary-contrast)] transition hover:opacity-95 disabled:opacity-80"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function ModalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h4 className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--secondary)]">
        {title}
      </h4>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

function FieldDisplay({
  label,
  value,
  editing,
  onChange,
  type = "text",
  options,
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
  type?: "text" | "email" | "date" | "number" | "select";
  options?: string[];
}) {
  return (
    <div>
      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        {label}
      </p>
      {editing ? (
        type === "select" && options ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="focus-ring mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          >
            <option value="">—</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="focus-ring mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          />
        )
      ) : (
        <p className="mt-1 break-words text-sm font-medium text-[var(--foreground)]">
          {value || "—"}
        </p>
      )}
    </div>
  );
}
