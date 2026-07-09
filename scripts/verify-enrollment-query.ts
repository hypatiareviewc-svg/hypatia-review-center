import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const enrollments = await prisma.enrollmentApplication.findMany({
    orderBy: { submittedAt: "desc" },
    take: 1,
  });

  console.log("ok", enrollments.length, enrollments[0]?.applicationNumber ?? "none");
}

main()
  .catch((error) => {
    console.error("failed", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
