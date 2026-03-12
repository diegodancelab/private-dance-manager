import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole, LessonType, BookingStatus } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@privatedancemanager.com" },
    update: {},
    create: {
      email: "admin@privatedancemanager.com",
      firstName: "Admin",
      lastName: "User",
      role: UserRole.ADMIN,
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: "teacher@privatedancemanager.com" },
    update: {},
    create: {
      email: "teacher@privatedancemanager.com",
      firstName: "Diego",
      lastName: "Poli",
      role: UserRole.TEACHER,
      phone: "+41000000000",
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@privatedancemanager.com" },
    update: {},
    create: {
      email: "student@privatedancemanager.com",
      firstName: "Test",
      lastName: "Student",
      role: UserRole.STUDENT,
    },
  });

  const lesson = await prisma.lesson.create({
    data: {
      title: "Private Bachata Fundamentals",
      description: "Introductory private lesson focused on basics and connection.",
      lessonType: LessonType.PRIVATE,
      scheduledAt: new Date("2026-03-13T18:00:00.000Z"),
      durationMin: 60,
      priceAmount: "80.00",
      location: "Geneva",
      teacherId: teacher.id,
    },
  });

  await prisma.lessonParticipant.create({
    data: {
      lessonId: lesson.id,
      userId: student.id,
      status: BookingStatus.CONFIRMED,
    },
  });

  await prisma.payment.create({
    data: {
      userId: student.id,
      amount: "80.00",
      currency: "CHF",
      paidAt: new Date(),
    },
  });

  await prisma.progressEntry.create({
    data: {
      userId: student.id,
      title: "First lesson assessment",
      notes: "Good rhythm and motivation. Needs work on frame and weight transfer.",
      level: 1,
    },
  });

  console.log({ admin, teacher, student, lesson });
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });