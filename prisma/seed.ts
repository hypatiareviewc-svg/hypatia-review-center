import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  await prisma.enrollmentApplication.upsert({
    where: { applicationNumber: "HRC-APP-SEED-001" },
    update: {},
    create: {
      applicationNumber: "HRC-APP-SEED-001",
      photoName: "seed-applicant.jpg",
      lastName: "Santos",
      firstName: "Maria",
      middleName: "C",
      street: "12 Mabini Street",
      barangay: "Barangay 1",
      cityMunicipality: "Legazpi City",
      province: "Albay",
      zipcode: "4500",
      email: "maria.santos@example.com",
      contactNumber: "09171234567",
      schoolName: "Daraga National High School",
      schoolAddress: "Daraga, Albay",
      yearGraduated: "2024",
      programCourse: "Criminology",
      guardianFullName: "Jose Santos",
      guardianAddress: "12 Mabini Street, Legazpi City, Albay",
      guardianContactNumber: "09179876543",
      status: "PENDING",
    },
  });

  await prisma.enrollmentApplication.upsert({
    where: { applicationNumber: "HRC-APP-SEED-002" },
    update: {},
    create: {
      applicationNumber: "HRC-APP-SEED-002",
      photoName: "seed-applicant-2.jpg",
      lastName: "Reyes",
      firstName: "Angela",
      middleName: "P",
      street: "88 Rizal Avenue",
      barangay: "Barangay 4",
      cityMunicipality: "Naga City",
      province: "Camarines Sur",
      zipcode: "4400",
      email: "angela.reyes@example.com",
      contactNumber: "09175550123",
      schoolName: "Naga College Foundation",
      schoolAddress: "Naga City, Camarines Sur",
      yearGraduated: "2023",
      programCourse: "Criminology",
      guardianFullName: "Pedro Reyes",
      guardianAddress: "88 Rizal Avenue, Naga City, Camarines Sur",
      guardianContactNumber: "09176660123",
      status: "REVIEWING",
    },
  });

  console.log("Seeded enrollment applications");

  // Seed admin user (username: admin, password: admin123)
  const adminPassword = await bcrypt.hash("admin123", 12);
  await prisma.adminUser.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: adminPassword,
      name: "Administrator",
    },
  });
  console.log("Seeded admin user (username: admin, password: admin123)");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
