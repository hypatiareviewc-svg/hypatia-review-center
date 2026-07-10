"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DollarSign, Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatCurrency } from "@/lib/format";
import type { FinancialAccount } from "@/lib/financial-stats";

const formSchema = z.object({
  tuitionFee: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)),
    z
      .number({ message: "Enter a valid amount." })
      .min(1, "Tuition must be at least ₱1.")
      .max(9_999_999, "Amount too large."),
  ),
});

type FormValues = { tuitionFee: number };

export function SetTuitionModal({
  open,
  onClose,
  account,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  account: FinancialAccount | null;
  onSaved: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { tuitionFee: undefined },
  });

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (open && account) {
      reset({ tuitionFee: account.hasExplicitTuition ? account.tuitionFee : undefined });
      setError(null);
    }
  }, [open, account, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (!account) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/applications/${account.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tuitionFee: values.tuitionFee }),
      });
      if (!res.ok) {
        let msg = "Failed to set tuition.";
        try { const d = await res.json(); if (d.message) msg = d.message; } catch {}
        throw new Error(msg);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <AnimatePresence>
      {open && account ? (
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
            className="relative z-10 w-full max-w-xs overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: "spring", damping: 30, stiffness: 340 }}
            role="dialog"
            aria-modal="true"
            aria-label="Set tuition fee"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
              <div>
                <h3 className="font-serif text-sm font-bold text-[var(--foreground)]">Set Tuition Fee</h3>
                <p className="text-[0.68rem] text-[var(--muted)]">Assign a tuition amount</p>
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

            {/* Student info */}
            <div className="border-b border-[var(--border)] px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--surface-soft)] ring-1 ring-[var(--border)]">
                  <DollarSign className="h-4 w-4 text-[var(--primary)]" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[var(--foreground)]">{account.studentName}</p>
                  <p className="truncate text-[0.65rem] text-[var(--muted)]">{account.programCourse}</p>
                </div>
              </div>

              {account.hasExplicitTuition ? (
                <div className="mt-2.5 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[0.68rem] text-amber-800">
                  <span>Current <strong>{formatCurrency(account.tuitionFee)}</strong></span>
                  <span className="text-amber-400">·</span>
                  <span>Balance <strong>{formatCurrency(account.balance)}</strong></span>
                </div>
              ) : null}
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-3 px-4 py-3">
              <div className="grid gap-1">
                <label className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                  Tuition Fee (₱)
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)]">₱</span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="0.00"
                    className="focus-ring w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2 pl-6 pr-3 text-xs"
                    {...register("tuitionFee")}
                  />
                </div>
                {errors.tuitionFee ? (
                  <span className="text-[0.65rem] text-red-400">{errors.tuitionFee.message}</span>
                ) : null}
              </div>

              {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[0.72rem] text-red-700">{error}</div>
              ) : null}

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
                  {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <DollarSign className="h-3.5 w-3.5" />}
                  {submitting ? "Saving…" : account.hasExplicitTuition ? "Update" : "Set Tuition"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
