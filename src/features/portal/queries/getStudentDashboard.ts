import { prisma } from "@/lib/prisma";
import { LessonStatus, PackageStatus } from "@/generated/prisma/client";

export type StudentDashboardData = {
  nextLesson: {
    id: string;
    title: string;
    scheduledAt: Date;
    durationMin: number;
    lessonType: string;
    location: string | null;
  } | null;
  activePackage: {
    id: string;
    name: string;
    remainingMinutes: number;
    totalMinutes: number;
  } | null;
  lastAssessmentDate: Date | null;
};

export async function getStudentDashboard(
  studentId: string
): Promise<StudentDashboardData> {
  const now = new Date();

  const [nextParticipation, activePackages, lastAssessment] = await Promise.all([
    prisma.lessonParticipant.findFirst({
      where: {
        userId: studentId,
        lesson: {
          scheduledAt: { gte: now },
          status: LessonStatus.SCHEDULED,
        },
      },
      orderBy: { lesson: { scheduledAt: "asc" } },
      select: {
        lesson: {
          select: {
            id: true,
            title: true,
            scheduledAt: true,
            durationMin: true,
            lessonType: true,
            location: true,
          },
        },
      },
    }),

    prisma.package.findMany({
      where: {
        status: PackageStatus.ACTIVE,
        participants: { some: { userId: studentId } },
      },
      orderBy: { remainingMinutes: "desc" },
      take: 1,
      select: {
        id: true,
        name: true,
        remainingMinutes: true,
        totalMinutes: true,
      },
    }),

    prisma.skillAssessment.findFirst({
      where: { studentId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ]);

  return {
    nextLesson: nextParticipation?.lesson ?? null,
    activePackage: activePackages[0] ?? null,
    lastAssessmentDate: lastAssessment?.createdAt ?? null,
  };
}
