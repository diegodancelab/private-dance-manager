/**
 * Production bootstrap script.
 *
 * Creates (or updates) the initial teacher account in a production database.
 * Safe to run multiple times (idempotent via upsert on email).
 *
 * Required environment variables:
 *   BOOTSTRAP_EMAIL      — Teacher's email address
 *   BOOTSTRAP_PASSWORD   — Teacher's password (min 12 characters)
 *
 * Optional environment variables:
 *   BOOTSTRAP_FIRST_NAME — First name (default: "Admin")
 *   BOOTSTRAP_LAST_NAME  — Last name  (default: "Teacher")
 *   BOOTSTRAP_PHONE      — Phone number
 *
 * Usage:
 *   DATABASE_URL=<prod-url> \
 *   BOOTSTRAP_EMAIL=you@example.com \
 *   BOOTSTRAP_PASSWORD=<strong-password> \
 *   npm run bootstrap:prod
 */
import "dotenv/config";

import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole } from "../src/generated/prisma/client";

const MIN_PASSWORD_LENGTH = 12;

const WEAK_PASSWORDS = new Set([
  "admin123",
  "teacher123",
  "password",
  "password123",
  "123456789012",
  "qwertyuiopas",
]);

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`ERROR: Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

async function main() {
  const email = getRequiredEnv("BOOTSTRAP_EMAIL").trim().toLowerCase();
  const password = getRequiredEnv("BOOTSTRAP_PASSWORD");
  const firstName = process.env.BOOTSTRAP_FIRST_NAME?.trim() || "Admin";
  const lastName = process.env.BOOTSTRAP_LAST_NAME?.trim() || "Teacher";
  const phone = process.env.BOOTSTRAP_PHONE?.trim() || undefined;

  if (password.length < MIN_PASSWORD_LENGTH) {
    console.error(
      `ERROR: BOOTSTRAP_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters.`
    );
    process.exit(1);
  }

  if (WEAK_PASSWORDS.has(password)) {
    console.error(
      "ERROR: BOOTSTRAP_PASSWORD is a known weak/demo password. Choose a stronger one."
    );
    process.exit(1);
  }

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  const prisma = new PrismaClient({ adapter });

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    const teacher = await prisma.user.upsert({
      where: { email },
      update: {
        passwordHash,
        firstName,
        lastName,
        phone,
        isActive: true,
      },
      create: {
        email,
        firstName,
        lastName,
        phone,
        role: UserRole.TEACHER,
        passwordHash,
        isActive: true,
      },
      select: { id: true, email: true, role: true, firstName: true, lastName: true },
    });

    console.log("Bootstrap successful.");
    console.log(`  ID:    ${teacher.id}`);
    console.log(`  Email: ${teacher.email}`);
    console.log(`  Name:  ${teacher.firstName} ${teacher.lastName}`);
    console.log(`  Role:  ${teacher.role}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Bootstrap failed:", error);
  process.exit(1);
});
