"use server";

import { requireTeacherAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createLevel(formData: FormData): Promise<void> {
  const { user } = await requireTeacherAuth();

  const name = String(formData.get("name") || "").trim();
  const color = String(formData.get("color") || "#4f46e5").trim();

  if (!name) return;

  const count = await prisma.teacherLevel.count({ where: { teacherId: user.id } });

  await prisma.teacherLevel.create({
    data: { teacherId: user.id, name, color, order: count },
  });

  revalidatePath("/settings/levels");
}

export async function updateLevel(formData: FormData): Promise<void> {
  const { user } = await requireTeacherAuth();

  const id = String(formData.get("id") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const color = String(formData.get("color") || "").trim();

  if (!id || !name || !color) return;

  await prisma.teacherLevel.updateMany({
    where: { id, teacherId: user.id },
    data: { name, color },
  });

  revalidatePath("/settings/levels");
}

export async function deleteLevel(formData: FormData): Promise<void> {
  const { user } = await requireTeacherAuth();

  const id = String(formData.get("id") || "").trim();
  if (!id) return;

  await prisma.teacherLevel.deleteMany({ where: { id, teacherId: user.id } });

  revalidatePath("/settings/levels");
}

export async function reorderLevel(formData: FormData): Promise<void> {
  const { user } = await requireTeacherAuth();

  const id = String(formData.get("id") || "").trim();
  const direction = String(formData.get("direction") || "").trim();

  if (!id || (direction !== "up" && direction !== "down")) return;

  const levels = await prisma.teacherLevel.findMany({
    where: { teacherId: user.id },
    orderBy: { order: "asc" },
    select: { id: true, order: true },
  });

  const idx = levels.findIndex((l) => l.id === id);
  if (idx === -1) return;

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= levels.length) return;

  const a = levels[idx];
  const b = levels[swapIdx];

  await prisma.$transaction([
    prisma.teacherLevel.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.teacherLevel.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);

  revalidatePath("/settings/levels");
}

export async function assignStudentLevel(formData: FormData): Promise<void> {
  const { user } = await requireTeacherAuth();

  const studentId = String(formData.get("studentId") || "").trim();
  const levelId = String(formData.get("levelId") || "").trim();

  if (!studentId || !levelId) return;

  const level = await prisma.teacherLevel.findFirst({
    where: { id: levelId, teacherId: user.id },
    select: { id: true },
  });
  if (!level) return;

  await prisma.studentLevelAssignment.upsert({
    where: { teacherId_studentId: { teacherId: user.id, studentId } },
    create: { teacherId: user.id, studentId, levelId },
    update: { levelId, assignedAt: new Date() },
  });

  revalidatePath(`/students/${studentId}`);
}

export async function removeStudentLevel(formData: FormData): Promise<void> {
  const { user } = await requireTeacherAuth();

  const studentId = String(formData.get("studentId") || "").trim();
  if (!studentId) return;

  await prisma.studentLevelAssignment.deleteMany({
    where: { teacherId: user.id, studentId },
  });

  revalidatePath(`/students/${studentId}`);
}
