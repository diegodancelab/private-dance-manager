"use server";

import { requireTeacherAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ─── Programme CRUD ───────────────────────────────────────────────────────────

export async function createProgramme(formData: FormData): Promise<void> {
  const { user } = await requireTeacherAuth();

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const level = String(formData.get("level") || "").trim() || null;
  const danceStyle = String(formData.get("danceStyle") || "").trim() || null;

  if (!name) return;

  const programme = await prisma.programme.create({
    data: { teacherId: user.id, name, description, level, danceStyle },
    select: { id: true },
  });

  revalidatePath("/settings/programmes");
  redirect(`/settings/programmes/${programme.id}`);
}

export async function updateProgramme(formData: FormData): Promise<void> {
  const { user } = await requireTeacherAuth();

  const id = String(formData.get("id") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const level = String(formData.get("level") || "").trim() || null;
  const danceStyle = String(formData.get("danceStyle") || "").trim() || null;

  if (!id || !name) return;

  await prisma.programme.updateMany({
    where: { id, teacherId: user.id },
    data: { name, description, level, danceStyle },
  });

  revalidatePath(`/settings/programmes/${id}`);
}

export async function deleteProgramme(formData: FormData): Promise<void> {
  const { user } = await requireTeacherAuth();

  const id = String(formData.get("id") || "").trim();
  if (!id) return;

  await prisma.programme.deleteMany({ where: { id, teacherId: user.id } });

  revalidatePath("/settings/programmes");
  redirect("/settings/programmes");
}

// ─── Section CRUD ─────────────────────────────────────────────────────────────

export async function createSection(formData: FormData): Promise<void> {
  const { user } = await requireTeacherAuth();

  const programmeId = String(formData.get("programmeId") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const subtitle = String(formData.get("subtitle") || "").trim() || null;
  const description = String(formData.get("description") || "").trim() || null;

  if (!programmeId || !title) return;

  const programme = await prisma.programme.findFirst({
    where: { id: programmeId, teacherId: user.id },
    select: { _count: { select: { sections: true } } },
  });
  if (!programme) return;

  await prisma.programmeSection.create({
    data: {
      programmeId,
      title,
      subtitle,
      description,
      order: programme._count.sections,
    },
  });

  revalidatePath(`/settings/programmes/${programmeId}`);
}

export async function updateSection(formData: FormData): Promise<void> {
  const { user } = await requireTeacherAuth();

  const id = String(formData.get("id") || "").trim();
  const programmeId = String(formData.get("programmeId") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const subtitle = String(formData.get("subtitle") || "").trim() || null;
  const description = String(formData.get("description") || "").trim() || null;

  if (!id || !programmeId || !title) return;

  const programme = await prisma.programme.findFirst({
    where: { id: programmeId, teacherId: user.id },
    select: { id: true },
  });
  if (!programme) return;

  await prisma.programmeSection.updateMany({
    where: { id, programmeId },
    data: { title, subtitle, description },
  });

  revalidatePath(`/settings/programmes/${programmeId}`);
}

export async function deleteSection(formData: FormData): Promise<void> {
  const { user } = await requireTeacherAuth();

  const id = String(formData.get("id") || "").trim();
  const programmeId = String(formData.get("programmeId") || "").trim();

  if (!id || !programmeId) return;

  const programme = await prisma.programme.findFirst({
    where: { id: programmeId, teacherId: user.id },
    select: { id: true },
  });
  if (!programme) return;

  await prisma.programmeSection.deleteMany({ where: { id, programmeId } });

  revalidatePath(`/settings/programmes/${programmeId}`);
}

// ─── Item CRUD ────────────────────────────────────────────────────────────────

export async function createItem(formData: FormData): Promise<void> {
  const { user } = await requireTeacherAuth();

  const sectionId = String(formData.get("sectionId") || "").trim();
  const programmeId = String(formData.get("programmeId") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const nameAlt = String(formData.get("nameAlt") || "").trim() || null;
  const description = String(formData.get("description") || "").trim() || null;
  const isMandatory = formData.get("isMandatory") !== "false";

  if (!sectionId || !programmeId || !name) return;

  const programme = await prisma.programme.findFirst({
    where: { id: programmeId, teacherId: user.id },
    select: { id: true },
  });
  if (!programme) return;

  const section = await prisma.programmeSection.findFirst({
    where: { id: sectionId, programmeId },
    select: { _count: { select: { items: true } } },
  });
  if (!section) return;

  await prisma.programmeItem.create({
    data: {
      sectionId,
      name,
      nameAlt,
      description,
      isMandatory,
      order: section._count.items,
    },
  });

  revalidatePath(`/settings/programmes/${programmeId}`);
}

export async function updateItem(formData: FormData): Promise<void> {
  const { user } = await requireTeacherAuth();

  const id = String(formData.get("id") || "").trim();
  const sectionId = String(formData.get("sectionId") || "").trim();
  const programmeId = String(formData.get("programmeId") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const nameAlt = String(formData.get("nameAlt") || "").trim() || null;
  const description = String(formData.get("description") || "").trim() || null;
  const isMandatory = formData.get("isMandatory") !== "false";

  if (!id || !sectionId || !programmeId || !name) return;

  const programme = await prisma.programme.findFirst({
    where: { id: programmeId, teacherId: user.id },
    select: { id: true },
  });
  if (!programme) return;

  await prisma.programmeItem.updateMany({
    where: { id, sectionId },
    data: { name, nameAlt, description, isMandatory },
  });

  revalidatePath(`/settings/programmes/${programmeId}`);
}

export async function deleteItem(formData: FormData): Promise<void> {
  const { user } = await requireTeacherAuth();

  const id = String(formData.get("id") || "").trim();
  const sectionId = String(formData.get("sectionId") || "").trim();
  const programmeId = String(formData.get("programmeId") || "").trim();

  if (!id || !sectionId || !programmeId) return;

  const programme = await prisma.programme.findFirst({
    where: { id: programmeId, teacherId: user.id },
    select: { id: true },
  });
  if (!programme) return;

  await prisma.programmeItem.deleteMany({ where: { id, sectionId } });

  revalidatePath(`/settings/programmes/${programmeId}`);
}
