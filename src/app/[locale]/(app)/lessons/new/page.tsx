import { prisma } from "@/lib/prisma";
import { UserRole, PackageStatus } from "@/generated/prisma/client";
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
  const { user } = await requireAuth();
  const params = await searchParams;

  const students = await prisma.user.findMany({
    where: {
      role: UserRole.STUDENT,
      createdByTeacherId: user.id,
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

  // Fetch active packages per student (via PackageParticipant) for PACKAGE billing mode
  const packageParticipants = await prisma.packageParticipant.findMany({
    where: {
      userId: { in: students.map((s) => s.id) },
      package: { status: PackageStatus.ACTIVE, teacherId: user.id },
    },
    select: {
      userId: true,
      package: {
        select: { id: true, name: true, remainingMinutes: true },
      },
    },
    orderBy: { package: { createdAt: "desc" } },
  });

  const packagesByStudent: Record<
    string,
    { id: string; name: string; remainingMinutes: number }[]
  > = {};
  for (const pp of packageParticipants) {
    if (!packagesByStudent[pp.userId]) packagesByStudent[pp.userId] = [];
    packagesByStudent[pp.userId].push(pp.package);
  }

  const defaultScheduledAt = buildDefaultScheduledAt(params.date);

  return (
    <LessonCreateForm
      students={students}
      packagesByStudent={packagesByStudent}
      defaultScheduledAt={defaultScheduledAt}
      defaultStudentId={params.studentId ?? ""}
    />
  );
}
