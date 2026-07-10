import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  const username = "admin@hrc.com";
  const password = "Admin123";
  const name = "Administrator";

  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.adminUser.upsert({
    where: { username },
    update: { password: hashedPassword, name },
    create: {
      username,
      password: hashedPassword,
      name,
    },
  });

  console.log("✓ Admin user saved:");
  console.log("  Username:", admin.username);
  console.log("  Name:    ", admin.name);
  console.log("  ID:      ", admin.id);
}

main()
  .catch((error) => {
    console.error("✗ Failed to create admin user:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
