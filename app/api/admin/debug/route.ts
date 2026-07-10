import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Temporary diagnostic endpoint — DELETE THIS after debugging.
 * GET /api/admin/debug
 */
export async function GET() {
  const checks: Record<string, string> = {};

  // 1. Check DATABASE_URL is set
  checks.DATABASE_URL = process.env.DATABASE_URL ? "SET (hidden)" : "NOT SET";

  // 2. Try to connect to DB
  try {
    await prisma.$queryRaw`SELECT 1 as ok`;
    checks.dbConnection = "OK";
  } catch (err) {
    checks.dbConnection = `ERROR: ${err instanceof Error ? err.message : String(err)}`;
  }

  // 3. Try to query AdminUser table
  try {
    const count = await prisma.adminUser.count();
    checks.adminUserCount = String(count);
    const users = await prisma.adminUser.findMany({
      select: { id: true, username: true, name: true, createdAt: true },
    });
    checks.adminUsers = JSON.stringify(users);
  } catch (err) {
    checks.adminUserTable = `ERROR: ${err instanceof Error ? err.message : String(err)}`;
  }

  // 4. Try to query EnrollmentApplication
  try {
    const count = await prisma.enrollmentApplication.count();
    checks.enrollmentCount = String(count);
  } catch (err) {
    checks.enrollmentTable = `ERROR: ${err instanceof Error ? err.message : String(err)}`;
  }

  // 5. Check ADMIN_SESSION_SECRET
  checks.ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET ? "SET (hidden)" : "NOT SET (using fallback)";

  return NextResponse.json(checks);
}
