import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { freshPrismaClient } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin-session";

const createSchema = z.object({
  title: z.string().min(1, "Title is required.").max(120),
  description: z.string().max(1000).nullable().optional(),
  type: z.enum(["LECTURE", "MOCK_BOARD", "SEMINAR", "ORIENTATION", "HOLIDAY", "DEADLINE", "OTHER"]),
  // Accept any non-empty string that parses to a valid date
  startDate: z.string().min(1, "Start date is required.").refine(
    (v) => !isNaN(new Date(v).getTime()),
    { message: "Invalid start date." },
  ),
  endDate: z.string().nullable().optional().refine(
    (v) => v === null || v === undefined || v === "" || !isNaN(new Date(v).getTime()),
    { message: "Invalid end date." },
  ),
  allDay: z.boolean().default(true),
  location: z.string().max(200).nullable().optional(),
});

function serialize(e: {
  id: string;
  title: string;
  description: string | null;
  type: string;
  startDate: Date;
  endDate: Date | null;
  allDay: boolean;
  location: string | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    type: e.type,
    startDate: e.startDate.toISOString(),
    endDate: e.endDate ? e.endDate.toISOString() : null,
    allDay: e.allDay,
    location: e.location,
    createdBy: e.createdBy,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  };
}

/** GET /api/admin/calendar — list all events, optionally filtered by month */
export async function GET(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const year = searchParams.get("year");
  const month = searchParams.get("month"); // 0-indexed

  let where = {};
  if (year && month !== null) {
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0, 23, 59, 59, 999);
    where = { startDate: { gte: start, lte: end } };
  }

  const events = await freshPrismaClient().calendarEvent.findMany({
    where,
    orderBy: { startDate: "asc" },
  });

  return NextResponse.json(events.map(serialize));
}

/** POST /api/admin/calendar — create a new event */
export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const result = createSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { message: "Invalid payload.", issues: result.error.flatten() },
      { status: 400 },
    );
  }

  const data = result.data;
  const event = await freshPrismaClient().calendarEvent.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      type: data.type,
      startDate: new Date(data.startDate),
      endDate: data.endDate && data.endDate !== "" ? new Date(data.endDate) : null,
      allDay: data.allDay,
      location: data.location ?? null,
      createdBy: admin.name,
    },
  });

  return NextResponse.json(serialize(event), { status: 201 });
}
