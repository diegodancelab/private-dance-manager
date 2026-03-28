"use server";

import { prisma } from "@/lib/prisma";
import {
  BookingStatus,
  LessonType,
  PackageStatus,
  Prisma,
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

function parseBookingStatus(value: FormDataEntryValue | null): BookingStatus {
  const parsed = String(value || "").trim();

  if (Object.values(BookingStatus).includes(parsed as BookingStatus)) {
    return parsed as BookingStatus;
  }

  return BookingStatus.CONFIRMED;
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
  const studentId = String(formData.get("studentId") || "").trim();
  const bookingStatus = parseBookingStatus(formData.get("bookingStatus"));

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
      studentId,
      bookingStatus,
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

  if (studentId) {
    const student = await prisma.user.findFirst({
      where: {
        id: studentId,
        role: UserRole.STUDENT,
      },
      select: {
        id: true,
      },
    });

    if (!student) {
      return {
        ...state,
        errors: {
          studentId: "Selected student was not found.",
        },
      };
    }
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
      participants: studentId
        ? {
            create: {
              userId: studentId,
              status: bookingStatus,
            },
          }
        : undefined,
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

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true },
  });

  if (!lesson) {
    throw new Error("Lesson not found.");
  }

  const student = await prisma.user.findFirst({
    where: { id: userId, role: UserRole.STUDENT },
    select: { id: true },
  });

  if (!student) {
    throw new Error("Student not found.");
  }

  try {
    await prisma.lessonParticipant.create({
      data: {
        lessonId,
        userId,
        status: BookingStatus.CONFIRMED,
      },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      throw new Error("This student is already assigned to this lesson.");
    }
    throw err;
  }

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
      studentId: "",
      bookingStatus: BookingStatus.CONFIRMED,
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

  const participant = await prisma.lessonParticipant.findUnique({
    where: { id: participantId },
    select: { lessonId: true },
  });

  if (!participant) {
    throw new Error("Participant not found.");
  }

  if (participant.lessonId !== lessonId) {
    throw new Error("Participant does not belong to this lesson.");
  }

  await prisma.lessonParticipant.delete({
    where: { id: participantId },
  });

  redirect(`/lessons/${lessonId}`);
}

export async function assignPackageToParticipant(formData: FormData) {
  const participantId = parseRequiredString(formData.get("participantId"));
  const packageId = parseRequiredString(formData.get("packageId"));
  const lessonId = parseRequiredString(formData.get("lessonId"));

  if (!participantId || !packageId || !lessonId) {
    throw new Error("Missing required fields.");
  }

  try {
  await prisma.$transaction(async (tx) => {
    const lesson = await tx.lesson.findUnique({
      where: { id: lessonId },
      select: { durationMin: true },
    });

    if (!lesson) throw new Error("Lesson not found.");

    const participant = await tx.lessonParticipant.findUnique({
      where: { id: participantId },
      select: { userId: true },
    });

    if (!participant) throw new Error("Participant not found.");

    const pkg = await tx.package.findUnique({
      where: { id: packageId },
      select: { remainingMinutes: true, status: true, userId: true, expiresAt: true },
    });

    if (!pkg) throw new Error("Package not found.");

    if (pkg.status !== PackageStatus.ACTIVE) {
      throw new Error("Package is not active.");
    }

    if (pkg.expiresAt !== null && pkg.expiresAt < new Date()) {
      throw new Error("Package has expired.");
    }

    if (pkg.userId !== participant.userId) {
      throw new Error("Package does not belong to this student.");
    }

    const minutesConsumed = Math.min(lesson.durationMin, pkg.remainingMinutes);
    const newRemaining = pkg.remainingMinutes - minutesConsumed;

    await tx.packageUsage.create({
      data: {
        packageId,
        lessonParticipantId: participantId,
        minutesConsumed,
      },
    });

    await tx.package.update({
      where: { id: packageId },
      data: {
        remainingMinutes: newRemaining,
        status: newRemaining === 0 ? PackageStatus.EXHAUSTED : PackageStatus.ACTIVE,
      },
    });
  });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      throw new Error("A package is already assigned to this participant.");
    }
    throw err;
  }

  redirect(`/lessons/${lessonId}`);
}

export async function removePackageFromParticipant(formData: FormData) {
  const usageId = parseRequiredString(formData.get("usageId"));
  const lessonId = parseRequiredString(formData.get("lessonId"));

  if (!usageId || !lessonId) {
    throw new Error("Missing required fields.");
  }

  await prisma.$transaction(async (tx) => {
    const usage = await tx.packageUsage.findUnique({
      where: { id: usageId },
      select: { minutesConsumed: true, packageId: true },
    });

    if (!usage) throw new Error("Package usage not found.");

    const pkg = await tx.package.findUnique({
      where: { id: usage.packageId },
      select: { remainingMinutes: true, totalMinutes: true, status: true },
    });

    if (!pkg) throw new Error("Package not found.");

    const newRemaining = Math.min(
      pkg.remainingMinutes + usage.minutesConsumed,
      pkg.totalMinutes
    );

    const newStatus =
      pkg.status === PackageStatus.EXHAUSTED
        ? PackageStatus.ACTIVE
        : pkg.status;

    await tx.packageUsage.delete({ where: { id: usageId } });
    await tx.package.update({
      where: { id: usage.packageId },
      data: {
        remainingMinutes: newRemaining,
        status: newStatus,
      },
    });
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