import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin-session";
import { hashPassword } from "@/lib/admin-auth";

const createSchema = z.object({
  name: z.string().min(2, "Name is required."),
  username: z.string().min(3, "Username must be at least 3 characters.").regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

function serialize(u: { id: string; username: string; name: string; createdAt: Date }) {
  return { id: u.id, username: u.username, name: u.name, createdAt: u.createdAt.toISOString() };
}

/** GET /api/admin/users — list all admin users */
export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, username: true, name: true, createdAt: true },
  });

  return NextResponse.json(users.map(serialize));
}

/** POST /api/admin/users — create a new admin user */
export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const result = createSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ message: "Invalid payload.", issues: result.error.flatten() }, { status: 400 });
  }

  const { name, username, password } = result.data;

  const existing = await prisma.adminUser.findUnique({ where: { username }, select: { id: true } });
  if (existing) {
    return NextResponse.json({ message: "Username is already taken." }, { status: 409 });
  }

  const hashed = await hashPassword(password);
  const user = await prisma.adminUser.create({
    data: { name, username, password: hashed },
    select: { id: true, username: true, name: true, createdAt: true },
  });

  return NextResponse.json(serialize(user), { status: 201 });
}
