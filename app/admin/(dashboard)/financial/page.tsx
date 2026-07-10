import { FinancialDashboard } from "@/components/admin/financial-dashboard";

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
      <FinancialDashboard />
    </div>
  );
}
