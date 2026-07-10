import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin-session";
import { createPaymentSchema } from "@/lib/payment-schema";
import { DEFAULT_TUITION } from "@/lib/financial";

function formatStudentName(record: {
  lastName: string;
  firstName: string;
  middleName: string;
}) {
  return [record.lastName, record.firstName, record.middleName].filter(Boolean).join(", ");
}

function serializePayment(
  payment: Awaited<ReturnType<typeof prisma.payment.create>> & {
    enrollment: {
      applicationNumber: string;
      lastName: string;
      firstName: string;
      middleName: string;
    };
  },
) {
  return {
    id: payment.id,
    enrollmentId: payment.enrollmentId,
    applicationNumber: payment.enrollment.applicationNumber,
    studentName: formatStudentName(payment.enrollment),
    amount: Number(payment.amount),
    method: payment.method,
    reference: payment.reference,
    notes: payment.notes,
    recordedBy: payment.recordedBy,
    paidAt: payment.paidAt.toISOString(),
  };
}

/** POST /api/admin/payments — record a tuition payment (admin only). */
export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = createPaymentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid payment payload.", issues: result.error.flatten() },
        { status: 400 },
      );
    }

    const values = result.data;
    const enrollment = await prisma.enrollmentApplication.findUnique({
      where: { id: values.enrollmentId },
      select: {
        id: true,
        tuitionFee: true,
        amountPaid: true,
        applicationNumber: true,
        lastName: true,
        firstName: true,
        middleName: true,
      },
    });

    if (!enrollment) {
      return NextResponse.json({ message: "Enrollment not found." }, { status: 404 });
    }

    const tuition = enrollment.tuitionFee ? Number(enrollment.tuitionFee) : DEFAULT_TUITION;
    const currentPaid = enrollment.amountPaid ? Number(enrollment.amountPaid) : 0;
    const newPaid = currentPaid + values.amount;

    if (newPaid > tuition) {
      return NextResponse.json(
        {
          message: `Payment exceeds remaining balance. Maximum allowed: ₱${Math.max(tuition - currentPaid, 0).toLocaleString("en-PH")}.`,
        },
        { status: 400 },
      );
    }

    const payment = await prisma.$transaction(async (tx) => {
      const created = await tx.payment.create({
        data: {
          enrollmentId: values.enrollmentId,
          amount: values.amount,
          method: values.method,
          reference: values.reference,
          notes: values.notes,
          recordedBy: admin.name,
          paidAt: values.paidAt ? new Date(values.paidAt) : new Date(),
        },
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
      });

      await tx.enrollmentApplication.update({
        where: { id: values.enrollmentId },
        data: { amountPaid: newPaid },
      });

      return created;
    });

    return NextResponse.json({
      payment: serializePayment(payment),
      amountPaid: newPaid,
      balance: Math.max(tuition - newPaid, 0),
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("Record payment error:", detail);
    return NextResponse.json({ message: `Server error: ${detail}` }, { status: 500 });
  }
}
