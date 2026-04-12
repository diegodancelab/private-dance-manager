import { prisma } from "@/lib/prisma";

export type AssessmentScore = {
  axisId: string;
  axisLabel: string;
  score: number;
};

export type PortalAssessment = {
  id: string;
  createdAt: Date;
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

  return assessments.map((a) => ({
    id: a.id,
    createdAt: a.createdAt,
    scores: a.scores.map((s) => ({
      axisId: s.axisId,
      axisLabel: s.axis.label,
      score: s.score,
    })),
  }));
}
