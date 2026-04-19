import { prisma } from "@/lib/prisma";
import { LessonStatus, PackageStatus, BookingStatus } from "@/generated/prisma/client";

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
    expiresAt: Date | null;
  } | null;
  lastAssessmentDate: Date | null;
  stats: {
    totalMinutes: number;
    lessonsCompletedCount: number;
    lastAssessmentAverage: number | null;
  };
  lastAssessmentTopSkills: { label: string; score: number }[];
};

export async function getStudentDashboard(
  studentId: string
): Promise<StudentDashboardData> {
  const now = new Date();

  const [
    nextParticipation,
    activePackages,
    lastAssessment,
    completedParticipations,
  ] = await Promise.all([
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
        expiresAt: true,
      },
    }),

    prisma.skillAssessment.findFirst({
      where: { studentId },
      orderBy: { createdAt: "desc" },
      select: {
        createdAt: true,
        scores: {
          select: {
            score: true,
            axis: { select: { label: true } },
          },
          orderBy: { score: "desc" },
        },
      },
    }),

    prisma.lessonParticipant.findMany({
      where: {
        userId: studentId,
        status: BookingStatus.CONFIRMED,
        lesson: { scheduledAt: { lt: now } },
      },
      select: { lesson: { select: { durationMin: true } } },
    }),
  ]);

  const totalMinutes = completedParticipations.reduce(
    (sum, p) => sum + p.lesson.durationMin,
    0
  );
  const lessonsCompletedCount = completedParticipations.length;

  let lastAssessmentAverage: number | null = null;
  let lastAssessmentTopSkills: { label: string; score: number }[] = [];

  if (lastAssessment && lastAssessment.scores.length > 0) {
    const scores = lastAssessment.scores;
    lastAssessmentAverage =
      Math.round(
        (scores.reduce((s, sc) => s + sc.score, 0) / scores.length) * 10
      ) / 10;
    lastAssessmentTopSkills = scores.slice(0, 2).map((sc) => ({
      label: sc.axis.label,
      score: sc.score,
    }));
  }

  return {
    nextLesson: nextParticipation?.lesson ?? null,
    activePackage: activePackages[0] ?? null,
    lastAssessmentDate: lastAssessment?.createdAt ?? null,
    stats: { totalMinutes, lessonsCompletedCount, lastAssessmentAverage },
    lastAssessmentTopSkills,
  };
}
