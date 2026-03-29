import "dotenv/config";

import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  UserRole,
  LessonType,
  BookingStatus,
  ChargeType,
  ChargeStatus,
  PaymentMethod,
  PaymentStatus,
} from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPasswordHash = await bcrypt.hash("admin123", 12);
  const teacherPasswordHash = await bcrypt.hash("teacher123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@privatedancemanager.com" },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: "admin@privatedancemanager.com",
      firstName: "Admin",
      lastName: "User",
      role: UserRole.ADMIN,
      passwordHash: adminPasswordHash,
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: "diego@privatedancemanager.com" },
    update: { passwordHash: teacherPasswordHash },
    create: {
      email: "diego@privatedancemanager.com",
      firstName: "Diego",
      lastName: "Poli",
      role: UserRole.TEACHER,
      phone: "+41000000000",
      passwordHash: teacherPasswordHash,
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
      createdByTeacherId: teacher.id,
    },
  });

  const existingLesson = await prisma.lesson.findFirst({
    where: {
      title: "Private Bachata Fundamentals",
      teacherId: teacher.id,
    },
  });

  const lesson =
    existingLesson ??
    (await prisma.lesson.create({
      data: {
        title: "Private Bachata Fundamentals",
        description:
          "Introductory private lesson focused on basics and connection.",
        lessonType: LessonType.PRIVATE,
        scheduledAt: new Date("2026-03-13T18:00:00.000Z"),
        durationMin: 60,
        priceAmount: "80.00",
        location: "Geneva",
        teacherId: teacher.id,
      },
    }));

  await prisma.lessonParticipant.upsert({
    where: {
      lessonId_userId: {
        lessonId: lesson.id,
        userId: student.id,
      },
    },
    update: {
      status: BookingStatus.CONFIRMED,
    },
    create: {
      lessonId: lesson.id,
      userId: student.id,
      status: BookingStatus.CONFIRMED,
    },
  });

  const existingCharge = await prisma.charge.findFirst({
    where: {
      userId: student.id,
      lessonId: lesson.id,
      title: "Private Bachata Fundamentals",
    },
  });

  const charge =
    existingCharge ??
    (await prisma.charge.create({
      data: {
        userId: student.id,
        teacherId: teacher.id,
        lessonId: lesson.id,
        type: ChargeType.LESSON,
        title: "Private Bachata Fundamentals",
        description: "Charge for one private bachata lesson.",
        amount: "80.00",
        currency: "CHF",
        status: ChargeStatus.PAID,
        dueAt: new Date("2026-03-13T18:00:00.000Z"),
      },
    }));

  const existingPayment = await prisma.payment.findFirst({
    where: {
      userId: student.id,
      amount: "80.00",
      note: "Seed payment for private bachata lesson",
    },
  });

  const payment =
    existingPayment ??
    (await prisma.payment.create({
      data: {
        userId: student.id,
        teacherId: teacher.id,
        amount: "80.00",
        currency: "CHF",
        method: PaymentMethod.TWINT,
        status: PaymentStatus.COMPLETED,
        note: "Seed payment for private bachata lesson",
        paidAt: new Date("2026-03-13T19:00:00.000Z"),
      },
    }));

  await prisma.paymentAllocation.upsert({
    where: {
      chargeId_paymentId: {
        chargeId: charge.id,
        paymentId: payment.id,
      },
    },
    update: {
      amount: "80.00",
    },
    create: {
      chargeId: charge.id,
      paymentId: payment.id,
      amount: "80.00",
    },
  });

  await prisma.progressEntry.upsert({
    where: {
      id: "seed-progress-entry-1",
    },
    update: {
      title: "First lesson assessment",
      notes:
        "Good rhythm and motivation. Needs work on frame and weight transfer.",
      level: 1,
    },
    create: {
      id: "seed-progress-entry-1",
      userId: student.id,
      teacherId: teacher.id,
      title: "First lesson assessment",
      notes:
        "Good rhythm and motivation. Needs work on frame and weight transfer.",
      level: 1,
    },
  });

  console.log({
    admin,
    teacher,
    student,
    lesson,
    charge,
    payment,
  });
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });