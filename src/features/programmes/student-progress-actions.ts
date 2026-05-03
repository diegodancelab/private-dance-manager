"use server";

import { requireTeacherAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ProgrammeItemStatus } from "@/generated/prisma/client";

export async function assignProgramme(formData: FormData): Promise<void> {
  const { user } = await requireTeacherAuth();

  const programmeId = String(formData.get("programmeId") || "").trim();
  const studentId = String(formData.get("studentId") || "").trim();

  if (!programmeId || !studentId) return;

  const programme = await prisma.programme.findFirst({
    where: { id: programmeId, teacherId: user.id },
    select: { id: true },
  });
  if (!programme) return;

  await prisma.studentProgramme.deleteMany({
    where: { studentId, teacherId: user.id },
  });

  await prisma.studentProgramme.create({
    data: { programmeId, studentId, teacherId: user.id },
  });

  revalidatePath(`/students/${studentId}`);
}

export async function unassignProgramme(formData: FormData): Promise<void> {
  const { user } = await requireTeacherAuth();

  const studentProgrammeId = String(formData.get("studentProgrammeId") || "").trim();
  const studentId = String(formData.get("studentId") || "").trim();

  if (!studentProgrammeId || !studentId) return;

  await prisma.studentProgramme.deleteMany({
    where: { id: studentProgrammeId, teacherId: user.id },
  });

  revalidatePath(`/students/${studentId}`);
}

export async function updateItemStatus(formData: FormData): Promise<void> {
  const { user } = await requireTeacherAuth();

  const studentProgrammeId = String(formData.get("studentProgrammeId") || "").trim();
  const itemId = String(formData.get("itemId") || "").trim();
  const status = String(formData.get("status") || "").trim() as ProgrammeItemStatus;
  const studentId = String(formData.get("studentId") || "").trim();

  const validStatuses: ProgrammeItemStatus[] = ["NOT_STARTED", "INTRODUCED", "IN_PROGRESS", "MASTERED"];
  if (!studentProgrammeId || !itemId || !validStatuses.includes(status)) return;

  const sp = await prisma.studentProgramme.findFirst({
    where: { id: studentProgrammeId, teacherId: user.id },
    select: { id: true },
  });
  if (!sp) return;

  await prisma.studentProgrammeItemStatus.upsert({
    where: { studentProgrammeId_itemId: { studentProgrammeId, itemId } },
    create: { studentProgrammeId, itemId, status },
    update: { status },
  });

  revalidatePath(`/students/${studentId}`);
}
