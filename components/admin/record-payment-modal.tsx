"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatCurrency } from "@/lib/format";
import { PAYMENT_METHODS, getBalance, resolveTuition } from "@/lib/financial";
import type { FinancialAccount } from "@/lib/financial-stats";

const formSchema = z.object({
  enrollmentId: z.string().min(1, "Select a student."),
  amount: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)),
    z.number({ message: "Enter a valid amount." }).positive("Enter a valid amount."),
  ),
  method: z.enum(["CASH", "BANK_TRANSFER", "GCASH", "MAYA", "CHECK", "OTHER"]),
  reference: z.string().max(120).optional(),
  notes: z.string().max(500).optional(),
  paidAt: z.string().optional(),
});

type FormValues = {
  enrollmentId: string;
  amount: number;
  method: "CASH" | "BANK_TRANSFER" | "GCASH" | "MAYA" | "CHECK" | "OTHER";
  reference?: string;
  notes?: string;
  paidAt?: string;
};

export function RecordPaymentModal({
  open,
  onClose,
  accounts,
  preselectedId,
  onRecorded,
}: {
  open: boolean;
  onClose: () => void;
  accounts: FinancialAccount[];
  preselectedId?: string;
  onRecorded: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { method: "CASH", enrollmentId: preselectedId ?? "" },
  });

  const enrollmentId = watch("enrollmentId");
  const selectedMethod = watch("method");
  const selected = accounts.find((a) => a.id === enrollmentId);
  const remaining = selected ? selected.balance : 0;

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (open) {
      reset({
        enrollmentId: preselectedId ?? "",
        amount: undefined,
        method: "CASH",
        reference: "",
        notes: "",
        paidAt: new Date().toISOString().slice(0, 10),
      });
      setError(null);
    }
  }, [open, preselectedId, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          paidAt: values.paidAt ? new Date(`${values.paidAt}T12:00:00`).toISOString() : undefined,
        }),
      });
      if (!res.ok) {
        let msg = "Failed to record payment.";
        try { const d = await res.json(); if (d.message) msg = d.message; } catch {}
        throw new Error(msg);
      }
      onRecorded();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !submitting && onClose()}
            aria-hidden="true"
          />

          <motion.div
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: "spring", damping: 30, stiffness: 340 }}
            role="dialog"
            aria-modal="true"
            aria-label="Record payment"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
              <div>
                <h3 className="font-serif text-sm font-bold text-[var(--foreground)]">Record Payment</h3>
                <p className="text-[0.68rem] text-[var(--muted)]">Log a tuition payment</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="focus-ring flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)]"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Student balance summary */}
            {selected ? (
              <div className="border-b border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-semibold text-[var(--foreground)]">{selected.studentName}</p>
                  <div className="flex shrink-0 items-center gap-2 text-[0.68rem]">
                    <span className="text-[var(--muted)]">Balance</span>
                    <span className="font-bold text-red-600">{formatCurrency(remaining)}</span>
                  </div>
                </div>
                {selected.tuitionFee > 0 ? (
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[var(--border)]">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${Math.min(Math.round((selected.amountPaid / selected.tuitionFee) * 100), 100)}%` }}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-3 px-4 py-3">

              {/* Student selector */}
              {!preselectedId ? (
                <div className="grid gap-1">
                  <label className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Student</label>
                  <select
                    className="focus-ring w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-2 text-xs"
                    {...register("enrollmentId")}
                    onChange={(e) => setValue("enrollmentId", e.target.value, { shouldValidate: true })}
                  >
                    <option value="">Select student…</option>
                    {accounts
                      .filter((a) => a.balance > 0 && a.status !== "REJECTED")
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.studentName} — {formatCurrency(a.balance)} remaining
                        </option>
                      ))}
                  </select>
                  {errors.enrollmentId ? <span className="text-[0.65rem] text-red-400">{errors.enrollmentId.message}</span> : null}
                </div>
              ) : (
                <input type="hidden" {...register("enrollmentId")} />
              )}

              {/* Amount + Date */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="grid gap-1">
                  <label className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Amount</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)]">₱</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      max={remaining > 0 ? remaining : undefined}
                      placeholder="0"
                      className="focus-ring w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2 pl-6 pr-2.5 text-xs"
                      {...register("amount")}
                    />
                  </div>
                  {errors.amount
                    ? <span className="text-[0.65rem] text-red-400">{errors.amount.message}</span>
                    : remaining > 0
                      ? <span className="text-[0.63rem] text-[var(--muted)]">Max {formatCurrency(remaining)}</span>
                      : null}
                </div>
                <div className="grid gap-1">
                  <label className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Date</label>
                  <input
                    type="date"
                    className="focus-ring w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-2 text-xs"
                    {...register("paidAt")}
                  />
                </div>
              </div>

              {/* Payment method pills */}
              <div className="grid gap-1">
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Method</span>
                <div className="flex flex-wrap gap-1.5">
                  {PAYMENT_METHODS.map((m) => (
                    <label
                      key={m.value}
                      className={[
                        "cursor-pointer select-none rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold transition",
                        selectedMethod === m.value
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-contrast)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)]/50",
                      ].join(" ")}
                    >
                      <input type="radio" value={m.value} className="sr-only" {...register("method")} />
                      {m.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Reference */}
              <div className="grid gap-1">
                <label className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                  Reference <span className="normal-case font-normal opacity-60">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Transaction ID, check no…"
                  className="focus-ring w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-2 text-xs placeholder:text-[var(--muted)]/40"
                  {...register("reference")}
                />
              </div>

              {/* Notes */}
              <div className="grid gap-1">
                <label className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                  Notes <span className="normal-case font-normal opacity-60">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Any additional notes…"
                  className="focus-ring w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-2 text-xs placeholder:text-[var(--muted)]/40"
                  {...register("notes")}
                />
              </div>

              {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[0.72rem] text-red-700">{error}</div>
              ) : null}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="focus-ring h-8 rounded-full border border-[var(--border)] bg-[var(--background)] px-4 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface-soft)] disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-full bg-[var(--primary)] px-4 text-xs font-semibold text-[var(--primary-contrast)] hover:opacity-90 disabled:opacity-70"
                >
                  {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  {submitting ? "Saving…" : "Record Payment"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function getAccountSummary(account: FinancialAccount) {
  const tuition = resolveTuition(account.tuitionFee);
  const balance = getBalance(tuition, account.amountPaid);
  return { tuition, balance };
}
