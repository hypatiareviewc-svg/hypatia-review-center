import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin-session";
import { adminUpdateSchema } from "@/lib/admin-enrollment-schema";

type RouteParams = { params: Promise<{ id: string }> };

function serialize(e: Awaited<ReturnType<typeof prisma.enrollmentApplication.findUnique>>) {
  if (!e) return null;
  return {
    id: e.id,
    applicationNumber: e.applicationNumber,
    photoName: e.photoName,
    photoUrl: e.photoUrl,
    lastName: e.lastName,
    firstName: e.firstName,
    middleName: e.middleName,
    sex: e.sex,
    birthday: e.birthday,
    birthPlace: e.birthPlace,
    street: e.street,
    barangay: e.barangay,
    cityMunicipality: e.cityMunicipality,
    province: e.province,
    zipcode: e.zipcode,
    email: e.email,
    contactNumber: e.contactNumber,
    schoolName: e.schoolName,
    schoolAddress: e.schoolAddress,
    yearGraduated: e.yearGraduated,
    programCourse: e.programCourse,
    guardianFullName: e.guardianFullName,
    guardianAddress: e.guardianAddress,
    guardianContactNumber: e.guardianContactNumber,
    status: e.status,
    tuitionFee: e.tuitionFee ? e.tuitionFee.toString() : null,
    amountPaid: e.amountPaid ? e.amountPaid.toString() : null,
    submittedAt: e.submittedAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  };
}

/** GET /api/admin/applications/[id] — single enrollment (admin only). */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const enrollment = await prisma.enrollmentApplication.findUnique({ where: { id } });

  if (!enrollment) {
    return NextResponse.json({ message: "Enrollment not found." }, { status: 404 });
  }

  return NextResponse.json(serialize(enrollment));
}

/** PATCH /api/admin/applications/[id] — update enrollment (admin only). */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const result = adminUpdateSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { message: "Invalid update payload.", issues: result.error.flatten() },
      { status: 400 },
    );
  }

  const exists = await prisma.enrollmentApplication.findUnique({ where: { id }, select: { id: true } });

  if (!exists) {
    return NextResponse.json({ message: "Enrollment not found." }, { status: 404 });
  }

  const updated = await prisma.enrollmentApplication.update({
    where: { id },
    data: result.data,
  });

  return NextResponse.json(serialize(updated));
}

/** DELETE /api/admin/applications/[id] — delete enrollment (admin only). */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const exists = await prisma.enrollmentApplication.findUnique({ where: { id }, select: { id: true } });

  if (!exists) {
    return NextResponse.json({ message: "Enrollment not found." }, { status: 404 });
  }

  await prisma.enrollmentApplication.delete({ where: { id } });

  return NextResponse.json({ message: "Enrollment deleted." });
}
