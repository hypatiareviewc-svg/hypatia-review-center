import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin-session";

/** GET /api/admin/applications — list all enrollments (admin only). */
export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const enrollments = await prisma.enrollmentApplication.findMany({
    orderBy: { submittedAt: "desc" },
  });

  const records = enrollments.map((e) => ({
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
  }));

  return NextResponse.json(records);
}
