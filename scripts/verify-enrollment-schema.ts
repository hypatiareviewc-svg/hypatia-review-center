import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const rows = await prisma.$queryRawUnsafe<Array<{ column_name: string }>>(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'EnrollmentApplication'
    ORDER BY column_name;
  `);

  console.log("columns:", rows.map((row) => row.column_name).join(", "));
  console.log("count:", await prisma.enrollmentApplication.count());
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
