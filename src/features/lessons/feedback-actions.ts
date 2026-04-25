"use server";

import { requireTeacherAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ── Lesson Feedback ──────────────────────────────────────────────────────────

export type LessonFeedbackFormState = {
  success: boolean;
  errors: { form?: string };
};

export async function saveLessonFeedback(
  _prevState: LessonFeedbackFormState,
  formData: FormData
): Promise<LessonFeedbackFormState> {
  const { user } = await requireTeacherAuth();

  const lessonId = String(formData.get("lessonId") || "").trim();
  const studentId = String(formData.get("studentId") || "").trim();
  const videoUrl = String(formData.get("videoUrl") || "").trim() || null;
  const studentFeedback = String(formData.get("studentFeedback") || "").trim() || null;
  const internalNotes = String(formData.get("internalNotes") || "").trim() || null;

  const empty: LessonFeedbackFormState = { success: false, errors: {} };

  if (!lessonId || !studentId) {
    return { ...empty, errors: { form: "Données manquantes." } };
  }

  // Verify teacher owns the lesson.
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, teacherId: user.id },
    select: { id: true },
  });
  if (!lesson) {
    return { ...empty, errors: { form: "Cours introuvable." } };
  }

  await prisma.lessonFeedback.upsert({
    where: { lessonId_studentId: { lessonId, studentId } },
    create: { lessonId, studentId, teacherId: user.id, videoUrl, studentFeedback, internalNotes },
    update: { videoUrl, studentFeedback, internalNotes },
  });

  revalidatePath(`/lessons/${lessonId}`);
  return { success: true, errors: {} };
}

// ── Skill Assessment ─────────────────────────────────────────────────────────

export type SkillAssessmentFormState = {
  success: boolean;
  errors: { form?: string };
};

export async function saveSkillAssessment(
  _prevState: SkillAssessmentFormState,
  formData: FormData
): Promise<SkillAssessmentFormState> {
  const { user } = await requireTeacherAuth();

  const lessonId = String(formData.get("lessonId") || "").trim() || null;
  const studentId = String(formData.get("studentId") || "").trim();
  const assessmentId = String(formData.get("assessmentId") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;

  const empty: SkillAssessmentFormState = { success: false, errors: {} };

  if (!studentId) {
    return { ...empty, errors: { form: "Données manquantes." } };
  }

  // Collect axis scores from formData: fields named `score_<axisId>`
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
    return { ...empty, errors: { form: "Aucun score saisi." } };
  }

  // Verify teacher owns the axes and they belong to this student.
  const axisIds = scores.map((s) => s.axisId);
  const axes = await prisma.skillAxis.findMany({
    where: { id: { in: axisIds }, teacherId: user.id, studentId },
    select: { id: true },
  });
  if (axes.length !== axisIds.length) {
    return { ...empty, errors: { form: "Axes invalides." } };
  }

  if (assessmentId) {
    // Update existing assessment.
    await prisma.skillAssessment.updateMany({
      where: { id: assessmentId, teacherId: user.id },
      data: { notes },
    });
    // Upsert scores.
    await Promise.all(
      scores.map((s) =>
        prisma.skillAxisScore.upsert({
          where: { assessmentId_axisId: { assessmentId, axisId: s.axisId } },
          create: { assessmentId, axisId: s.axisId, score: s.score },
          update: { score: s.score },
        })
      )
    );
  } else {
    // Create new assessment with scores.
    const assessment = await prisma.skillAssessment.create({
      data: {
        studentId,
        teacherId: user.id,
        lessonId,
        notes,
        scores: {
          create: scores.map((s) => ({ axisId: s.axisId, score: s.score })),
        },
      },
    });
    if (lessonId) {
      revalidatePath(`/lessons/${lessonId}`);
    }
    void assessment;
  }

  if (lessonId) {
    revalidatePath(`/lessons/${lessonId}`);
  }
  return { success: true, errors: {} };
}
