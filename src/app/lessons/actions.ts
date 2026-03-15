"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const allowedLessonTypes = ["PRIVATE", "DUO", "GROUP", "ONLINE"] as const;
type AllowedLessonType = (typeof allowedLessonTypes)[number];

function parseRequiredString(value: FormDataEntryValue | null): string {
  return String(value || "").trim();
}

function parseOptionalString(value: FormDataEntryValue | null): string | null {
  const parsed = String(value || "").trim();
  return parsed === "" ? null : parsed;
}

function parseRequiredNumber(value: FormDataEntryValue | null): number {
  return Number(String(value || "").trim());
}

function parseOptionalPrice(value: FormDataEntryValue | null): string | null {
  const parsed = String(value || "").trim();
  return parsed === "" ? null : parsed;
}

function parseLessonType(value: FormDataEntryValue | null): AllowedLessonType {
  const parsed = String(value || "").trim();

  if (allowedLessonTypes.includes(parsed as AllowedLessonType)) {
    return parsed as AllowedLessonType;
  }

  return "PRIVATE";
}

function parseScheduledAt(value: FormDataEntryValue | null): Date {
  const parsed = String(value || "").trim();
  const date = new Date(parsed);

  if (!parsed || Number.isNaN(date.getTime())) {
    throw new Error("Scheduled date is invalid.");
  }

  return date;
}

export async function createLesson(formData: FormData) {
  const title = parseRequiredString(formData.get("title"));
  const description = parseOptionalString(formData.get("description"));
  const lessonType = parseLessonType(formData.get("lessonType"));
  const scheduledAt = parseScheduledAt(formData.get("scheduledAt"));
  const durationMin = parseRequiredNumber(formData.get("durationMin"));
  const priceAmount = parseOptionalPrice(formData.get("priceAmount"));
  const location = parseOptionalString(formData.get("location"));
  const teacherId = parseRequiredString(formData.get("teacherId"));

  if (!title || !teacherId || durationMin <= 0) {
    throw new Error(
      "Title, scheduled date, duration and teacher are required."
    );
  }

  const lesson = await prisma.lesson.create({
    data: {
      title,
      description,
      lessonType,
      scheduledAt,
      durationMin,
      priceAmount,
      location,
      teacherId,
    },
  });

  redirect(`/lessons/${lesson.id}`);
}

export async function addLessonParticipant(formData: FormData) {
  const lessonId = parseRequiredString(formData.get("lessonId"));
  const userId = parseRequiredString(formData.get("userId"));

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
  const id = parseRequiredString(formData.get("id"));
  const title = parseRequiredString(formData.get("title"));
  const description = parseOptionalString(formData.get("description"));
  const lessonType = parseLessonType(formData.get("lessonType"));
  const scheduledAt = parseScheduledAt(formData.get("scheduledAt"));
  const durationMin = parseRequiredNumber(formData.get("durationMin"));
  const priceAmount = parseOptionalPrice(formData.get("priceAmount"));
  const location = parseOptionalString(formData.get("location"));
  const teacherId = parseRequiredString(formData.get("teacherId"));

  if (!id || !title || !teacherId || durationMin <= 0) {
    throw new Error(
      "Id, title, scheduled date, duration and teacher are required."
    );
  }

  await prisma.lesson.update({
    where: {
      id,
    },
    data: {
      title,
      description,
      lessonType,
      scheduledAt,
      durationMin,
      priceAmount,
      location,
      teacherId,
    },
  });

  redirect(`/lessons/${id}`);
}

export async function removeLessonParticipant(formData: FormData) {
  const participantId = parseRequiredString(formData.get("participantId"));
  const lessonId = parseRequiredString(formData.get("lessonId"));

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

export async function deleteLesson(formData: FormData) {
  const lessonId = parseRequiredString(formData.get("lessonId"));

  if (!lessonId) {
    throw new Error("Lesson id is required.");
  }

  await prisma.lesson.delete({
    where: {
      id: lessonId,
    },
  });

  redirect("/lessons");
}