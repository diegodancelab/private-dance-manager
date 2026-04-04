"use server";

import { requireTeacherAuth } from "@/lib/auth/require-auth";
import {
  zurichLocalToUtc,
  utcToZurichDate,
  isValidDatetimeLocal,
} from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import {
  BookingStatus,
  ChargeType,
  LessonType,
  PackageStatus,
  Prisma,
  UserRole,
} from "@/generated/prisma/client";
import type { BillingMode } from "./form-state";
import { redirect } from "@/i18n/navigation";
import type { LessonFormState } from "./form-state";
import {
  DomainError,
  withFormAction,
  handleNonFormActionError,
} from "@/lib/errors";

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

  throw new Error(`Invalid booking status: "${parsed}"`);
}


function isValidDecimal(value: string): boolean {
  return /^\d+(\.\d{1,2})?$/.test(value);
}

function parseBillingMode(value: FormDataEntryValue | null): BillingMode {
  const parsed = String(value || "").trim();
  if (parsed === "UNIT" || parsed === "PACKAGE") return parsed;
  return "FREE";
}

export const createLesson = withFormAction(async function createLesson(
  _prevState: LessonFormState,
  formData: FormData
): Promise<LessonFormState> {
  const { user } = await requireTeacherAuth();
  const teacherId = user.id;

  const title = parseRequiredString(formData.get("title"));
  const description = String(formData.get("description") || "").trim();
  const lessonType = parseLessonType(formData.get("lessonType"));
  const scheduledAt = String(formData.get("scheduledAt") || "").trim();
  const durationMin = String(formData.get("durationMin") || "").trim();
  const priceAmount = String(formData.get("priceAmount") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const studentId = String(formData.get("studentId") || "").trim();
  const bookingStatus = parseBookingStatus(formData.get("bookingStatus"));
  const rawBillingMode = parseBillingMode(formData.get("billingMode"));
  // If no student is selected, billing mode is always FREE
  const billingMode: BillingMode = studentId ? rawBillingMode : "FREE";
  const packageId = String(formData.get("packageId") || "").trim();

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
      studentId,
      bookingStatus,
      billingMode,
      packageId,
    },
    errors: {},
  };

  if (!title) {
    state.errors.title = "Title is required.";
  }

  if (!scheduledAt) {
    state.errors.scheduledAt = "Scheduled date is required.";
  } else if (!isValidDatetimeLocal(scheduledAt)) {
    state.errors.scheduledAt = "Scheduled date is invalid.";
  }

  const durationMinNumber = parseRequiredNumber(formData.get("durationMin"));
  if (
    !durationMin ||
    Number.isNaN(durationMinNumber) ||
    durationMinNumber <= 0 ||
    !Number.isInteger(durationMinNumber)
  ) {
    state.errors.durationMin = "Duration must be a positive integer (minutes).";
  }

  if (priceAmount && !isValidDecimal(priceAmount)) {
    state.errors.priceAmount =
      "Price must be a valid amount with up to 2 decimals.";
  }

  if (studentId && billingMode === "PACKAGE" && !packageId) {
    state.errors.packageId = "Please select a package.";
  }

  if (Object.keys(state.errors).length > 0) {
    return state;
  }

  if (studentId) {
    const student = await prisma.user.findFirst({
      where: {
        id: studentId,
        role: UserRole.STUDENT,
        createdByTeacherId: teacherId,
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

  const scheduledDate = zurichLocalToUtc(scheduledAt);
  const parsedDescription = parseOptionalString(formData.get("description"));
  const parsedPriceAmount = parseOptionalPrice(formData.get("priceAmount"));
  const parsedLocation = parseOptionalString(formData.get("location"));

  const newEndTime = new Date(scheduledDate.getTime() + durationMinNumber * 60 * 1000);
  const nearbyLessons = await prisma.lesson.findMany({
    where: { teacherId, scheduledAt: { lt: newEndTime } },
    select: { id: true, scheduledAt: true, durationMin: true },
  });
  const conflict = nearbyLessons.find((l) => {
    const lessonEnd = new Date(l.scheduledAt.getTime() + l.durationMin * 60 * 1000);
    return lessonEnd > scheduledDate;
  });

  if (conflict) {
    return {
      ...state,
      errors: {
        scheduledAt: "This teacher already has a lesson scheduled at this time.",
      },
    };
  }

  await prisma.$transaction(async (tx) => {
    const lesson = await tx.lesson.create({
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
          ? { create: { userId: studentId, status: bookingStatus } }
          : undefined,
      },
      select: { id: true },
    });

    if (studentId && billingMode === "UNIT") {
      const chargeAmount = parsedPriceAmount ?? "0";
      await tx.charge.create({
        data: {
          userId: studentId,
          teacherId,
          lessonId: lesson.id,
          type: ChargeType.LESSON,
          title,
          amount: chargeAmount,
          currency: "CHF",
        },
      });
    }

    if (studentId && billingMode === "PACKAGE" && packageId) {
      const lp = await tx.lessonParticipant.findUnique({
        where: { lessonId_userId: { lessonId: lesson.id, userId: studentId } },
        select: { id: true },
      });

      if (lp) {
        const pkg = await tx.package.findFirst({
          where: {
            id: packageId,
            teacherId,
            status: PackageStatus.ACTIVE,
            participants: { some: { userId: studentId } },
          },
          select: { remainingMinutes: true },
        });

        if (pkg && pkg.remainingMinutes > 0) {
          const minutesConsumed = Math.min(durationMinNumber, pkg.remainingMinutes);
          const newRemaining = pkg.remainingMinutes - minutesConsumed;

          await tx.packageUsage.create({
            data: { packageId, lessonParticipantId: lp.id, minutesConsumed },
          });

          await tx.package.update({
            where: { id: packageId },
            data: {
              remainingMinutes: newRemaining,
              status: newRemaining === 0 ? PackageStatus.EXHAUSTED : PackageStatus.ACTIVE,
            },
          });
        }
      }
    }
  });

  redirect(`/calendar?date=${utcToZurichDate(scheduledDate)}`);
});

export async function addLessonParticipant(formData: FormData) {
  const { user } = await requireTeacherAuth();
  const lessonId = parseRequiredString(formData.get("lessonId"));
  const userId = parseRequiredString(formData.get("userId"));

  if (!lessonId || !userId) {
    throw new Error("Lesson id and user id are required.");
  }

  try {
    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, teacherId: user.id },
      select: { id: true },
    });

    if (!lesson) throw new DomainError("Lesson not found.");

    const student = await prisma.user.findFirst({
      where: { id: userId, role: UserRole.STUDENT, createdByTeacherId: user.id },
      select: { id: true },
    });

    if (!student) throw new DomainError("Student not found.");

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
      throw new DomainError("This student is already assigned to this lesson.");
    }
    handleNonFormActionError("addLessonParticipant", err);
  }

  redirect(`/lessons/${lessonId}`);
}

export const updateLesson = withFormAction(async function updateLesson(
  _prevState: LessonFormState,
  formData: FormData
): Promise<LessonFormState> {
  const { user } = await requireTeacherAuth();
  const teacherId = user.id;

  const id = parseRequiredString(formData.get("id"));
  const title = parseRequiredString(formData.get("title"));
  const description = String(formData.get("description") || "").trim();
  const lessonType = parseLessonType(formData.get("lessonType"));
  const scheduledAt = String(formData.get("scheduledAt") || "").trim();
  const durationMin = String(formData.get("durationMin") || "").trim();
  const priceAmount = String(formData.get("priceAmount") || "").trim();
  const location = String(formData.get("location") || "").trim();

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
  } else if (!isValidDatetimeLocal(scheduledAt)) {
    state.errors.scheduledAt = "Scheduled date is invalid.";
  }

  const durationMinNumber = parseRequiredNumber(formData.get("durationMin"));
  if (
    !durationMin ||
    Number.isNaN(durationMinNumber) ||
    durationMinNumber <= 0 ||
    !Number.isInteger(durationMinNumber)
  ) {
    state.errors.durationMin = "Duration must be a positive integer (minutes).";
  }

  if (priceAmount && !isValidDecimal(priceAmount)) {
    state.errors.priceAmount =
      "Price must be a valid amount with up to 2 decimals.";
  }

  if (Object.keys(state.errors).length > 0) {
    return state;
  }

  // Ownership check — also confirms the lesson exists.
  const existingLesson = await prisma.lesson.findFirst({
    where: { id, teacherId },
    select: { id: true },
  });

  if (!existingLesson) {
    return {
      ...state,
      errors: { form: "Lesson not found." },
    };
  }

  const scheduledDate = zurichLocalToUtc(scheduledAt);
  const parsedDescription = parseOptionalString(formData.get("description"));
  const parsedPriceAmount = parseOptionalPrice(formData.get("priceAmount"));
  const parsedLocation = parseOptionalString(formData.get("location"));

  const newEndTime = new Date(scheduledDate.getTime() + durationMinNumber * 60 * 1000);
  const nearbyLessons = await prisma.lesson.findMany({
    where: { teacherId, scheduledAt: { lt: newEndTime }, id: { not: id } },
    select: { id: true, scheduledAt: true, durationMin: true },
  });
  const conflict = nearbyLessons.find((l) => {
    const lessonEnd = new Date(l.scheduledAt.getTime() + l.durationMin * 60 * 1000);
    return lessonEnd > scheduledDate;
  });

  if (conflict) {
    return {
      ...state,
      errors: {
        scheduledAt:
          "This teacher already has a lesson scheduled at this time.",
      },
    };
  }

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

  redirect(`/calendar?date=${utcToZurichDate(scheduledDate)}`);
});

export async function removeLessonParticipant(formData: FormData) {
  const { user } = await requireTeacherAuth();
  const participantId = parseRequiredString(formData.get("participantId"));
  const lessonId = parseRequiredString(formData.get("lessonId"));

  if (!participantId || !lessonId) {
    throw new Error("Participant id and lesson id are required.");
  }

  try {
    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, teacherId: user.id },
      select: { id: true },
    });

    if (!lesson) throw new DomainError("Lesson not found.");

    const participant = await prisma.lessonParticipant.findUnique({
      where: { id: participantId },
      select: { lessonId: true },
    });

    if (!participant) throw new DomainError("Participant not found.");

    if (participant.lessonId !== lessonId) {
      throw new DomainError("Participant does not belong to this lesson.");
    }

    await prisma.$transaction(async (tx) => {
      // Restore package minutes if this participant had a package assigned (F-02).
      const usage = await tx.packageUsage.findUnique({
        where: { lessonParticipantId: participantId },
        select: { packageId: true, minutesConsumed: true },
      });

      if (usage) {
        // Only restore minutes if no other participant is using this same package
        // for this lesson (i.e. the lesson still happened for the group — F-02).
        const otherUsageCount = await tx.packageUsage.count({
          where: {
            packageId: usage.packageId,
            lessonParticipant: { lessonId },
            NOT: { lessonParticipantId: participantId },
          },
        });

        if (otherUsageCount === 0) {
          const pkg = await tx.package.findUnique({
            where: { id: usage.packageId },
            select: { remainingMinutes: true, totalMinutes: true, status: true },
          });

          if (pkg) {
            const newRemaining = Math.min(
              pkg.remainingMinutes + usage.minutesConsumed,
              pkg.totalMinutes
            );
            const newStatus =
              pkg.status === PackageStatus.EXHAUSTED
                ? PackageStatus.ACTIVE
                : pkg.status;

            await tx.package.update({
              where: { id: usage.packageId },
              data: { remainingMinutes: newRemaining, status: newStatus },
            });
          }
        }
      }

      await tx.lessonParticipant.delete({ where: { id: participantId } });
    });
  } catch (err) {
    handleNonFormActionError("removeLessonParticipant", err);
  }

  redirect(`/lessons/${lessonId}`);
}

export async function assignPackageToParticipant(formData: FormData) {
  const { user } = await requireTeacherAuth();
  const participantId = parseRequiredString(formData.get("participantId"));
  const packageId = parseRequiredString(formData.get("packageId"));
  const lessonId = parseRequiredString(formData.get("lessonId"));

  if (!participantId || !packageId || !lessonId) {
    throw new Error("Missing required fields.");
  }

  try {
    await prisma.$transaction(async (tx) => {
      const lesson = await tx.lesson.findFirst({
        where: { id: lessonId, teacherId: user.id },
        select: { durationMin: true },
      });

      if (!lesson) throw new DomainError("Lesson not found.");

      const participant = await tx.lessonParticipant.findUnique({
        where: { id: participantId },
        select: { userId: true },
      });

      if (!participant) throw new DomainError("Participant not found.");

      const pkg = await tx.package.findUnique({
        where: { id: packageId },
        select: {
          remainingMinutes: true,
          status: true,
          expiresAt: true,
        },
      });

      if (!pkg) throw new DomainError("Package not found.");

      if (pkg.status !== PackageStatus.ACTIVE) {
        throw new DomainError("Package is not active.");
      }

      if (pkg.expiresAt !== null && pkg.expiresAt < new Date()) {
        throw new DomainError("Package has expired.");
      }

      const membership = await tx.packageParticipant.findUnique({
        where: { packageId_userId: { packageId, userId: participant.userId } },
        select: { id: true },
      });

      if (!membership) {
        throw new DomainError("Package does not belong to this student.");
      }

      if (pkg.remainingMinutes <= 0) {
        throw new DomainError("Package has no remaining minutes.");
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

      // Atomic conditional decrement: the WHERE guard ensures that if a
      // concurrent transaction already consumed these minutes, this update
      // matches zero rows and we abort — preventing double-consumption.
      const updated = await tx.package.updateMany({
        where: { id: packageId, remainingMinutes: { gte: minutesConsumed } },
        data: {
          remainingMinutes: { decrement: minutesConsumed },
          status:
            newRemaining === 0 ? PackageStatus.EXHAUSTED : PackageStatus.ACTIVE,
        },
      });

      if (updated.count === 0) {
        throw new DomainError(
          "Package no longer has sufficient minutes. It may have been modified concurrently."
        );
      }
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      throw new DomainError("A package is already assigned to this participant.");
    }
    handleNonFormActionError("assignPackageToParticipant", err);
  }

  redirect(`/lessons/${lessonId}`);
}

export async function removePackageFromParticipant(formData: FormData) {
  const { user } = await requireTeacherAuth();
  const usageId = parseRequiredString(formData.get("usageId"));
  const lessonId = parseRequiredString(formData.get("lessonId"));

  if (!usageId || !lessonId) {
    throw new Error("Missing required fields.");
  }

  try {
    await prisma.$transaction(async (tx) => {
      const lesson = await tx.lesson.findFirst({
        where: { id: lessonId, teacherId: user.id },
        select: { id: true },
      });

      if (!lesson) throw new DomainError("Lesson not found.");

      const usage = await tx.packageUsage.findUnique({
        where: { id: usageId },
        select: { minutesConsumed: true, packageId: true },
      });

      if (!usage) throw new DomainError("Package usage not found.");

      const pkg = await tx.package.findUnique({
        where: { id: usage.packageId },
        select: { remainingMinutes: true, totalMinutes: true, status: true },
      });

      if (!pkg) throw new DomainError("Package not found.");

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
  } catch (err) {
    handleNonFormActionError("removePackageFromParticipant", err);
  }

  redirect(`/lessons/${lessonId}`);
}

export async function deleteLesson(formData: FormData) {
  const { user } = await requireTeacherAuth();
  const lessonId = parseRequiredString(formData.get("lessonId"));

  if (!lessonId) {
    throw new Error("Lesson id is required.");
  }

  try {
    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, teacherId: user.id },
      select: { id: true },
    });

    if (!lesson) throw new DomainError("Lesson not found.");

    await prisma.$transaction(async (tx) => {
      // Restore package minutes for all participants before cascade deletion (F-01).
      const usages = await tx.packageUsage.findMany({
        where: { lessonParticipant: { lessonId } },
        select: { packageId: true, minutesConsumed: true },
      });

      for (const usage of usages) {
        const pkg = await tx.package.findUnique({
          where: { id: usage.packageId },
          select: { remainingMinutes: true, totalMinutes: true, status: true },
        });

        if (!pkg) continue;

        const newRemaining = Math.min(
          pkg.remainingMinutes + usage.minutesConsumed,
          pkg.totalMinutes
        );
        const newStatus =
          pkg.status === PackageStatus.EXHAUSTED
            ? PackageStatus.ACTIVE
            : pkg.status;

        await tx.package.update({
          where: { id: usage.packageId },
          data: { remainingMinutes: newRemaining, status: newStatus },
        });
      }

      await tx.lesson.delete({ where: { id: lessonId } });
    });
  } catch (err) {
    handleNonFormActionError("deleteLesson", err);
  }

  redirect("/lessons");
}