import { getPrismaClient } from "@/lib/prisma";
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

// Raw row types coming back from $queryRaw
type RawPayment = {
  id: string;
  enrollmentId: string;
  amount: string | number;
  method: string;
  reference: string | null;
  notes: string | null;
  recordedBy: string | null;
  paidAt: Date;
  applicationNumber: string;
  lastName: string;
  firstName: string;
  middleName: string;
};

type RawLastPayment = {
  enrollmentId: string;
  paidAt: Date;
};

export async function getFinancialReport(): Promise<FinancialReport> {
  const prisma = getPrismaClient();

  // Fetch enrollments — no `payments` relation select (stale client doesn't know it)
  const enrollments = await prisma.enrollmentApplication.findMany({
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
    },
  });

  // Fetch payments via raw SQL — works even with a stale generated client
  const [rawPayments, rawLastPayments] = await Promise.all([
    prisma.$queryRaw<RawPayment[]>`
      SELECT
        p.id,
        p."enrollmentId",
        p.amount,
        p.method,
        p.reference,
        p.notes,
        p."recordedBy",
        p."paidAt",
        e."applicationNumber",
        e."lastName",
        e."firstName",
        e."middleName"
      FROM "Payment" p
      JOIN "EnrollmentApplication" e ON e.id = p."enrollmentId"
      ORDER BY p."paidAt" DESC
    `,
    prisma.$queryRaw<RawLastPayment[]>`
      SELECT DISTINCT ON ("enrollmentId")
        "enrollmentId",
        "paidAt"
      FROM "Payment"
      ORDER BY "enrollmentId", "paidAt" DESC
    `,
  ]);

  // Build a map of enrollmentId -> lastPaymentAt for O(1) lookup
  const lastPaymentMap = new Map<string, Date>();
  for (const row of rawLastPayments) {
    lastPaymentMap.set(row.enrollmentId, row.paidAt);
  }

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
    const balanceStatus = getBalanceStatus(
      e.tuitionFee?.toString() ?? null,
      amountPaid,
      hasExplicitTuition,
    );

    totalTuitionAssessed += tuitionFee;
    totalCollected += amountPaid;
    totalOutstanding += balance;

    if (balanceStatus === "PAID") fullyPaidCount += 1;
    else if (balanceStatus === "PARTIAL") partialCount += 1;
    else if (balanceStatus === "UNPAID") unpaidCount += 1;

    const lastPaidAt = lastPaymentMap.get(e.id);

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
      lastPaymentAt: lastPaidAt ? lastPaidAt.toISOString() : null,
    };
  });

  const paymentRecords: PaymentRecord[] = rawPayments.map((p) => ({
    id: p.id,
    enrollmentId: p.enrollmentId,
    applicationNumber: p.applicationNumber,
    studentName: formatStudentName(p),
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

  for (const p of rawPayments) {
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
      paymentCount: rawPayments.length,
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
