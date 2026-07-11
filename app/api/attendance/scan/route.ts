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

  // 2. Check session exists (with time settings)
  const session = await (db as any).attendanceSession.findUnique({
    where: { id: sessionId },
    select: { 
      id: true, 
      title: true, 
      morningIn: true, 
      afternoonIn: true, 
      lateMinutes: true 
    },
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
    select: { scannedAt: true, isLate: true, latePeriod: true },
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
      isLate: existing.isLate,
      latePeriod: existing.latePeriod,
    });
  }

  // 4. Calculate if late
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;

  let isLate = false;
  let latePeriod: string | null = null;

  const lateMinutes = session.lateMinutes ?? 15;

  // Check morning period
  if (session.morningIn) {
    const [h, m] = session.morningIn.split(":").map(Number);
    const startMinutes = h * 60 + m;
    const lateThreshold = startMinutes + lateMinutes;
    
    if (currentTimeMinutes <= parseInt(session.morningOut?.split(":").join("") || "1200") / 100) {
      // Still in morning period
      if (currentTimeMinutes > lateThreshold) {
        isLate = true;
        latePeriod = "morning";
      }
    }
  }

  // Check afternoon period if not already marked late in morning
  if (!isLate && session.afternoonIn) {
    const [h, m] = session.afternoonIn.split(":").map(Number);
    const startMinutes = h * 60 + m;
    const lateThreshold = startMinutes + lateMinutes;
    
    if (currentTimeMinutes >= startMinutes) {
      if (currentTimeMinutes > lateThreshold) {
        isLate = true;
        latePeriod = "afternoon";
      }
    }
  }

  // If no time settings configured, default to not late
  if (!session.morningIn && !session.afternoonIn) {
    isLate = false;
    latePeriod = null;
  }

  // 5. Record attendance
  const record = await (db as any).attendanceRecord.create({
    data: {
      sessionId,
      enrollmentId: student.id,
      applicationNumber: student.applicationNumber,
      studentName,
      programCourse: student.programCourse,
      photoUrl: student.photoUrl,
      isLate,
      latePeriod,
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
    isLate: record.isLate,
    latePeriod: record.latePeriod,
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
      select: { 
        id: true, 
        title: true, 
        description: true, 
        sessionDate: true,
        morningIn: true,
        morningOut: true,
        afternoonIn: true,
        afternoonOut: true,
        lateMinutes: true,
      },
    });
    if (!session) return NextResponse.json({ message: "Session not found." }, { status: 404 });
    return NextResponse.json({
      id: session.id,
      title: session.title,
      description: session.description,
      sessionDate: session.sessionDate.toISOString(),
      morningIn: session.morningIn,
      morningOut: session.morningOut,
      afternoonIn: session.afternoonIn,
      afternoonOut: session.afternoonOut,
      lateMinutes: session.lateMinutes,
    });
  }

  // Return all sessions (most recent first, limited to 10)
  const sessions = await (db as any).attendanceSession.findMany({
    orderBy: { sessionDate: "desc" },
    take: 10,
    select: { 
      id: true, 
      title: true, 
      sessionDate: true,
      morningIn: true,
      morningOut: true,
      afternoonIn: true,
      afternoonOut: true,
      lateMinutes: true,
    },
  });

  return NextResponse.json(
    sessions.map((s: { 
      id: string; 
      title: string; 
      sessionDate: Date;
      morningIn: string | null;
      morningOut: string | null;
      afternoonIn: string | null;
      afternoonOut: string | null;
      lateMinutes: number;
    }) => ({
      id: s.id,
      title: s.title,
      sessionDate: s.sessionDate.toISOString(),
      morningIn: s.morningIn,
      morningOut: s.morningOut,
      afternoonIn: s.afternoonIn,
      afternoonOut: s.afternoonOut,
      lateMinutes: s.lateMinutes,
    })),
  );
}
