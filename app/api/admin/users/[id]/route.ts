import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin-session";
import { hashPassword, verifyPassword } from "@/lib/admin-auth";

type RouteParams = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  username: z.string().min(3).regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores.").optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
});

/** PATCH /api/admin/users/[id] — update profile or change password */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  // Password change path
  if ("currentPassword" in body) {
    const result = changePasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ message: "Invalid payload.", issues: result.error.flatten() }, { status: 400 });
    }

    // Only allow changing your own password
    if (id !== admin.id) {
      return NextResponse.json({ message: "You can only change your own password." }, { status: 403 });
    }

    const user = await prisma.adminUser.findUnique({ where: { id }, select: { password: true } });
    if (!user) return NextResponse.json({ message: "User not found." }, { status: 404 });

    const valid = await verifyPassword(result.data.currentPassword, user.password);
    if (!valid) return NextResponse.json({ message: "Current password is incorrect." }, { status: 400 });

    const hashed = await hashPassword(result.data.newPassword);
    await prisma.adminUser.update({ where: { id }, data: { password: hashed } });

    return NextResponse.json({ message: "Password updated successfully." });
  }

  // Profile update path
  const result = updateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ message: "Invalid payload.", issues: result.error.flatten() }, { status: 400 });
  }

  const exists = await prisma.adminUser.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return NextResponse.json({ message: "User not found." }, { status: 404 });

  if (result.data.username) {
    const taken = await prisma.adminUser.findFirst({
      where: { username: result.data.username, NOT: { id } },
      select: { id: true },
    });
    if (taken) return NextResponse.json({ message: "Username is already taken." }, { status: 409 });
  }

  const updated = await prisma.adminUser.update({
    where: { id },
    data: result.data,
    select: { id: true, username: true, name: true, createdAt: true },
  });

  return NextResponse.json({
    id: updated.id,
    username: updated.username,
    name: updated.name,
    createdAt: updated.createdAt.toISOString(),
  });
}

/** DELETE /api/admin/users/[id] — delete an admin user */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  if (id === admin.id) {
    return NextResponse.json({ message: "You cannot delete your own account." }, { status: 400 });
  }

  // Prevent deleting the last admin
  const count = await prisma.adminUser.count();
  if (count <= 1) {
    return NextResponse.json({ message: "Cannot delete the last admin account." }, { status: 400 });
  }

  const exists = await prisma.adminUser.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return NextResponse.json({ message: "User not found." }, { status: 404 });

  await prisma.adminUser.delete({ where: { id } });
  return NextResponse.json({ message: "User deleted." });
}
