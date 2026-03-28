import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/client";
import LessonCreateForm from "./LessonCreateForm";

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
  const params = await searchParams;

  const teachers = await prisma.user.findMany({
    where: {
      role: UserRole.TEACHER,
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
  const defaultTeacherId = teachers.length === 1 ? teachers[0].id : "";

  return (
    <LessonCreateForm
      teachers={teachers}
      students={students}
      defaultScheduledAt={defaultScheduledAt}
      defaultTeacherId={defaultTeacherId}
      defaultStudentId={params.studentId ?? ""}
    />
  );
}