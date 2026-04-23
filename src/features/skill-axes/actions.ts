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

  const existing = await prisma.skillAxis.count({ where: { teacherId: user.id } });
  if (existing > 0) return;

  await prisma.skillAxis.createMany({
    data: DEFAULT_AXES.map((label, index) => ({
      teacherId: user.id,
      label,
      order: index + 1,
    })),
  });

  revalidatePath("/settings/skill-axes");
}

export async function createSkillAxis(formData: FormData): Promise<void> {
  const { user } = await requireTeacherAuth();
  const label = String(formData.get("label") || "").trim();

  if (!label) return;

  const maxOrder = await prisma.skillAxis.aggregate({
    where: { teacherId: user.id },
    _max: { order: true },
  });

  await prisma.skillAxis.create({
    data: {
      teacherId: user.id,
      label,
      order: (maxOrder._max.order ?? 0) + 1,
    },
  });

  revalidatePath("/settings/skill-axes");
}

export async function toggleSkillAxis(formData: FormData): Promise<void> {
  const { user } = await requireTeacherAuth();
  const axisId = String(formData.get("axisId") || "").trim();

  if (!axisId) return;

  const axis = await prisma.skillAxis.findFirst({
    where: { id: axisId, teacherId: user.id },
    select: { id: true, isActive: true },
  });
  if (!axis) return;

  await prisma.skillAxis.update({
    where: { id: axisId },
    data: { isActive: !axis.isActive },
  });

  revalidatePath("/settings/skill-axes");
}

export async function deleteSkillAxis(formData: FormData): Promise<void> {
  const { user } = await requireTeacherAuth();
  const axisId = String(formData.get("axisId") || "").trim();

  if (!axisId) return;

  // Only delete if no scores exist for this axis to avoid breaking historical data.
  const hasScores = await prisma.skillAxisScore.count({ where: { axisId } });
  if (hasScores > 0) {
    // Soft-delete: just deactivate.
    await prisma.skillAxis.updateMany({
      where: { id: axisId, teacherId: user.id },
      data: { isActive: false },
    });
  } else {
    await prisma.skillAxis.deleteMany({
      where: { id: axisId, teacherId: user.id },
    });
  }

  revalidatePath("/settings/skill-axes");
}
