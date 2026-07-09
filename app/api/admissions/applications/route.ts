import { NextResponse } from "next/server";
import { z } from "zod";
import { admissionsSchema } from "@/lib/admissions-schema";
import { prisma } from "@/lib/prisma";
import { saveStudentPhoto } from "@/lib/save-student-photo";

const applicationSchema = admissionsSchema.extend({
  photoDataUrl: z.string().startsWith("data:image/").optional(),
});

function buildApplicationNumber() {
  const stamp = Date.now().toString().slice(-6);
  const suffix = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `HRC-APP-${stamp}-${suffix}`;
}

export async function GET() {
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
    submittedAt: e.submittedAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }));

  return NextResponse.json(records);
}

export async function POST(request: Request) {
  const payload = await request.json();
  const result = applicationSchema.safeParse(payload);

  if (!result.success) {
    return NextResponse.json(
      { message: "Invalid application payload.", issues: result.error.flatten() },
      { status: 400 },
    );
  }

  const values = result.data;
  const applicationNumber = buildApplicationNumber();
  let photoUrl: string | undefined;

  if (values.photoDataUrl) {
    try {
      photoUrl = await saveStudentPhoto(applicationNumber, values.photoDataUrl);
    } catch {
      return NextResponse.json({ message: "Unable to save student photo." }, { status: 400 });
    }
  }

  const application = await prisma.enrollmentApplication.create({
    data: {
      applicationNumber,
      photoName: values.photo?.[0]?.name ?? undefined,
      photoUrl,
      lastName: values.lastName,
      firstName: values.firstName,
      middleName: values.middleName,
      street: values.street,
      barangay: values.barangay,
      cityMunicipality: values.cityMunicipality,
      province: values.province,
      zipcode: values.zipcode,
      email: values.email,
      contactNumber: values.contactNumber,
      schoolName: values.schoolName,
      schoolAddress: values.schoolAddress,
      yearGraduated: values.yearGraduated,
      programCourse: values.programCourse,
      guardianFullName: values.guardianFullName,
      guardianAddress: values.guardianAddress,
      guardianContactNumber: values.guardianContactNumber,
    },
  });

  return NextResponse.json({
    id: application.id,
    applicationNumber: application.applicationNumber,
    submittedAt: application.submittedAt,
  });
}
