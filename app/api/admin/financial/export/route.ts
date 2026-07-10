import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-session";
import { getFinancialReport } from "@/lib/financial-stats";
import { balanceStatusMeta, paymentMethodLabel } from "@/lib/financial";
import { formatCurrency } from "@/lib/format";

function csvEscape(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? "" : String(value);
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/** GET /api/admin/financial/export — CSV export (admin only). */
export async function GET(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const type = request.nextUrl.searchParams.get("type") ?? "accounts";
  const report = await getFinancialReport();
  const stamp = new Date().toISOString().slice(0, 10);

  if (type === "payments") {
    const header = [
      "Date",
      "Application No.",
      "Student",
      "Amount",
      "Method",
      "Reference",
      "Notes",
      "Recorded By",
    ].join(",");

    const rows = report.payments.map((p) =>
      [
        new Date(p.paidAt).toLocaleDateString("en-PH"),
        p.applicationNumber,
        p.studentName,
        p.amount,
        paymentMethodLabel(p.method as Parameters<typeof paymentMethodLabel>[0]),
        p.reference,
        p.notes,
        p.recordedBy,
      ]
        .map(csvEscape)
        .join(","),
    );

    const csv = [header, ...rows].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="hypatia-payments-${stamp}.csv"`,
      },
    });
  }

  const header = [
    "Application No.",
    "Student",
    "Program",
    "Status",
    "Tuition Fee",
    "Amount Paid",
    "Balance",
    "Payment Status",
    "Last Payment",
  ].join(",");

  const rows = report.accounts.map((a) =>
    [
      a.applicationNumber,
      a.studentName,
      a.programCourse,
      a.status,
      a.tuitionFee,
      a.amountPaid,
      a.balance,
      balanceStatusMeta[a.balanceStatus].label,
      a.lastPaymentAt ? new Date(a.lastPaymentAt).toLocaleDateString("en-PH") : "",
    ]
      .map(csvEscape)
      .join(","),
  );

  const summary = [
    "",
    "Summary",
    `Total Tuition Assessed,${formatCurrency(report.summary.totalTuitionAssessed)}`,
    `Total Collected,${formatCurrency(report.summary.totalCollected)}`,
    `Outstanding Balance,${formatCurrency(report.summary.totalOutstanding)}`,
    `Collection Rate,${report.summary.collectionRate}%`,
  ].join("\n");

  const csv = [header, ...rows, summary].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="hypatia-financial-accounts-${stamp}.csv"`,
    },
  });
}
