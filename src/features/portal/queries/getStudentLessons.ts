import { prisma } from "@/lib/prisma";
import { LessonStatus } from "@/generated/prisma/client";

export type PortalLesson = {
  id: string;
  title: string;
  scheduledAt: Date;
  durationMin: number;
  lessonType: string;
  location: string | null;
  teacherName: string;
  feedback: {
    studentFeedback: string | null;
  } | null;
};

export type StudentLessonsData = {
  upcoming: PortalLesson[];
  past: PortalLesson[];
  canceled: PortalLesson[];
};

export async function getStudentLessons(
  studentId: string
): Promise<StudentLessonsData> {
  const now = new Date();

  const lessonSelect = {
    id: true,
    title: true,
    scheduledAt: true,
    durationMin: true,
    lessonType: true,
    location: true,
    teacher: { select: { firstName: true, lastName: true } },
    feedbacks: {
      where: { studentId },
      select: { studentFeedback: true },
      take: 1,
    },
  };

  const [upcomingParticipations, pastParticipations, canceledParticipations] =
    await Promise.all([
      prisma.lessonParticipant.findMany({
        where: {
          userId: studentId,
          lesson: { scheduledAt: { gte: now }, status: LessonStatus.SCHEDULED },
        },
        orderBy: { lesson: { scheduledAt: "asc" } },
        take: 20,
        select: { lesson: { select: lessonSelect } },
      }),

      prisma.lessonParticipant.findMany({
        where: {
          userId: studentId,
          lesson: { scheduledAt: { lt: now }, status: LessonStatus.SCHEDULED },
        },
        orderBy: { lesson: { scheduledAt: "desc" } },
        take: 20,
        select: { lesson: { select: lessonSelect } },
      }),

      prisma.lessonParticipant.findMany({
        where: {
          userId: studentId,
          lesson: { status: LessonStatus.CANCELED },
        },
        orderBy: { lesson: { scheduledAt: "desc" } },
        take: 20,
        select: { lesson: { select: lessonSelect } },
      }),
    ]);

  function mapLesson(
    p: (typeof upcomingParticipations)[number]
  ): PortalLesson {
    const fb = p.lesson.feedbacks[0] ?? null;
    return {
      id: p.lesson.id,
      title: p.lesson.title,
      scheduledAt: p.lesson.scheduledAt,
      durationMin: p.lesson.durationMin,
      lessonType: p.lesson.lessonType,
      location: p.lesson.location,
      teacherName: `${p.lesson.teacher.firstName} ${p.lesson.teacher.lastName}`,
      feedback: fb
        ? { studentFeedback: fb.studentFeedback }
        : null,
    };
  }

  return {
    upcoming: upcomingParticipations.map(mapLesson),
    past: pastParticipations.map(mapLesson),
    canceled: canceledParticipations.map(mapLesson),
  };
}
