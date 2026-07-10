import { prisma } from "@/lib/prisma";
import { DEFAULT_TUITION, getBalance, getBalanceStatus } from "@/lib/financial";

export type FinancialAccount = {
  id: string;
  applicationNumber: string;
  studentName: string;
  programCourse: string;
  status: string;
  tuitionFee: number;
  amountPaid: number;
  balance: number;
  balanceStatus: ReturnType<typeof getBalanceStatus>;
  hasExplicitTuition: boolean;
  lastPaymentAt: string | null;
};

export type PaymentRecord = {
  id: string;
  enrollmentId: string;
  applicationNumber: string;
  studentName: string;
  amount: number;
  method: string;
  reference: string | null;
  notes: string | null;
  recordedBy: string | null;
  paidAt: string;
};

export type FinancialSummary = {
  totalTuitionAssessed: number;
  totalCollected: number;
  totalOutstanding: number;
  fullyPaidCount: number;
  partialCount: number;
  unpaidCount: number;
  paymentCount: number;
  collectionRate: number;
};

export type FinancialReport = {
  summary: FinancialSummary;
  accounts: FinancialAccount[];
  payments: PaymentRecord[];
  monthlyCollections: { label: string; collected: number }[];
};

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat("en", { month: "short", year: "2-digit" }).format(d);
}

function lastNMonths(n: number): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(monthKey(d));
  }
  return keys;
}

function formatStudentName(record: {
  lastName: string;
  firstName: string;
  middleName: string;
}) {
  return [record.lastName, record.firstName, record.middleName].filter(Boolean).join(", ");
}

export async function getFinancialReport(): Promise<FinancialReport> {
  const [enrollments, payments] = await Promise.all([
    prisma.enrollmentApplication.findMany({
      orderBy: { submittedAt: "desc" },
      select: {
        id: true,
        applicationNumber: true,
        lastName: true,
        firstName: true,
        middleName: true,
        programCourse: true,
        status: true,
        tuitionFee: true,
        amountPaid: true,
        payments: {
          orderBy: { paidAt: "desc" },
          take: 1,
          select: { paidAt: true },
        },
      },
    }),
    prisma.payment.findMany({
      orderBy: { paidAt: "desc" },
      include: {
        enrollment: {
          select: {
            applicationNumber: true,
            lastName: true,
            firstName: true,
            middleName: true,
          },
        },
      },
    }),
  ]);

  let totalTuitionAssessed = 0;
  let totalCollected = 0;
  let totalOutstanding = 0;
  let fullyPaidCount = 0;
  let partialCount = 0;
  let unpaidCount = 0;

  const accounts: FinancialAccount[] = enrollments.map((e) => {
    const hasExplicitTuition = e.tuitionFee !== null;
    const tuitionFee = e.tuitionFee ? Number(e.tuitionFee) : DEFAULT_TUITION;
    const amountPaid = e.amountPaid ? Number(e.amountPaid) : 0;
    const balance = getBalance(tuitionFee, amountPaid);
    const balanceStatus = getBalanceStatus(e.tuitionFee?.toString() ?? null, amountPaid, hasExplicitTuition);

    totalTuitionAssessed += tuitionFee;
    totalCollected += amountPaid;
    totalOutstanding += balance;

    if (balanceStatus === "PAID") fullyPaidCount += 1;
    else if (balanceStatus === "PARTIAL") partialCount += 1;
    else if (balanceStatus === "UNPAID") unpaidCount += 1;

    return {
      id: e.id,
      applicationNumber: e.applicationNumber,
      studentName: formatStudentName(e),
      programCourse: e.programCourse,
      status: e.status,
      tuitionFee,
      amountPaid,
      balance,
      balanceStatus,
      hasExplicitTuition,
      lastPaymentAt: e.payments[0]?.paidAt.toISOString() ?? null,
    };
  });

  const paymentRecords: PaymentRecord[] = payments.map((p) => ({
    id: p.id,
    enrollmentId: p.enrollmentId,
    applicationNumber: p.enrollment.applicationNumber,
    studentName: formatStudentName(p.enrollment),
    amount: Number(p.amount),
    method: p.method,
    reference: p.reference,
    notes: p.notes,
    recordedBy: p.recordedBy,
    paidAt: p.paidAt.toISOString(),
  }));

  const months = lastNMonths(6);
  const monthlyMap = new Map<string, number>();
  for (const key of months) monthlyMap.set(key, 0);

  for (const p of payments) {
    const key = monthKey(p.paidAt);
    if (monthlyMap.has(key)) {
      monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + Number(p.amount));
    }
  }

  const collectionRate =
    totalTuitionAssessed > 0
      ? Math.round((totalCollected / totalTuitionAssessed) * 100)
      : 0;

  return {
    summary: {
      totalTuitionAssessed,
      totalCollected,
      totalOutstanding,
      fullyPaidCount,
      partialCount,
      unpaidCount,
      paymentCount: payments.length,
      collectionRate,
    },
    accounts,
    payments: paymentRecords,
    monthlyCollections: months.map((key) => ({
      label: monthLabel(key),
      collected: monthlyMap.get(key) ?? 0,
    })),
  };
}
