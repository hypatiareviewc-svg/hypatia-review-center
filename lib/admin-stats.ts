import { prisma } from "@/lib/prisma";
export { formatCurrency } from "@/lib/format";

export type DashboardStats = {
  totalEnrolled: number;
  totalCollected: number;
  totalPending: number;
  totalOutstanding: number;
  studentTrend: { label: string; enrolled: number; pending: number }[];
  financeTrend: { label: string; collected: number; outstanding: number }[];
};

/** Default tuition fee when an enrollment has none assigned. */
const DEFAULT_TUITION = 15000;

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat("en", { month: "short" }).format(d);
}

/** Build the last N month keys ending at the current month. */
function lastNMonths(n: number): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(monthKey(d));
  }
  return keys;
}

/**
 * Aggregate all dashboard stats from enrollment records.
 * Runs on the server (route handler / server component).
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const enrollments = await prisma.enrollmentApplication.findMany({
    select: {
      status: true,
      tuitionFee: true,
      amountPaid: true,
      submittedAt: true,
    },
  });

  const totalEnrolled = enrollments.filter((e) => e.status === "APPROVED").length;
  const totalPending = enrollments.filter(
    (e) => e.status === "PENDING" || e.status === "REVIEWING",
  ).length;

  let totalCollected = 0;
  let totalOutstanding = 0;

  // Per-month buckets for trend graphs
  const months = lastNMonths(6);
  const studentByMonth = new Map<string, { enrolled: number; pending: number }>();
  const financeByMonth = new Map<string, { collected: number; outstanding: number }>();

  for (const key of months) {
    studentByMonth.set(key, { enrolled: 0, pending: 0 });
    financeByMonth.set(key, { collected: 0, outstanding: 0 });
  }

  for (const e of enrollments) {
    const tuition = e.tuitionFee ? Number(e.tuitionFee) : DEFAULT_TUITION;
    const paid = e.amountPaid ? Number(e.amountPaid) : 0;
    const balance = Math.max(tuition - paid, 0);

    totalCollected += paid;
    totalOutstanding += balance;

    const key = monthKey(e.submittedAt);
    const studentBucket = studentByMonth.get(key);
    const financeBucket = financeByMonth.get(key);

    if (studentBucket) {
      if (e.status === "APPROVED") studentBucket.enrolled += 1;
      else if (e.status === "PENDING" || e.status === "REVIEWING")
        studentBucket.pending += 1;
    }
    if (financeBucket) {
      financeBucket.collected += paid;
      financeBucket.outstanding += balance;
    }
  }

  return {
    totalEnrolled,
    totalCollected,
    totalPending,
    totalOutstanding,
    studentTrend: months.map((key) => ({
      label: monthLabel(key),
      enrolled: studentByMonth.get(key)?.enrolled ?? 0,
      pending: studentByMonth.get(key)?.pending ?? 0,
    })),
    financeTrend: months.map((key) => ({
      label: monthLabel(key),
      collected: financeByMonth.get(key)?.collected ?? 0,
      outstanding: financeByMonth.get(key)?.outstanding ?? 0,
    })),
  };
}

export function formatCurrencyLocal(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
}
