import { prisma } from "@/lib/prisma";

export type AssessmentScore = {
  axisId: string;
  axisLabel: string;
  score: number;
};

export type PortalAssessment = {
  id: string;
  createdAt: Date;
  notes: string | null;
  averageScore: number;
  teacher: { firstName: string; lastName: string };
  scores: AssessmentScore[];
};

export async function getStudentAssessments(
  studentId: string,
  limit = 5
): Promise<PortalAssessment[]> {
  const assessments = await prisma.skillAssessment.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      createdAt: true,
      notes: true,
      teacher: { select: { firstName: true, lastName: true } },
      scores: {
        select: {
          axisId: true,
          score: true,
          axis: { select: { label: true } },
        },
        orderBy: { axis: { order: "asc" } },
      },
    },
  });

  return assessments.map((a) => {
    const scores = a.scores.map((s) => ({
      axisId: s.axisId,
      axisLabel: s.axis.label,
      score: s.score,
    }));
    const averageScore =
      scores.length > 0
        ? Math.round(
            (scores.reduce((sum, s) => sum + s.score, 0) / scores.length) * 10
          ) / 10
        : 0;
    return {
      id: a.id,
      createdAt: a.createdAt,
      notes: a.notes,
      averageScore,
      teacher: a.teacher,
      scores,
    };
  });
}
