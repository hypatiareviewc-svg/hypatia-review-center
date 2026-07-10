"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  Banknote,
  CheckCircle2,
  DollarSign,
  Download,
  Filter,
  Loader2,
  Plus,
  Search,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import {
  balanceStatusMeta,
  paymentMethodLabel,
  type BalanceStatus,
  type PaymentMethod,
} from "@/lib/financial";
import type { FinancialAccount, FinancialReport, PaymentRecord } from "@/lib/financial-stats";
import { FinancialCollectionChart } from "@/components/admin/financial-collection-chart";
import { RecordPaymentModal } from "@/components/admin/record-payment-modal";
import { SetTuitionModal } from "@/components/admin/set-tuition-modal";
import { StudentFinancialDrawer } from "@/components/admin/student-financial-drawer";
import { EnrollmentSkeleton } from "@/components/admin/enrollment-skeleton";

type Tab = "accounts" | "payments";
type BalanceFilter = "ALL" | BalanceStatus;

const BALANCE_FILTERS: { value: BalanceFilter; label: string }[] = [
  { value: "ALL", label: "All Balances" },
  { value: "PAID", label: "Fully Paid" },
  { value: "PARTIAL", label: "Partial" },
  { value: "UNPAID", label: "Unpaid" },
  { value: "NO_TUITION", label: "No Tuition Set" },
];

function formatPaymentDate(iso: string) {
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

export function FinancialDashboard() {
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("accounts");
  const [search, setSearch] = useState("");
  const [balanceFilter, setBalanceFilter] = useState<BalanceFilter>("ALL");

  // Record-payment modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [preselectedId, setPreselectedId] = useState<string | undefined>();

  // Set-tuition modal
  const [tuitionTarget, setTuitionTarget] = useState<FinancialAccount | null>(null);

  // Student financial drawer
  const [drawerAccount, setDrawerAccount] = useState<FinancialAccount | null>(null);

  // Reverse-payment confirm
  const [deleteTarget, setDeleteTarget] = useState<PaymentRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/financial");
      if (!res.ok) throw new Error("Failed to load financial data.");
      const data = (await res.json()) as FinancialReport;
      setReport(data);
      // keep drawer account in sync after refresh
      setDrawerAccount((prev) =>
        prev ? (data.accounts.find((a) => a.id === prev.id) ?? null) : null,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const filteredAccounts =
    report?.accounts.filter((a) => {
      if (balanceFilter !== "ALL" && a.balanceStatus !== balanceFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          a.studentName.toLowerCase().includes(q) ||
          a.applicationNumber.toLowerCase().includes(q) ||
          a.programCourse.toLowerCase().includes(q)
        );
      }
      return true;
    }) ?? [];

  const filteredPayments =
    report?.payments.filter((p) => {
      if (search) {
        const q = search.toLowerCase();
        return (
          p.studentName.toLowerCase().includes(q) ||
          p.applicationNumber.toLowerCase().includes(q) ||
          (p.reference?.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    }) ?? [];

  function openPaymentModal(accountId?: string) {
    setPreselectedId(accountId);
    setPaymentModalOpen(true);
  }

  function openDrawer(account: FinancialAccount) {
    setDrawerAccount(account);
  }

  function handleExport(type: "accounts" | "payments") {
    window.open(`/api/admin/financial/export?type=${type}`, "_blank");
  }

  async function handleDeletePayment() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/payments/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to reverse payment.");
      setDeleteTarget(null);
      fetchReport();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reverse payment.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <EnrollmentSkeleton />;

  if (!report) {
    return (
      <div className="surface-card flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <p className="mt-3 text-sm text-[var(--muted)]">{error ?? "Unable to load financial data."}</p>
      </div>
    );
  }

  const { summary } = report;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Tuition Assessed"
          value={formatCurrency(summary.totalTuitionAssessed)}
          subtitle={`${report.accounts.length} student accounts`}
          icon={<Wallet className="h-6 w-6" />}
          accent="navy"
        />
        <SummaryCard
          label="Total Collected"
          value={formatCurrency(summary.totalCollected)}
          subtitle={`${summary.collectionRate}% collection rate`}
          icon={<Banknote className="h-6 w-6" />}
          accent="emerald"
        />
        <SummaryCard
          label="Outstanding Balance"
          value={formatCurrency(summary.totalOutstanding)}
          subtitle={`${summary.unpaidCount + summary.partialCount} with balance due`}
          icon={<AlertCircle className="h-6 w-6" />}
          accent="red"
        />
        <SummaryCard
          label="Fully Paid"
          value={summary.fullyPaidCount.toString()}
          subtitle={`${summary.paymentCount} payments recorded`}
          icon={<CheckCircle2 className="h-6 w-6" />}
          accent="amber"
        />
      </div>

      {/* Chart */}
      <div className="surface-card rounded-2xl p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Monthly Collections</h2>
            <p className="text-xs text-[var(--muted)]">Payments received over the last 6 months</p>
          </div>
        </div>
        <FinancialCollectionChart data={report.monthlyCollections} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students, application no., reference…"
            className="focus-ring w-full rounded-full border border-[var(--border)] bg-[var(--background)] py-2 pl-10 pr-4 text-sm placeholder:text-[var(--muted)]/50"
          />
        </div>

        {tab === "accounts" ? (
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <select
              value={balanceFilter}
              onChange={(e) => setBalanceFilter(e.target.value as BalanceFilter)}
              className="focus-ring appearance-none rounded-full border border-[var(--border)] bg-[var(--background)] py-2 pl-10 pr-8 text-sm"
            >
              {BALANCE_FILTERS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="flex rounded-full border border-[var(--border)] bg-[var(--background)] p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab("accounts")}
            className={["rounded-full px-4 py-1.5 transition", tab === "accounts" ? "bg-[var(--primary)] text-[var(--primary-contrast)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"].join(" ")}
          >
            Student Accounts
          </button>
          <button
            type="button"
            onClick={() => setTab("payments")}
            className={["rounded-full px-4 py-1.5 transition", tab === "payments" ? "bg-[var(--primary)] text-[var(--primary-contrast)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"].join(" ")}
          >
            Payment History
          </button>
        </div>

        <button
          type="button"
          onClick={() => handleExport(tab === "accounts" ? "accounts" : "payments")}
          className="focus-ring inline-flex h-9 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)] px-4 text-xs font-semibold text-[var(--foreground)]"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>

        <button
          type="button"
          onClick={() => openPaymentModal()}
          className="focus-ring ml-auto inline-flex h-9 items-center gap-2 rounded-full bg-[var(--primary)] px-4 text-xs font-semibold text-[var(--primary-contrast)]"
        >
          <Plus className="h-4 w-4" />
          Record Payment
        </button>
      </div>

      {error ? (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
          <button type="button" onClick={() => setError(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {/* Tables */}
      <AnimatePresence mode="wait">
        {tab === "accounts" ? (
          <motion.div key="accounts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {filteredAccounts.length === 0 ? (
              <EmptyState message="No student accounts match your filters." />
            ) : (
              <div className="surface-card hidden overflow-hidden rounded-2xl md:block">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)]">
                        <th className="px-5 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Student</th>
                        <th className="px-5 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Program</th>
                        <th className="px-5 py-3 text-right text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Tuition</th>
                        <th className="px-5 py-3 text-right text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Paid</th>
                        <th className="px-5 py-3 text-right text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Balance</th>
                        <th className="px-5 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Status</th>
                        <th className="px-5 py-3 text-right text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {filteredAccounts.map((a) => (
                        <tr
                          key={a.id}
                          className="cursor-pointer transition hover:bg-[var(--surface-soft)]"
                          onClick={() => openDrawer(a)}
                        >
                          <td className="px-5 py-3">
                            <p className="font-medium text-[var(--foreground)]">{a.studentName}</p>
                            <p className="text-xs text-[var(--muted)]">{a.applicationNumber}</p>
                          </td>
                          <td className="px-5 py-3 text-[var(--muted)]">{a.programCourse}</td>
                          <td className="px-5 py-3 text-right">{formatCurrency(a.tuitionFee)}</td>
                          <td className="px-5 py-3 text-right text-emerald-600">{formatCurrency(a.amountPaid)}</td>
                          <td className="px-5 py-3 text-right font-medium text-red-600">{formatCurrency(a.balance)}</td>
                          <td className="px-5 py-3">
                            <span className={["rounded-full border px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em]", balanceStatusMeta[a.balanceStatus].className].join(" ")}>
                              {balanceStatusMeta[a.balanceStatus].label}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                            {a.balanceStatus === "NO_TUITION" ? (
                              <button
                                type="button"
                                onClick={() => setTuitionTarget(a)}
                                className="focus-ring inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface-soft)]"
                              >
                                <DollarSign className="h-3.5 w-3.5" />
                                Set Tuition
                              </button>
                            ) : a.balance > 0 && a.status !== "REJECTED" ? (
                              <button
                                type="button"
                                onClick={() => openPaymentModal(a.id)}
                                className="focus-ring inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface-soft)]"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                Pay
                              </button>
                            ) : (
                              <span className="text-xs text-[var(--muted)]">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Mobile account cards */}
            <div className="space-y-3 md:hidden">
              {filteredAccounts.map((a) => (
                <div
                  key={a.id}
                  className="surface-card cursor-pointer rounded-2xl p-4"
                  onClick={() => openDrawer(a)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">{a.studentName}</p>
                      <p className="text-xs text-[var(--muted)]">{a.applicationNumber}</p>
                    </div>
                    <span className={["shrink-0 rounded-full border px-2 py-0.5 text-[0.58rem] font-semibold uppercase", balanceStatusMeta[a.balanceStatus].className].join(" ")}>
                      {balanceStatusMeta[a.balanceStatus].label}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-[var(--surface-soft)] px-2 py-2">
                      <p className="text-[var(--muted)]">Tuition</p>
                      <p className="mt-0.5 font-semibold">{formatCurrency(a.tuitionFee)}</p>
                    </div>
                    <div className="rounded-lg bg-[var(--surface-soft)] px-2 py-2">
                      <p className="text-[var(--muted)]">Paid</p>
                      <p className="mt-0.5 font-semibold text-emerald-600">{formatCurrency(a.amountPaid)}</p>
                    </div>
                    <div className="rounded-lg bg-[var(--surface-soft)] px-2 py-2">
                      <p className="text-[var(--muted)]">Balance</p>
                      <p className="mt-0.5 font-semibold text-red-600">{formatCurrency(a.balance)}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                    {a.balanceStatus === "NO_TUITION" ? (
                      <button
                        type="button"
                        onClick={() => setTuitionTarget(a)}
                        className="focus-ring inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--background)] py-2 text-xs font-medium"
                      >
                        <DollarSign className="h-3.5 w-3.5" />
                        Set Tuition
                      </button>
                    ) : a.balance > 0 && a.status !== "REJECTED" ? (
                      <button
                        type="button"
                        onClick={() => openPaymentModal(a.id)}
                        className="focus-ring inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--background)] py-2 text-xs font-medium"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Record Payment
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (

          <motion.div key="payments" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {filteredPayments.length === 0 ? (
              <EmptyState message="No payments recorded yet." />
            ) : (
              <div className="surface-card hidden overflow-hidden rounded-2xl md:block">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)]">
                        <th className="px-5 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Date</th>
                        <th className="px-5 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Student</th>
                        <th className="px-5 py-3 text-right text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Amount</th>
                        <th className="px-5 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Method</th>
                        <th className="px-5 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Reference</th>
                        <th className="px-5 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Recorded By</th>
                        <th className="px-5 py-3 text-right text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {filteredPayments.map((p) => (
                        <tr key={p.id} className="transition hover:bg-[var(--surface-soft)]">
                          <td className="px-5 py-3 text-[var(--muted)]">{formatPaymentDate(p.paidAt)}</td>
                          <td className="px-5 py-3">
                            <p className="font-medium text-[var(--foreground)]">{p.studentName}</p>
                            <p className="text-xs text-[var(--muted)]">{p.applicationNumber}</p>
                          </td>
                          <td className="px-5 py-3 text-right font-medium text-emerald-600">{formatCurrency(p.amount)}</td>
                          <td className="px-5 py-3 text-[var(--muted)]">{paymentMethodLabel(p.method as PaymentMethod)}</td>
                          <td className="px-5 py-3 text-[var(--muted)]">{p.reference ?? "—"}</td>
                          <td className="px-5 py-3 text-[var(--muted)]">{p.recordedBy ?? "—"}</td>
                          <td className="px-5 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(p)}
                              className="focus-ring inline-flex h-8 items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 text-xs font-medium text-red-600 hover:bg-red-100"
                              title="Reverse payment"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Mobile payment cards */}
            <div className="space-y-3 md:hidden">
              {filteredPayments.map((p) => (
                <div key={p.id} className="surface-card rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">{p.studentName}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {formatPaymentDate(p.paidAt)} · {paymentMethodLabel(p.method as PaymentMethod)}
                      </p>
                    </div>
                    <p className="font-semibold text-emerald-600">{formatCurrency(p.amount)}</p>
                  </div>
                  {p.reference ? (
                    <p className="mt-2 text-xs text-[var(--muted)]">Ref: {p.reference}</p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(p)}
                    className="focus-ring mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Reverse
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Student financial drawer */}
      <StudentFinancialDrawer
        open={drawerAccount !== null}
        account={drawerAccount}
        payments={report.payments}
        onClose={() => setDrawerAccount(null)}
        onRecordPayment={(id) => {
          setDrawerAccount(null);
          openPaymentModal(id);
        }}
        onSetTuition={(account) => {
          setDrawerAccount(null);
          setTuitionTarget(account);
        }}
        onReversePayment={(payment) => {
          setDrawerAccount(null);
          setDeleteTarget(payment);
        }}
      />

      {/* Record payment modal */}
      <RecordPaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        accounts={report.accounts}
        preselectedId={preselectedId}
        onRecorded={fetchReport}
      />

      {/* Set tuition modal */}
      <SetTuitionModal
        open={tuitionTarget !== null}
        onClose={() => setTuitionTarget(null)}
        account={tuitionTarget}
        onSaved={fetchReport}
      />

      {/* Reverse payment confirmation */}
      <AnimatePresence>
        {deleteTarget ? (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center p-4"
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
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mt-4 text-center font-serif text-lg font-bold text-[var(--foreground)]">
                Reverse Payment
              </h3>
              <p className="mt-2 text-center text-sm text-[var(--muted)]">
                Reverse the {formatCurrency(deleteTarget.amount)} payment for{" "}
                <strong className="text-[var(--foreground)]">{deleteTarget.studentName}</strong>?
                The student balance will be updated.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="focus-ring flex-1 rounded-full border border-[var(--border)] bg-[var(--background)] py-2.5 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeletePayment}
                  disabled={deleting}
                  className="focus-ring flex flex-1 items-center justify-center gap-2 rounded-full bg-red-600 py-2.5 text-sm font-semibold text-white disabled:opacity-80"
                >
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  {deleting ? "Reversing…" : "Reverse"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  subtitle,
  icon,
  accent,
}: {
  label: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  accent: "emerald" | "navy" | "amber" | "red";
}) {
  const accentMap = {
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-100" },
    navy: { bg: "bg-[var(--surface-soft)]", text: "text-[var(--primary)]", ring: "ring-[var(--ring)]" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-100" },
    red: { bg: "bg-red-50", text: "text-red-600", ring: "ring-red-100" },
  };
  const a = accentMap[accent];

  return (
    <div className="surface-card rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            {label}
          </p>
          <p className="mt-2 truncate text-2xl font-bold text-[var(--foreground)]">{value}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">{subtitle}</p>
        </div>
        <div className={["flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1", a.bg, a.text, a.ring].join(" ")}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="surface-card flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center">
      <Wallet className="h-8 w-8 text-[var(--primary)]" />
      <p className="mt-3 text-sm text-[var(--muted)]">{message}</p>
    </div>
  );
}
