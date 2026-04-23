import { prisma } from "@/lib/prisma";

export type TeacherAssessment = {
  id: string;
  createdAt: Date;
  notes: string | null;
  avgScore: number;
  scores: { axisId: string; axisLabel: string; score: number }[];
};

export type TeacherAxis = {
  id: string;
  label: string;
  order: number;
};

export type StudentProgressionData = {
  assessments: TeacherAssessment[];
  axes: TeacherAxis[];
};

export async function getStudentProgressionHistory(
  studentId: string,
  teacherId: string
): Promise<StudentProgressionData> {
  const [rawAssessments, axes] = await Promise.all([
    prisma.skillAssessment.findMany({
      where: { studentId, teacherId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        notes: true,
        scores: {
          select: {
            axisId: true,
            score: true,
            axis: { select: { label: true } },
          },
          orderBy: { axis: { order: "asc" } },
        },
      },
    }),
    prisma.skillAxis.findMany({
      where: { teacherId, isActive: true },
      orderBy: { order: "asc" },
      select: { id: true, label: true, order: true },
    }),
  ]);

  const assessments: TeacherAssessment[] = rawAssessments.map((a) => {
    const scores = a.scores.map((s) => ({
      axisId: s.axisId,
      axisLabel: s.axis.label,
      score: s.score,
    }));
    const avgScore =
      scores.length > 0
        ? Math.round((scores.reduce((sum, s) => sum + s.score, 0) / scores.length) * 10) / 10
        : 0;
    return { id: a.id, createdAt: a.createdAt, notes: a.notes, avgScore, scores };
  });

  return { assessments, axes };
}
