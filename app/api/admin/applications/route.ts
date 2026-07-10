import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin-session";
import { saveStudentPhoto } from "@/lib/save-student-photo";

function buildApplicationNumber() {
  const stamp = Date.now().toString().slice(-6);
  const suffix = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `HRC-APP-${stamp}-${suffix}`;
}

const createSchema = z.object({
  lastName: z.string().min(2, "Last name is required."),
  firstName: z.string().min(2, "First name is required."),
  middleName: z.string().min(1, "Middle name is required."),
  sex: z.enum(["Male", "Female"], { message: "Please select sex." }),
  birthday: z.string().min(1, "Birthday is required."),
  birthPlace: z.string().min(2, "Birth place is required."),
  street: z.string().min(2, "Street is required."),
  barangay: z.string().min(2, "Barangay is required."),
  cityMunicipality: z.string().min(2, "City/Municipality is required."),
  province: z.string().min(2, "Province is required."),
  zipcode: z.string().min(3, "Zip code is required."),
  email: z.string().email("Enter a valid email."),
  contactNumber: z.string().min(7, "Contact number is required."),
  schoolName: z.string().min(2, "School name is required."),
  schoolAddress: z.string().min(2, "School address is required."),
  yearGraduated: z.string().min(4, "Year graduated is required."),
  programCourse: z.string().min(2, "Program/Course is required."),
  guardianFullName: z.string().min(2, "Guardian name is required."),
  guardianAddress: z.string().min(2, "Guardian address is required."),
  guardianContactNumber: z.string().min(7, "Guardian contact is required."),
  status: z.enum(["PENDING", "REVIEWING", "APPROVED", "REJECTED"]).optional().default("PENDING"),
  tuitionFee: z.number().min(0).optional(),
  amountPaid: z.number().min(0).optional(),
  photoDataUrl: z.string().startsWith("data:image/").optional(),
  photoName: z.string().optional(),
});

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

/** POST /api/admin/applications — create a new enrollment (admin only). */
export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = createSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid payload.", issues: result.error.flatten() },
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
        return NextResponse.json(
          { message: "Failed to upload photo to Cloudinary." },
          { status: 400 },
        );
      }
    }

    const { photoDataUrl: _, ...data } = values;

    const application = await prisma.enrollmentApplication.create({
      data: {
        applicationNumber,
        photoName: values.photoName ?? undefined,
        photoUrl,
        lastName: data.lastName,
        firstName: data.firstName,
        middleName: data.middleName,
        sex: data.sex,
        birthday: data.birthday,
        birthPlace: data.birthPlace,
        street: data.street,
        barangay: data.barangay,
        cityMunicipality: data.cityMunicipality,
        province: data.province,
        zipcode: data.zipcode,
        email: data.email,
        contactNumber: data.contactNumber,
        schoolName: data.schoolName,
        schoolAddress: data.schoolAddress,
        yearGraduated: data.yearGraduated,
        programCourse: data.programCourse,
        guardianFullName: data.guardianFullName,
        guardianAddress: data.guardianAddress,
        guardianContactNumber: data.guardianContactNumber,
        status: data.status ?? "PENDING",
        tuitionFee: data.tuitionFee ?? undefined,
        amountPaid: data.amountPaid ?? undefined,
      },
    });

    return NextResponse.json({
      id: application.id,
      applicationNumber: application.applicationNumber,
      submittedAt: application.submittedAt,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("Admin create enrollment error:", detail);
    return NextResponse.json(
      { message: `Server error: ${detail}` },
      { status: 500 },
    );
  }
}
