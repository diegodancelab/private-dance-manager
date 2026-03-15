"use server";

import { prisma } from "@/lib/prisma";
import {
  BookingStatus,
  LessonType,
  UserRole,
} from "@/generated/prisma/client";
import { redirect } from "next/navigation";
import type { LessonFormState } from "./form-state";

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

function parseLessonType(value: FormDataEntryValue | null): LessonType {
  const parsed = String(value || "").trim();

  if (Object.values(LessonType).includes(parsed as LessonType)) {
    return parsed as LessonType;
  }

  return LessonType.PRIVATE;
}

function parseScheduledAt(value: FormDataEntryValue | null): Date {
  const parsed = String(value || "").trim();
  const date = new Date(parsed);

  if (!parsed || Number.isNaN(date.getTime())) {
    throw new Error("Scheduled date is invalid.");
  }

  return date;
}

function formatDateParam(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isValidDateTimeLocal(value: string): boolean {
  if (!value) {
    return false;
  }

  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function isValidDecimal(value: string): boolean {
  return /^\d+(\.\d{1,2})?$/.test(value);
}

export async function createLesson(
  _prevState: LessonFormState,
  formData: FormData
): Promise<LessonFormState> {
  const title = parseRequiredString(formData.get("title"));
  const description = String(formData.get("description") || "").trim();
  const lessonType = parseLessonType(formData.get("lessonType"));
  const scheduledAt = String(formData.get("scheduledAt") || "").trim();
  const durationMin = String(formData.get("durationMin") || "").trim();
  const priceAmount = String(formData.get("priceAmount") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const teacherId = parseRequiredString(formData.get("teacherId"));

  const state: LessonFormState = {
    success: false,
    message: "",
    fields: {
      id: "",
      title,
      description,
      lessonType,
      scheduledAt,
      durationMin,
      priceAmount,
      location,
      teacherId,
    },
    errors: {},
  };

  if (!title) {
    state.errors.title = "Title is required.";
  }

  if (!scheduledAt) {
    state.errors.scheduledAt = "Scheduled date is required.";
  } else if (!isValidDateTimeLocal(scheduledAt)) {
    state.errors.scheduledAt = "Scheduled date is invalid.";
  }

  const durationMinNumber = parseRequiredNumber(formData.get("durationMin"));
  if (!durationMin || Number.isNaN(durationMinNumber) || durationMinNumber <= 0) {
    state.errors.durationMin = "Duration must be greater than 0.";
  }

  if (priceAmount && !isValidDecimal(priceAmount)) {
    state.errors.priceAmount =
      "Price must be a valid amount with up to 2 decimals.";
  }

  if (!teacherId) {
    state.errors.teacherId = "Teacher is required.";
  }

  if (Object.keys(state.errors).length > 0) {
    return state;
  }

  const teacher = await prisma.user.findFirst({
    where: {
      id: teacherId,
      role: UserRole.TEACHER,
    },
    select: {
      id: true,
    },
  });

  if (!teacher) {
    return {
      ...state,
      errors: {
        teacherId: "Selected teacher was not found.",
      },
    };
  }

  const scheduledDate = parseScheduledAt(formData.get("scheduledAt"));
  const parsedDescription = parseOptionalString(formData.get("description"));
  const parsedPriceAmount = parseOptionalPrice(formData.get("priceAmount"));
  const parsedLocation = parseOptionalString(formData.get("location"));

  await prisma.lesson.create({
    data: {
      title,
      description: parsedDescription,
      lessonType,
      scheduledAt: scheduledDate,
      durationMin: durationMinNumber,
      priceAmount: parsedPriceAmount,
      location: parsedLocation,
      teacherId,
    },
  });

  redirect(`/calendar?date=${formatDateParam(scheduledDate)}`);
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
      status: BookingStatus.CONFIRMED,
    },
  });

  redirect(`/lessons/${lessonId}`);
}

export async function updateLesson(
  _prevState: LessonFormState,
  formData: FormData
): Promise<LessonFormState> {
  const id = parseRequiredString(formData.get("id"));
  const title = parseRequiredString(formData.get("title"));
  const description = String(formData.get("description") || "").trim();
  const lessonType = parseLessonType(formData.get("lessonType"));
  const scheduledAt = String(formData.get("scheduledAt") || "").trim();
  const durationMin = String(formData.get("durationMin") || "").trim();
  const priceAmount = String(formData.get("priceAmount") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const teacherId = parseRequiredString(formData.get("teacherId"));

  const state: LessonFormState = {
    success: false,
    message: "",
    fields: {
      id,
      title,
      description,
      lessonType,
      scheduledAt,
      durationMin,
      priceAmount,
      location,
      teacherId,
    },
    errors: {},
  };

  if (!id) {
    state.errors.form = "Lesson id is required.";
    return state;
  }

  if (!title) {
    state.errors.title = "Title is required.";
  }

  if (!scheduledAt) {
    state.errors.scheduledAt = "Scheduled date is required.";
  } else if (!isValidDateTimeLocal(scheduledAt)) {
    state.errors.scheduledAt = "Scheduled date is invalid.";
  }

  const durationMinNumber = parseRequiredNumber(formData.get("durationMin"));
  if (!durationMin || Number.isNaN(durationMinNumber) || durationMinNumber <= 0) {
    state.errors.durationMin = "Duration must be greater than 0.";
  }

  if (priceAmount && !isValidDecimal(priceAmount)) {
    state.errors.priceAmount =
      "Price must be a valid amount with up to 2 decimals.";
  }

  if (!teacherId) {
    state.errors.teacherId = "Teacher is required.";
  }

  if (Object.keys(state.errors).length > 0) {
    return state;
  }

  const existingLesson = await prisma.lesson.findFirst({
    where: {
      id,
    },
    select: {
      id: true,
    },
  });

  if (!existingLesson) {
    return {
      ...state,
      errors: {
        form: "Lesson not found.",
      },
    };
  }

  const teacher = await prisma.user.findFirst({
    where: {
      id: teacherId,
      role: UserRole.TEACHER,
    },
    select: {
      id: true,
    },
  });

  if (!teacher) {
    return {
      ...state,
      errors: {
        teacherId: "Selected teacher was not found.",
      },
    };
  }

  const scheduledDate = parseScheduledAt(formData.get("scheduledAt"));
  const parsedDescription = parseOptionalString(formData.get("description"));
  const parsedPriceAmount = parseOptionalPrice(formData.get("priceAmount"));
  const parsedLocation = parseOptionalString(formData.get("location"));

  await prisma.lesson.update({
    where: {
      id,
    },
    data: {
      title,
      description: parsedDescription,
      lessonType,
      scheduledAt: scheduledDate,
      durationMin: durationMinNumber,
      priceAmount: parsedPriceAmount,
      location: parsedLocation,
      teacherId,
    },
  });

  redirect(`/calendar?date=${formatDateParam(scheduledDate)}`);
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