"use server";

import { requireTeacherAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type AssessmentFormState = {
  success: boolean;
  error: string | null;
};

export async function createProgressionAssessment(
  _prevState: AssessmentFormState,
  formData: FormData
): Promise<AssessmentFormState> {
  const { user } = await requireTeacherAuth();

  const studentId = String(formData.get("studentId") || "").trim();
  const notes = String(formData.get("notes") || "").trim() || null;

  if (!studentId) {
    return { success: false, error: "Données manquantes." };
  }

  const scores: { axisId: string; score: number }[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("score_")) {
      const axisId = key.replace("score_", "");
      const score = parseInt(String(value), 10);
      if (!isNaN(score) && score >= 1 && score <= 10) {
        scores.push({ axisId, score });
      }
    }
  }

  if (scores.length === 0) {
    return { success: false, error: "Aucun score saisi." };
  }

  const axisIds = scores.map((s) => s.axisId);
  const axes = await prisma.skillAxis.findMany({
    where: { id: { in: axisIds }, teacherId: user.id, studentId },
    select: { id: true },
  });
  if (axes.length !== axisIds.length) {
    return { success: false, error: "Axes invalides." };
  }

  await prisma.skillAssessment.create({
    data: {
      studentId,
      teacherId: user.id,
      notes,
      scores: {
        create: scores.map((s) => ({ axisId: s.axisId, score: s.score })),
      },
    },
  });

  revalidatePath(`/students/${studentId}/progression`);
  return { success: true, error: null };
}

export async function deleteProgressionAssessment(
  formData: FormData
): Promise<void> {
  const { user } = await requireTeacherAuth();

  const assessmentId = String(formData.get("assessmentId") || "").trim();
  const studentId = String(formData.get("studentId") || "").trim();

  if (!assessmentId || !studentId) return;

  await prisma.skillAssessment.deleteMany({
    where: { id: assessmentId, teacherId: user.id, studentId },
  });

  revalidatePath(`/students/${studentId}/progression`);
}
