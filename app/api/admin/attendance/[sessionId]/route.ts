import { NextRequest, NextResponse } from "next/server";
import { freshPrismaClient } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin-session";

type RouteParams = { params: Promise<{ sessionId: string }> };

function serializeRecord(r: {
  id: string;
  sessionId: string;
  enrollmentId: string;
  applicationNumber: string;
  studentName: string;
  programCourse: string;
  photoUrl: string | null;
  scannedAt: Date;
}) {
  return {
    id: r.id,
    sessionId: r.sessionId,
    enrollmentId: r.enrollmentId,
    applicationNumber: r.applicationNumber,
    studentName: r.studentName,
    programCourse: r.programCourse,
    photoUrl: r.photoUrl,
    scannedAt: r.scannedAt.toISOString(),
  };
}

/** GET /api/admin/attendance/[sessionId] — get session + all records */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { sessionId } = await params;
  const db = freshPrismaClient();

  const session = await (db as any).attendanceSession.findUnique({
    where: { id: sessionId },
    include: {
      records: { orderBy: { scannedAt: "asc" } },
      _count: { select: { records: true } },
    },
  });

  if (!session) return NextResponse.json({ message: "Session not found." }, { status: 404 });

  return NextResponse.json({
    ...session,
    sessionDate: session.sessionDate.toISOString(),
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
    records: session.records.map(serializeRecord),
  });
}

/** DELETE /api/admin/attendance/[sessionId] — delete a session */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { sessionId } = await params;
  const db = freshPrismaClient();

  const exists = await (db as any).attendanceSession.findUnique({
    where: { id: sessionId },
    select: { id: true },
  });
  if (!exists) return NextResponse.json({ message: "Session not found." }, { status: 404 });

  await (db as any).attendanceSession.delete({ where: { id: sessionId } });
  return NextResponse.json({ message: "Session deleted." });
}
