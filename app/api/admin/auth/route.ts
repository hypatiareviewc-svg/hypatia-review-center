import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  createSessionToken,
  SESSION_COOKIE_OPTIONS,
} from "@/lib/admin-auth";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
});

/** POST /api/admin/auth — authenticate admin and set session cookie. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: "Please enter your username and password." },
        { status: 400 },
      );
    }

    const { username, password } = result.data;

    const admin = await prisma.adminUser.findUnique({ where: { username } });

    if (!admin) {
      return NextResponse.json(
        { message: "Invalid username or password." },
        { status: 401 },
      );
    }

    const valid = await verifyPassword(password, admin.password);

    if (!valid) {
      return NextResponse.json(
        { message: "Invalid username or password." },
        { status: 401 },
      );
    }

    const token = await createSessionToken(admin.id);

    const response = NextResponse.json({
      message: "Authenticated.",
      admin: { id: admin.id, name: admin.name, username: admin.username },
    });

    response.cookies.set({
      ...SESSION_COOKIE_OPTIONS,
      value: token,
    });

    return response;
  } catch (error) {
    // TODO: Remove detailed error in production — only for debugging
    const detail = error instanceof Error ? error.message : String(error);
    console.error("Admin auth error:", detail);
    return NextResponse.json(
      { message: `Server error: ${detail}` },
      { status: 500 },
    );
  }
}

/** DELETE /api/admin/auth — clear session cookie (logout). */
export async function DELETE() {
  try {
    const response = NextResponse.json({ message: "Logged out." });

    response.cookies.set({
      ...SESSION_COOKIE_OPTIONS,
      value: "",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Admin logout error:", error);
    return NextResponse.json(
      { message: "An internal error occurred." },
      { status: 500 },
    );
  }
}
