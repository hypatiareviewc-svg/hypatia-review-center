import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin-session";
import { DEFAULT_TUITION } from "@/lib/financial";

type RouteParams = { params: Promise<{ id: string }> };

/** DELETE /api/admin/payments/[id] — reverse a payment (admin only). */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const payment = await prisma.payment.findUnique({
    where: { id },
    select: {
      id: true,
      amount: true,
      enrollmentId: true,
      enrollment: {
        select: { amountPaid: true, tuitionFee: true },
      },
    },
  });

  if (!payment) {
    return NextResponse.json({ message: "Payment not found." }, { status: 404 });
  }

  const currentPaid = payment.enrollment.amountPaid ? Number(payment.enrollment.amountPaid) : 0;
  const newPaid = Math.max(currentPaid - Number(payment.amount), 0);
  const tuition = payment.enrollment.tuitionFee
    ? Number(payment.enrollment.tuitionFee)
    : DEFAULT_TUITION;

  await prisma.$transaction([
    prisma.payment.delete({ where: { id } }),
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
