import Link from "next/link";
import {
  GraduationCap,
  Wallet,
  Clock,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { getDashboardStats, formatCurrency } from "@/lib/admin-stats";
import { StudentTrendChart, FinanceTrendChart } from "@/components/admin/dashboard-charts";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-[var(--primary)] sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Overview of enrollments, finances, and application activity.
        </p>
      </div>

      {/* Stat boxes */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatBox
          label="Total Enrolled"
          value={stats.totalEnrolled.toString()}
          subtitle="Approved students"
          icon={<GraduationCap className="h-6 w-6" />}
          accent="emerald"
        />
        <StatBox
          label="Total Collected"
          value={formatCurrency(stats.totalCollected)}
          subtitle="Review tuition paid"
          icon={<Wallet className="h-6 w-6" />}
          accent="navy"
        />
        <StatBox
          label="Pending Approval"
          value={stats.totalPending.toString()}
          subtitle="Awaiting review"
          icon={<Clock className="h-6 w-6" />}
          accent="amber"
        />
        <StatBox
          label="Outstanding Balance"
          value={formatCurrency(stats.totalOutstanding)}
          subtitle="Remaining tuition"
          icon={<AlertCircle className="h-6 w-6" />}
          accent="red"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Student trend */}
        <div className="surface-card rounded-2xl p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)]">
                Student Enrollment Trend
              </h2>
              <p className="text-xs text-[var(--muted)]">
                Enrolled vs. pending — last 6 months
              </p>
            </div>
          </div>
          <StudentTrendChart data={stats.studentTrend} />
        </div>

        {/* Finance trend */}
        <div className="surface-card rounded-2xl p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)]">
                Finances — Collected vs. Balance
              </h2>
              <p className="text-xs text-[var(--muted)]">
                Money collected and remaining — last 6 months
              </p>
            </div>
          </div>
          <FinanceTrendChart data={stats.financeTrend} />
        </div>
      </div>

      {/* Quick actions */}
      <div className="surface-card rounded-2xl p-5 sm:p-6">
        <h2 className="mb-4 text-sm font-semibold text-[var(--foreground)]">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/enrollments"
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-contrast)] transition hover:opacity-95"
          >
            Manage Enrollments
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/admin/financial"
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--secondary)]"
          >
            View Financial Reports
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatBox({
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
          <p className="mt-2 truncate text-2xl font-bold text-[var(--foreground)]">
            {value}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">{subtitle}</p>
        </div>
        <div className={["flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1", a.bg, a.text, a.ring].join(" ")}>
          {icon}
        </div>
      </div>
    </div>
  );
}
