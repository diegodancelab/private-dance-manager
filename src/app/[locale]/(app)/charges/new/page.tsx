import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/client";
import { requireAuth } from "@/lib/auth/require-auth";
import ChargeCreateForm from "./ChargeCreateForm";

type Props = {
  searchParams: Promise<{
    userId?: string;
  }>;
};

export default async function NewChargePage({ searchParams }: Props) {
  const { user } = await requireAuth();
  const { userId } = await searchParams;

  const students = await prisma.user.findMany({
    where: {
      role: UserRole.STUDENT,
      createdByTeacherId: user.id,
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
    where: { teacherId: user.id },
    orderBy: {
      scheduledAt: "desc",
    },
    select: {
      id: true,
      title: true,
      scheduledAt: true,
    },
  });

  return (
    <ChargeCreateForm
      students={students}
      lessons={lessons}
      defaultUserId={userId}
    />
  );
}
