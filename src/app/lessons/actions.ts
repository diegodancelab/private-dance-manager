"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createLesson(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const lessonType = String(formData.get("lessonType") || "PRIVATE").trim();
  const scheduledAt = String(formData.get("scheduledAt") || "").trim();
  const durationMin = Number(formData.get("durationMin") || 0);
  const priceAmount = String(formData.get("priceAmount") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const teacherId = String(formData.get("teacherId") || "").trim();

  if (!title || !lessonType || !scheduledAt || !durationMin || !teacherId) {
    throw new Error("Title, lesson type, scheduled date, duration and teacher are required.");
  }

  const lesson = await prisma.lesson.create({
    data: {
      title,
      description: description || null,
      lessonType: lessonType as "PRIVATE" | "DUO" | "GROUP" | "ONLINE",
      scheduledAt: new Date(scheduledAt),
      durationMin,
      priceAmount: priceAmount ? priceAmount : null,
      location: location || null,
      teacherId,
    },
  });

  redirect(`/lessons/${lesson.id}`);
}

export async function addLessonParticipant(formData: FormData) {
  const lessonId = String(formData.get("lessonId") || "").trim();
  const userId = String(formData.get("userId") || "").trim();

  if (!lessonId || !userId) {
    throw new Error("Lesson id and user id are required.");
  }

  await prisma.lessonParticipant.create({
    data: {
      lessonId,
      userId,
      status: "CONFIRMED",
    },
  });

  redirect(`/lessons/${lessonId}`);
}

export async function updateLesson(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const lessonType = String(formData.get("lessonType") || "PRIVATE").trim();
  const scheduledAt = String(formData.get("scheduledAt") || "").trim();
  const durationMin = Number(formData.get("durationMin") || 0);
  const priceAmount = String(formData.get("priceAmount") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const teacherId = String(formData.get("teacherId") || "").trim();

  if (!id || !title || !lessonType || !scheduledAt || !durationMin || !teacherId) {
    throw new Error("Id, title, lesson type, scheduled date, duration and teacher are required.");
  }

  await prisma.lesson.update({
    where: {
      id,
    },
    data: {
      title,
      description: description || null,
      lessonType: lessonType as "PRIVATE" | "DUO" | "GROUP" | "ONLINE",
      scheduledAt: new Date(scheduledAt),
      durationMin,
      priceAmount: priceAmount || null,
      location: location || null,
      teacherId,
    },
  });

  redirect(`/lessons/${id}`);
}

export async function removeLessonParticipant(formData: FormData) {
  const participantId = String(formData.get("participantId") || "").trim();
  const lessonId = String(formData.get("lessonId") || "").trim();

  if (!participantId || !lessonId) {
    throw new Error("Participant id and lesson id are required.");
  }

  await prisma.lessonParticipant.delete({
    where: {
      id: participantId,
    },
  });

  redirect(`/lessons/${lessonId}`);
}