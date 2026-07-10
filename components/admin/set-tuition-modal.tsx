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

type FormValues = {
  tuitionFee: number;
};

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
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (open && account) {
      reset({
        tuitionFee: account.hasExplicitTuition ? account.tuitionFee : undefined,
      });
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
        try {
          const data = await res.json();
          if (data.message) msg = data.message;
        } catch {}
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
            className="relative z-10 w-full max-w-md overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            role="dialog"
            aria-modal="true"
            aria-label="Set tuition fee"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-soft)] px-5 py-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[var(--foreground)]">
                  Set Tuition Fee
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Assign a tuition amount for this student.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Student info */}
            <div className="border-b border-[var(--border)] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--surface-soft)] ring-1 ring-[var(--border)]">
                  <DollarSign className="h-5 w-5 text-[var(--primary)]" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[var(--foreground)]">
                    {account.studentName}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    {account.applicationNumber} · {account.programCourse}
                  </p>
                </div>
              </div>

              {account.hasExplicitTuition && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                  Current tuition:{" "}
                  <strong>{formatCurrency(account.tuitionFee)}</strong> · Paid:{" "}
                  <strong>{formatCurrency(account.amountPaid)}</strong> · Balance:{" "}
                  <strong>{formatCurrency(account.balance)}</strong>
                </div>
              )}
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-4 px-5 py-5">
              <label className="grid gap-1.5 text-sm">
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Tuition Fee (₱)
                </span>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]">
                    ₱
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="0.00"
                    className="focus-ring w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-2.5 pl-8 pr-4 text-sm"
                    {...register("tuitionFee")}
                  />
                </div>
                {errors.tuitionFee ? (
                  <span className="text-xs text-red-400">{errors.tuitionFee.message}</span>
                ) : null}
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
                  className="focus-ring rounded-full border border-[var(--border)] bg-[var(--background)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="focus-ring inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-contrast)] disabled:opacity-80"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <DollarSign className="h-4 w-4" />
                  )}
                  {submitting ? "Saving…" : account.hasExplicitTuition ? "Update Tuition" : "Set Tuition"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
