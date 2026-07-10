import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  verifySessionToken,
  SESSION_COOKIE_NAME_EXPORT,
} from "@/lib/admin-auth";

/**
 * Returns the currently authenticated admin user (without the password hash),
 * or `null` if there is no valid session. Intended for server components
 * and route handlers inside the admin area.
 */
export async function getAdminUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME_EXPORT)?.value;

  if (!token) {
    return null;
  }

  const payload = await verifySessionToken(token);

  if (!payload) {
    return null;
  }

  const admin = await prisma.adminUser.findUnique({
    where: { id: payload.sub },
    select: { id: true, username: true, name: true, createdAt: true },
  });

  return admin;
}

export type CurrentAdmin = NonNullable<Awaited<ReturnType<typeof getAdminUser>>>;
