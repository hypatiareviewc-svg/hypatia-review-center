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
  const adapter = new PrismaPg(pool);
  const client = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool;
    globalForPrisma.prisma = client;
  }

  return client;
}

/**
 * Lazily resolve the Prisma client on first use.
 *
 * Importing this module during the build (page data collection) must NOT
 * require DATABASE_URL to be set, so the client is only created when
 * accessed at runtime — via the `getPrismaClient()` function or the
 * `prisma` export below.
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

export const prisma = getPrismaClient();
