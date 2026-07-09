import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const application = await prisma.enrollmentApplication.findFirst({
    orderBy: { submittedAt: "desc" },
    select: {
      applicationNumber: true,
      email: true,
    },
  });

  if (!application) {
    throw new Error("No enrollment applications were found.");
  }

  console.log(`✅ Connected. Latest application: ${application.applicationNumber} (${application.email})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
