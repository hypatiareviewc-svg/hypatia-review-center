import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EnrollmentStatus') THEN
        CREATE TYPE "EnrollmentStatus" AS ENUM ('PENDING', 'REVIEWING', 'APPROVED', 'REJECTED');
      END IF;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "EnrollmentApplication" (
      "id" TEXT NOT NULL,
      "applicationNumber" TEXT NOT NULL,
      "photoName" TEXT,
      "lastName" TEXT NOT NULL,
      "firstName" TEXT NOT NULL,
      "middleName" TEXT NOT NULL,
      "street" TEXT NOT NULL,
      "barangay" TEXT NOT NULL,
      "cityMunicipality" TEXT NOT NULL,
      "province" TEXT NOT NULL,
      "zipcode" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "contactNumber" TEXT NOT NULL,
      "schoolName" TEXT NOT NULL,
      "schoolAddress" TEXT NOT NULL,
      "yearGraduated" TEXT NOT NULL,
      "programCourse" TEXT NOT NULL,
      "guardianFullName" TEXT NOT NULL,
      "guardianAddress" TEXT NOT NULL,
      "guardianContactNumber" TEXT NOT NULL,
      "status" "EnrollmentStatus" NOT NULL DEFAULT 'PENDING',
      "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "EnrollmentApplication_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "EnrollmentApplication_applicationNumber_key"
    ON "EnrollmentApplication" ("applicationNumber");
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "EnrollmentApplication"
    ADD COLUMN IF NOT EXISTS "photoUrl" TEXT;
  `);

  console.log("✅ Admissions schema applied.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
