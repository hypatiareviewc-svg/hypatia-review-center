import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { freshPrismaClient } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin-session";

type RouteParams = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(1000).nullable().optional(),
  type: z.enum(["LECTURE", "MOCK_BOARD", "SEMINAR", "ORIENTATION", "HOLIDAY", "DEADLINE", "OTHER"]).optional(),
  startDate: z.string().optional().refine(
    (v) => v === undefined || !isNaN(new Date(v).getTime()),
    { message: "Invalid start date." },
  ),
  endDate: z.string().nullable().optional().refine(
    (v) => v === null || v === undefined || v === "" || !isNaN(new Date(v).getTime()),
    { message: "Invalid end date." },
  ),
  allDay: z.boolean().optional(),
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

/** PATCH /api/admin/calendar/[id] — update an event */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const result = updateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { message: "Invalid payload.", issues: result.error.flatten() },
      { status: 400 },
    );
  }

  const db = freshPrismaClient();

  const exists = await db.calendarEvent.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return NextResponse.json({ message: "Event not found." }, { status: 404 });

  const data = result.data;
  const updated = await db.calendarEvent.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.type !== undefined && { type: data.type as any }),
      ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
      ...(data.endDate !== undefined && { endDate: data.endDate && data.endDate !== "" ? new Date(data.endDate) : null }),
      ...(data.allDay !== undefined && { allDay: data.allDay }),
      ...(data.location !== undefined && { location: data.location }),
    },
  });

  return NextResponse.json(serialize(updated));
}

/** DELETE /api/admin/calendar/[id] — delete an event */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const db = freshPrismaClient();

  const exists = await db.calendarEvent.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return NextResponse.json({ message: "Event not found." }, { status: 404 });

  await db.calendarEvent.delete({ where: { id } });
  return NextResponse.json({ message: "Event deleted." });
}
