/**
 * Admin Promotion Script
 *
 * Usage: npx tsx scripts/make-admin.ts user@example.com
 *
 * Promotes a user to ADMIN role by their email address.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("❌ Usage: npx tsx scripts/make-admin.ts <email>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`❌ No user found with email: ${email}`);
    process.exit(1);
  }

  if (user.role === "ADMIN") {
    console.log(`ℹ️  User ${email} is already an admin.`);
    process.exit(0);
  }

  await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
  });

  console.log(`✅ Successfully promoted ${email} to ADMIN.`);
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
