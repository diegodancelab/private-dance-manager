"use server";

import { requireTeacherAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const DEFAULT_AXES = [
  "Niveau technique",
  "Pas de base",
  "Leading / Following",
  "Musicalité",
  "Combo",
  "Flow",
  "Mémoire",
  "Posture / Connexion",
];

export async function createDefaultAxes(): Promise<void> {
  const { user } = await requireTeacherAuth();

  const existing = await prisma.skillAxis.count({
    where: { teacherId: user.id, studentId: null },
  });
  if (existing > 0) return;

  await prisma.skillAxis.createMany({
    data: DEFAULT_AXES.map((label, index) => ({
      teacherId: user.id,
      studentId: null,
      label,
      order: index + 1,
    })),
  });

  revalidatePath("/settings/skill-axes");
}

export async function createSkillAxis(formData: FormData): Promise<void> {
  const { user } = await requireTeacherAuth();
  const label = String(formData.get("label") || "").trim();
  const studentId = String(formData.get("studentId") || "").trim() || null;

  if (!label) return;

  const maxOrder = await prisma.skillAxis.aggregate({
    where: { teacherId: user.id, studentId },
    _max: { order: true },
  });

  await prisma.skillAxis.create({
    data: {
      teacherId: user.id,
      studentId,
      label,
      order: (maxOrder._max.order ?? 0) + 1,
    },
  });

  if (studentId) {
    revalidatePath(`/students/${studentId}/progression`);
  } else {
    revalidatePath("/settings/skill-axes");
  }
}

export async function toggleSkillAxis(formData: FormData): Promise<void> {
  const { user } = await requireTeacherAuth();
  const axisId = String(formData.get("axisId") || "").trim();
  const studentId = String(formData.get("studentId") || "").trim() || null;

  if (!axisId) return;

  const axis = await prisma.skillAxis.findFirst({
    where: { id: axisId, teacherId: user.id, studentId },
    select: { id: true, isActive: true },
  });
  if (!axis) return;

  await prisma.skillAxis.update({
    where: { id: axisId },
    data: { isActive: !axis.isActive },
  });

  if (studentId) {
    revalidatePath(`/students/${studentId}/progression`);
  } else {
    revalidatePath("/settings/skill-axes");
  }
}

export async function deleteSkillAxis(formData: FormData): Promise<void> {
  const { user } = await requireTeacherAuth();
  const axisId = String(formData.get("axisId") || "").trim();
  const studentId = String(formData.get("studentId") || "").trim() || null;

  if (!axisId) return;

  const hasScores = await prisma.skillAxisScore.count({ where: { axisId } });
  if (hasScores > 0) {
    await prisma.skillAxis.updateMany({
      where: { id: axisId, teacherId: user.id, studentId },
      data: { isActive: false },
    });
  } else {
    await prisma.skillAxis.deleteMany({
      where: { id: axisId, teacherId: user.id, studentId },
    });
  }

  if (studentId) {
    revalidatePath(`/students/${studentId}/progression`);
  } else {
    revalidatePath("/settings/skill-axes");
  }
}

/**
 * Clones the teacher's template axes to a student on first access.
 * No-op if the student already has their own axes.
 */
export async function ensureStudentAxes(
  studentId: string,
  teacherId: string
): Promise<void> {
  const existing = await prisma.skillAxis.count({
    where: { teacherId, studentId },
  });
  if (existing > 0) return;

  const template = await prisma.skillAxis.findMany({
    where: { teacherId, studentId: null, isActive: true },
    orderBy: { order: "asc" },
    select: { label: true, order: true },
  });

  if (template.length === 0) return;

  await prisma.skillAxis.createMany({
    data: template.map((axis) => ({
      teacherId,
      studentId,
      label: axis.label,
      order: axis.order,
      isActive: true,
    })),
  });
}
