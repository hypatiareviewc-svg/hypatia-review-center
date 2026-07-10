import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { freshPrismaClient } from "@/lib/prisma";

const scanSchema = z.object({
  applicationNumber: z.string().min(1),
  sessionId: z.string().min(1),
});

/**
 * POST /api/attendance/scan
 * Public endpoint — called by the QR scanner page.
 * Looks up the student, records attendance if not already done, returns student info.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = scanSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ message: "Invalid scan data." }, { status: 400 });
  }

  const { applicationNumber, sessionId } = result.data;
  const db = freshPrismaClient();

  // 1. Look up student
  const student = await db.enrollmentApplication.findUnique({
    where: { applicationNumber },
    select: {
      id: true,
      applicationNumber: true,
      firstName: true,
      lastName: true,
      middleName: true,
      programCourse: true,
      photoUrl: true,
      status: true,
    },
  });

  if (!student) {
    return NextResponse.json({ message: "Student not found." }, { status: 404 });
  }

  if (student.status !== "APPROVED") {
    return NextResponse.json({ message: "Student is not enrolled." }, { status: 403 });
  }

  // 2. Check session exists
  const session = await (db as any).attendanceSession.findUnique({
    where: { id: sessionId },
    select: { id: true, title: true },
  });
  if (!session) {
    return NextResponse.json({ message: "Session not found." }, { status: 404 });
  }

  const studentName = [student.lastName, student.firstName, student.middleName]
    .filter(Boolean)
    .join(", ");

  // 3. Check if already recorded (unique constraint sessionId + enrollmentId)
  const existing = await (db as any).attendanceRecord.findUnique({
    where: { sessionId_enrollmentId: { sessionId, enrollmentId: student.id } },
    select: { scannedAt: true },
  });

  if (existing) {
    return NextResponse.json({
      alreadyRecorded: existing.scannedAt.toISOString(),
      enrollmentId: student.id,
      applicationNumber: student.applicationNumber,
      studentName,
      programCourse: student.programCourse,
      photoUrl: student.photoUrl,
      sessionTitle: session.title,
    });
  }

  // 4. Record attendance
  const record = await (db as any).attendanceRecord.create({
    data: {
      sessionId,
      enrollmentId: student.id,
      applicationNumber: student.applicationNumber,
      studentName,
      programCourse: student.programCourse,
      photoUrl: student.photoUrl,
    },
  });

  return NextResponse.json({
    alreadyRecorded: null,
    enrollmentId: student.id,
    applicationNumber: student.applicationNumber,
    studentName,
    programCourse: student.programCourse,
    photoUrl: student.photoUrl,
    sessionTitle: session.title,
    scannedAt: record.scannedAt.toISOString(),
  });
}

/**
 * GET /api/attendance/scan?sessionId=xxx
 * Returns active sessions list for the scanner page to select from.
 */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  const db = freshPrismaClient();

  if (sessionId) {
    const session = await (db as any).attendanceSession.findUnique({
      where: { id: sessionId },
      select: { id: true, title: true, description: true, sessionDate: true },
    });
    if (!session) return NextResponse.json({ message: "Session not found." }, { status: 404 });
    return NextResponse.json({
      id: session.id,
      title: session.title,
      description: session.description,
      sessionDate: session.sessionDate.toISOString(),
    });
  }

  // Return all sessions (most recent first, limited to 10)
  const sessions = await (db as any).attendanceSession.findMany({
    orderBy: { sessionDate: "desc" },
    take: 10,
    select: { id: true, title: true, sessionDate: true },
  });

  return NextResponse.json(
    sessions.map((s: { id: string; title: string; sessionDate: Date }) => ({
      id: s.id,
      title: s.title,
      sessionDate: s.sessionDate.toISOString(),
    })),
  );
}
