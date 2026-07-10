"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Banknote,
  BookOpen,
  Calendar,
  CreditCard,
  DollarSign,
  Hash,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import {
  balanceStatusMeta,
  paymentMethodLabel,
  type PaymentMethod,
} from "@/lib/financial";
import type { FinancialAccount, PaymentRecord } from "@/lib/financial-stats";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

export function StudentFinancialDrawer({
  open,
  account,
  payments,
  onClose,
  onRecordPayment,
  onSetTuition,
  onReversePayment,
}: {
  open: boolean;
  account: FinancialAccount | null;
  payments: PaymentRecord[];
  onClose: () => void;
  onRecordPayment: (accountId: string) => void;
  onSetTuition: (account: FinancialAccount) => void;
  onReversePayment: (payment: PaymentRecord) => void;
}) {
  const studentPayments = account
    ? payments.filter((p) => p.enrollmentId === account.id)
    : [];

  const paidPct =
    account && account.tuitionFee > 0
      ? Math.min(Math.round((account.amountPaid / account.tuitionFee) * 100), 100)
      : 0;

  return (
    <AnimatePresence>
      {open && account ? (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <motion.aside
            className="fixed inset-y-0 right-0 z-[101] flex w-full max-w-sm flex-col overflow-y-auto border-l border-[var(--border)] bg-[var(--surface)] shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            role="complementary"
            aria-label="Student financial details"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
              <button
                type="button"
                onClick={onClose}
                className="focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)]"
                aria-label="Close drawer"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="min-w-0">
                <p className="truncate font-semibold text-[var(--foreground)]">
                  {account.studentName}
                </p>
                <p className="text-xs text-[var(--muted)]">{account.applicationNumber}</p>
              </div>
              <span
                className={[
                  "ml-auto shrink-0 rounded-full border px-2.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.1em]",
                  balanceStatusMeta[account.balanceStatus].className,
                ].join(" ")}
              >
                {balanceStatusMeta[account.balanceStatus].label}
              </span>
            </div>

            {/* Student meta */}
            <div className="border-b border-[var(--border)] px-4 py-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <BookOpen className="h-3.5 w-3.5 shrink-0" />
                <span>{account.programCourse}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <User className="h-3.5 w-3.5 shrink-0" />
                <span className="capitalize">{account.status.toLowerCase()}</span>
              </div>
              {account.lastPaymentAt ? (
                <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span>Last payment: {formatDate(account.lastPaymentAt)}</span>
                </div>
              ) : null}
            </div>

            {/* Financial summary */}
            <div className="border-b border-[var(--border)] px-4 py-4 space-y-3">
              <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Financial Summary
              </h3>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-[var(--surface-soft)] px-2 py-3">
                  <p className="text-[0.6rem] font-medium uppercase tracking-[0.1em] text-[var(--muted)]">
                    Tuition
                  </p>
                  <p className="mt-1 text-sm font-bold text-[var(--foreground)]">
                    {formatCurrency(account.tuitionFee)}
                  </p>
                </div>
                <div className="rounded-xl bg-[var(--surface-soft)] px-2 py-3">
                  <p className="text-[0.6rem] font-medium uppercase tracking-[0.1em] text-[var(--muted)]">
                    Paid
                  </p>
                  <p className="mt-1 text-sm font-bold text-emerald-600">
                    {formatCurrency(account.amountPaid)}
                  </p>
                </div>
                <div className="rounded-xl bg-[var(--surface-soft)] px-2 py-3">
                  <p className="text-[0.6rem] font-medium uppercase tracking-[0.1em] text-[var(--muted)]">
                    Balance
                  </p>
                  <p className="mt-1 text-sm font-bold text-red-600">
                    {formatCurrency(account.balance)}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              {account.tuitionFee > 0 ? (
                <div>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-[var(--muted)]">Payment progress</span>
                    <span className="font-semibold text-[var(--foreground)]">{paidPct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-soft)]">
                    <motion.div
                      className="h-full rounded-full bg-emerald-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${paidPct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            {/* Actions */}
            <div className="border-b border-[var(--border)] px-4 py-3 flex flex-wrap gap-2">
              {account.balance > 0 && account.status !== "REJECTED" ? (
                <button
                  type="button"
                  onClick={() => onRecordPayment(account.id)}
                  className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-full bg-[var(--primary)] px-4 text-xs font-semibold text-[var(--primary-contrast)]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Record Payment
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => onSetTuition(account)}
                className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--background)] px-4 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface-soft)]"
              >
                <DollarSign className="h-3.5 w-3.5" />
                {account.hasExplicitTuition ? "Edit Tuition" : "Set Tuition"}
              </button>
            </div>

            {/* Payment history */}
            <div className="flex-1 px-4 py-4">
              <h3 className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Payment History ({studentPayments.length})
              </h3>

              {studentPayments.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] px-6 py-10 text-center">
                  <Banknote className="h-7 w-7 text-[var(--muted)]" />
                  <p className="mt-2 text-sm text-[var(--muted)]">No payments recorded yet.</p>
                  {account.balance > 0 && account.status !== "REJECTED" ? (
                    <button
                      type="button"
                      onClick={() => onRecordPayment(account.id)}
                      className="focus-ring mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] underline-offset-2 hover:underline"
                    >
                      Record the first payment
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-2">
                  {studentPayments.map((p) => (
                    <div
                      key={p.id}
                      className="group rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-emerald-600">
                            + {formatCurrency(p.amount)}
                          </p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--muted)]">
                            <span className="flex items-center gap-1">
                              <CreditCard className="h-3 w-3" />
                              {paymentMethodLabel(p.method as PaymentMethod)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(p.paidAt)}
                            </span>
                          </div>
                          {p.reference ? (
                            <p className="mt-1 flex items-center gap-1 text-[0.67rem] text-[var(--muted)]">
                              <Hash className="h-3 w-3" />
                              {p.reference}
                            </p>
                          ) : null}
                          {p.recordedBy ? (
                            <p className="mt-0.5 text-[0.67rem] text-[var(--muted)]">
                              By {p.recordedBy}
                            </p>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => onReversePayment(p)}
                          className="focus-ring shrink-0 flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-100"
                          title="Reverse payment"
                          aria-label="Reverse payment"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
