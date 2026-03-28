import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/client";
import LessonCreateForm from "./LessonCreateForm";
import { requireAuth } from "@/lib/auth/require-auth";

type NewLessonPageProps = {
  searchParams: Promise<{
    date?: string;
    studentId?: string;
  }>;
};

function buildDefaultScheduledAt(dateParam?: string): string {
  if (!dateParam) {
    return "";
  }

  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(dateParam);

  if (!isValidDate) {
    return "";
  }

  return `${dateParam}T18:00`;
}

export default async function NewLessonPage({
  searchParams,
}: NewLessonPageProps) {
  await requireAuth();
  const params = await searchParams;

  const students = await prisma.user.findMany({
    where: {
      role: UserRole.STUDENT,
    },
    orderBy: {
      firstName: "asc",
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  });

  const defaultScheduledAt = buildDefaultScheduledAt(params.date);

  return (
    <LessonCreateForm
      students={students}
      defaultScheduledAt={defaultScheduledAt}
      defaultStudentId={params.studentId ?? ""}
    />
  );
}