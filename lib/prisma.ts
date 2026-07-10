import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pool?: Pool;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = globalForPrisma.pool ?? new Pool({ connectionString });
  if (!globalForPrisma.pool) globalForPrisma.pool = pool;

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

/**
 * Lazily resolve the Prisma client on first use.
 *
 * Importing this module during the build (page data collection) must NOT
 * require DATABASE_URL to be set, so the client is only created when
 * accessed at runtime.
 *
 * We intentionally do NOT use a Proxy because it does not behave
 * correctly on Netlify's serverless runtime.
 */
export function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

/**
 * Always returns a fresh PrismaClient instance (reusing the connection pool).
 * Use this when the global singleton may be stale after schema changes.
 * Checks for all models added after initial server start; replaces the
 * singleton if any are missing so subsequent calls also benefit.
 */
export function freshPrismaClient(): PrismaClient {
  const existing = globalForPrisma.prisma;
  // Verify the cached client knows about every model added post-boot.
  const isStale =
    !existing ||
    !(existing as any).calendarEvent ||
    !(existing as any).attendanceSession ||
    !(existing as any).attendanceRecord;

  if (!isStale) return existing!;

  const fresh = createPrismaClient();
  globalForPrisma.prisma = fresh;
  return fresh;
}

export const prisma = getPrismaClient();
