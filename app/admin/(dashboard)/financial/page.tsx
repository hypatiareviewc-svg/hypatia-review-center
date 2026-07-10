import { Wallet } from "lucide-react";

export default function FinancialPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-[var(--primary)] sm:text-3xl">
          Financial Account
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Track tuition payments, balances, and financial reports.
        </p>
      </div>
      <div className="surface-card flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--primary)]">
          <Wallet className="h-7 w-7" />
        </div>
        <h2 className="mt-4 font-serif text-xl font-semibold text-[var(--foreground)]">
          Financial Reports
        </h2>
        <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
          Detailed payment tracking, balance summaries, and exportable financial
          reports are coming next.
        </p>
      </div>
    </div>
  );
}
