import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { freshPrismaClient } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin-session";

// Time string format: "HH:mm"
const timeString = z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/, "Use 24-hour format like 08:00").optional();

const createSessionSchema = z.object({
  title: z.string().min(1, "Title is required.").max(120),
  description: z.string().max(500).optional(),
  sessionDate: z.string().min(1, "Session date is required."),
  // Time settings
  morningIn: timeString,
  morningOut: timeString,
  afternoonIn: timeString,
  afternoonOut: timeString,
  lateMinutes: z.number().int().min(1).max(120).default(15),
});

function serializeSession(s: {
  id: string;
  title: string;
  description: string | null;
  sessionDate: Date;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  morningIn: string | null;
  morningOut: string | null;
  afternoonIn: string | null;
  afternoonOut: string | null;
  lateMinutes: number;
  _count?: { records: number };
}) {
  return {
    id: s.id,
    title: s.title,
    description: s.description,
    sessionDate: s.sessionDate.toISOString(),
    createdBy: s.createdBy,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
    morningIn: s.morningIn,
    morningOut: s.morningOut,
    afternoonIn: s.afternoonIn,
    afternoonOut: s.afternoonOut,
    lateMinutes: s.lateMinutes,
    _count: s._count,
  };
}

/** GET /api/admin/attendance — list all sessions */
export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const db = freshPrismaClient();
  const sessions = await (db as any).attendanceSession.findMany({
    orderBy: { sessionDate: "desc" },
    include: { _count: { select: { records: true } } },
  });

  return NextResponse.json(sessions.map(serializeSession));
}

/** POST /api/admin/attendance — create a new session */
export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const result = createSessionSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { message: "Invalid payload.", issues: result.error.flatten() },
      { status: 400 },
    );
  }

  const db = freshPrismaClient();
  const session = await (db as any).attendanceSession.create({
    data: {
      title: result.data.title,
      description: result.data.description ?? null,
      sessionDate: new Date(result.data.sessionDate),
      createdBy: admin.name,
      // Time settings
      morningIn: result.data.morningIn ?? null,
      morningOut: result.data.morningOut ?? null,
      afternoonIn: result.data.afternoonIn ?? null,
      afternoonOut: result.data.afternoonOut ?? null,
      lateMinutes: result.data.lateMinutes ?? 15,
    },
    include: { _count: { select: { records: true } } },
  });

  return NextResponse.json(serializeSession(session), { status: 201 });
}
