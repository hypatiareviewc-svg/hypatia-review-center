import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin-session";
import { DEFAULT_TUITION } from "@/lib/financial";

type RouteParams = { params: Promise<{ id: string }> };

type RawPayment = {
  id: string;
  enrollmentId: string;
  amount: string | number;
  tuitionFee: string | number | null;
  amountPaid: string | number | null;
};

/** DELETE /api/admin/payments/[id] — reverse a payment (admin only). */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const prisma = getPrismaClient();

  const [payment] = await prisma.$queryRaw<RawPayment[]>`
    SELECT
      p.id,
      p."enrollmentId",
      p.amount,
      e."tuitionFee",
      e."amountPaid"
    FROM "Payment" p
    JOIN "EnrollmentApplication" e ON e.id = p."enrollmentId"
    WHERE p.id = ${id}
    LIMIT 1
  `;

  if (!payment) {
    return NextResponse.json({ message: "Payment not found." }, { status: 404 });
  }

  const currentPaid = payment.amountPaid ? Number(payment.amountPaid) : 0;
  const newPaid = Math.max(currentPaid - Number(payment.amount), 0);
  const tuition = payment.tuitionFee ? Number(payment.tuitionFee) : DEFAULT_TUITION;

  await prisma.$transaction([
    prisma.$executeRaw`DELETE FROM "Payment" WHERE id = ${id}`,
    prisma.enrollmentApplication.update({
      where: { id: payment.enrollmentId },
      data: { amountPaid: newPaid },
    }),
  ]);

  return NextResponse.json({
    message: "Payment reversed.",
    amountPaid: newPaid,
    balance: Math.max(tuition - newPaid, 0),
  });
}
