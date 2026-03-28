import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/client";
import ChargeCreateForm from "./ChargeCreateForm";

export default async function NewChargePage() {
  const students = await prisma.user.findMany({
    where: {
      role: UserRole.STUDENT,
    },
    orderBy: [
      { firstName: "asc" },
      { lastName: "asc" },
    ],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    },
  });

  const lessons = await prisma.lesson.findMany({
    orderBy: {
      scheduledAt: "desc",
    },
    select: {
      id: true,
      title: true,
      scheduledAt: true,
    },
  });

  return <ChargeCreateForm students={students} lessons={lessons} />;
}