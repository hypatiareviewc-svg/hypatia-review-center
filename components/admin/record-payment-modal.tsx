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
  amount: z.coerce.number().positive("Enter a valid amount."),
  method: z.enum(["CASH", "BANK_TRANSFER", "GCASH", "MAYA", "CHECK", "OTHER"]),
  reference: z.string().max(120).optional(),
  notes: z.string().max(500).optional(),
  paidAt: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

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
    defaultValues: {
      method: "CASH",
      enrollmentId: preselectedId ?? "",
    },
  });

  const enrollmentId = watch("enrollmentId");
  const selected = accounts.find((a) => a.id === enrollmentId);
  const remaining = selected ? selected.balance : 0;

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
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
          paidAt: values.paidAt
            ? new Date(`${values.paidAt}T12:00:00`).toISOString()
            : undefined,
        }),
      });

      if (!res.ok) {
        let msg = "Failed to record payment.";
        try {
          const data = await res.json();
          if (data.message) msg = data.message;
        } catch {}
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
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            role="dialog"
            aria-modal="true"
            aria-label="Record payment"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-soft)] px-5 py-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[var(--foreground)]">
                  Record Payment
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Log a tuition payment and update the student balance.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] text-[var(--muted)]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4 px-5 py-5">
              {selected ? (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm">
                  <p className="font-medium text-[var(--foreground)]">{selected.studentName}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Tuition {formatCurrency(selected.tuitionFee)} · Paid{" "}
                    {formatCurrency(selected.amountPaid)} · Balance{" "}
                    <strong className="text-red-600">{formatCurrency(remaining)}</strong>
                  </p>
                </div>
              ) : null}

              <label className="grid gap-1.5 text-sm">
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Student
                </span>
                <select
                  className="focus-ring rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
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
                {errors.enrollmentId ? (
                  <span className="text-xs text-red-400">{errors.enrollmentId.message}</span>
                ) : null}
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm">
                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    Amount (₱)
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    max={remaining > 0 ? remaining : undefined}
                    className="focus-ring rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
                    {...register("amount")}
                  />
                  {errors.amount ? (
                    <span className="text-xs text-red-400">{errors.amount.message}</span>
                  ) : null}
                </label>

                <label className="grid gap-1.5 text-sm">
                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    Payment Date
                  </span>
                  <input
                    type="date"
                    className="focus-ring rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
                    {...register("paidAt")}
                  />
                </label>
              </div>

              <label className="grid gap-1.5 text-sm">
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Payment Method
                </span>
                <select
                  className="focus-ring rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
                  {...register("method")}
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5 text-sm">
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Reference No. (optional)
                </span>
                <input
                  type="text"
                  placeholder="Transaction ID, check no., etc."
                  className="focus-ring rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
                  {...register("reference")}
                />
              </label>

              <label className="grid gap-1.5 text-sm">
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Notes (optional)
                </span>
                <textarea
                  rows={2}
                  className="focus-ring rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
                  {...register("notes")}
                />
              </label>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="focus-ring inline-flex h-10 items-center rounded-full border border-[var(--border)] bg-[var(--background)] px-5 text-sm font-semibold text-[var(--foreground)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="focus-ring inline-flex h-10 items-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--primary-contrast)] disabled:opacity-80"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Record Payment
                    </>
                  )}
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
