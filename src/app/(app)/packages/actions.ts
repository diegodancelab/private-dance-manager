"use server";

import { requireTeacherAuth } from "@/lib/auth/require-auth";
import { zurichDateToUtc } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { UserRole, ChargeType, ChargeStatus, PackageStatus } from "@/generated/prisma/client";
import { redirect } from "next/navigation";
import type { PackageFormState } from "./form-state";
import { withFormAction, DomainError, handleNonFormActionError } from "@/lib/errors";

function isValidDecimal(value: string): boolean {
  return /^\d+(\.\d{1,2})?$/.test(value);
}

function isValidPositiveInt(value: string): boolean {
  const n = Number(value);
  return Number.isInteger(n) && n > 0;
}


export const createPackage = withFormAction(async function createPackage(
  _prevState: PackageFormState,
  formData: FormData
): Promise<PackageFormState> {
  const { user } = await requireTeacherAuth();
  const userId = String(formData.get("userId") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const totalHours = String(formData.get("totalHours") || "").trim();
  const amount = String(formData.get("amount") || "").trim();
  const currency = String(formData.get("currency") || "CHF").trim();
  const expiresAt = String(formData.get("expiresAt") || "").trim();

  const state: PackageFormState = {
    success: false,
    message: "",
    fields: { id: "", userId, name, totalHours, amount, currency, expiresAt },
    errors: {},
  };

  if (!userId) state.errors.userId = "Student is required.";
  if (!name) state.errors.name = "Name is required.";

  if (!totalHours) {
    state.errors.totalHours = "Total hours is required.";
  } else if (!isValidPositiveInt(totalHours)) {
    state.errors.totalHours = "Total hours must be a positive integer.";
  }

  if (!amount) {
    state.errors.amount = "Amount is required.";
  } else if (!isValidDecimal(amount)) {
    state.errors.amount = "Amount must be a valid number with up to 2 decimals.";
  }

  if (!currency) state.errors.currency = "Currency is required.";

  if (expiresAt) {
    try {
      const parsed = zurichDateToUtc(expiresAt);
      if (parsed <= new Date()) {
        state.errors.expiresAt = "Expiry date must be in the future.";
      }
    } catch {
      state.errors.expiresAt = "Expiry date is invalid.";
    }
  }

  if (Object.keys(state.errors).length > 0) return state;

  const student = await prisma.user.findFirst({
    where: { id: userId, role: UserRole.STUDENT, createdByTeacherId: user.id },
    select: { id: true },
  });

  if (!student) {
    return { ...state, errors: { userId: "Selected student was not found." } };
  }

  const totalMinutes = Number(totalHours) * 60;
  const parsedExpiresAt = expiresAt ? zurichDateToUtc(expiresAt) : null;

  await prisma.$transaction(async (tx) => {
    const pkg = await tx.package.create({
      data: {
        teacherId: user.id,
        name,
        totalMinutes,
        remainingMinutes: totalMinutes,
        status: PackageStatus.ACTIVE,
        expiresAt: parsedExpiresAt,
      },
    });

    await tx.packageParticipant.create({
      data: { packageId: pkg.id, userId },
    });

    await tx.charge.create({
      data: {
        userId,
        teacherId: user.id,
        type: ChargeType.PACKAGE,
        title: name,
        amount,
        currency,
        package: { connect: { id: pkg.id } },
      },
    });
  });

  redirect("/packages");
});

export const updatePackage = withFormAction(async function updatePackage(
  _prevState: PackageFormState,
  formData: FormData
): Promise<PackageFormState> {
  const { user } = await requireTeacherAuth();
  const id = String(formData.get("id") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const totalHours = String(formData.get("totalHours") || "").trim();
  const currency = String(formData.get("currency") || "CHF").trim();
  const expiresAt = String(formData.get("expiresAt") || "").trim();

  const state: PackageFormState = {
    success: false,
    message: "",
    fields: { id, userId: "", name, totalHours, amount: "", currency, expiresAt },
    errors: {},
  };

  if (!id) {
    return { ...state, errors: { form: "Package id is required." } };
  }

  if (!name) state.errors.name = "Name is required.";

  if (!totalHours) {
    state.errors.totalHours = "Total hours is required.";
  } else if (!isValidPositiveInt(totalHours)) {
    state.errors.totalHours = "Total hours must be a positive integer.";
  }

  if (expiresAt) {
    try {
      const parsed = zurichDateToUtc(expiresAt);
      if (parsed <= new Date()) {
        state.errors.expiresAt = "Expiry date must be in the future.";
      }
    } catch {
      state.errors.expiresAt = "Expiry date is invalid.";
    }
  }

  if (Object.keys(state.errors).length > 0) return state;

  const existing = await prisma.package.findFirst({
    where: { id, teacherId: user.id },
    select: { id: true, totalMinutes: true, remainingMinutes: true, status: true },
  });

  if (!existing) {
    return { ...state, errors: { form: "Package not found." } };
  }

  const newTotalMinutes = Number(totalHours) * 60;
  const consumedMinutes = existing.totalMinutes - existing.remainingMinutes;

  if (newTotalMinutes < consumedMinutes) {
    const minHours = Math.ceil(consumedMinutes / 60);
    return {
      ...state,
      errors: {
        totalHours: `Cannot reduce below already consumed hours (minimum: ${minHours}h).`,
      },
    };
  }

  const diff = newTotalMinutes - existing.totalMinutes;
  const newRemainingMinutes = Math.max(existing.remainingMinutes + diff, 0);
  const parsedExpiresAt = expiresAt ? zurichDateToUtc(expiresAt) : null;

  let newStatus = existing.status;
  if (newRemainingMinutes === 0) {
    newStatus = PackageStatus.EXHAUSTED;
  } else if (existing.status === PackageStatus.EXHAUSTED) {
    newStatus = PackageStatus.ACTIVE;
  }

  await prisma.package.update({
    where: { id },
    data: {
      name,
      totalMinutes: newTotalMinutes,
      remainingMinutes: newRemainingMinutes,
      status: newStatus,
      expiresAt: parsedExpiresAt,
    },
  });

  redirect(`/packages/${id}`);
});

export async function addParticipantToPackage(formData: FormData) {
  const { user } = await requireTeacherAuth();
  const packageId = String(formData.get("packageId") || "").trim();
  const userId = String(formData.get("userId") || "").trim();

  if (!packageId || !userId) {
    throw new Error("Package id and user id are required.");
  }

  try {
    const pkg = await prisma.package.findFirst({
      where: { id: packageId, teacherId: user.id },
      select: { id: true },
    });

    if (!pkg) throw new DomainError("Package not found.");

    const student = await prisma.user.findFirst({
      where: { id: userId, role: UserRole.STUDENT, createdByTeacherId: user.id },
      select: { id: true },
    });

    if (!student) throw new DomainError("Student not found.");

    await prisma.packageParticipant.create({
      data: { packageId, userId },
    });
  } catch (err) {
    handleNonFormActionError("addParticipantToPackage", err);
  }

  redirect(`/packages/${packageId}`);
}

export async function migrateUnitLessonsToPackage(formData: FormData) {
  const { user } = await requireTeacherAuth();
  const packageId = String(formData.get("packageId") || "").trim();

  if (!packageId) throw new Error("Package id is required.");

  try {
    const pkg = await prisma.package.findFirst({
      where: { id: packageId, teacherId: user.id, status: PackageStatus.ACTIVE },
      select: {
        id: true,
        remainingMinutes: true,
        participants: { select: { userId: true } },
      },
    });

    if (!pkg) throw new DomainError("Package not found or not active.");

    const studentIds = pkg.participants.map((p) => p.userId);
    if (studentIds.length === 0) throw new DomainError("No participants assigned to this package.");

    const pendingCharges = await prisma.charge.findMany({
      where: {
        teacherId: user.id,
        userId: { in: studentIds },
        type: ChargeType.LESSON,
        status: ChargeStatus.PENDING,
        lessonId: { not: null },
      },
      select: {
        id: true,
        userId: true,
        lesson: {
          select: {
            durationMin: true,
            scheduledAt: true,
            participants: {
              where: { userId: { in: studentIds } },
              select: {
                id: true,
                userId: true,
                packageUsage: { select: { id: true } },
              },
            },
          },
        },
      },
    });

    const eligible = pendingCharges
      .filter((charge) => {
        const lp = charge.lesson?.participants.find((p) => p.userId === charge.userId);
        return lp && !lp.packageUsage;
      })
      .sort((a, b) => {
        const aDate = a.lesson?.scheduledAt.getTime() ?? 0;
        const bDate = b.lesson?.scheduledAt.getTime() ?? 0;
        return aDate - bDate;
      });

    if (eligible.length > 0) {
      await prisma.$transaction(async (tx) => {
        let remaining = pkg.remainingMinutes;

        for (const charge of eligible) {
          if (remaining <= 0) break;

          const lp = charge.lesson!.participants.find((p) => p.userId === charge.userId)!;
          const minutesConsumed = Math.min(charge.lesson!.durationMin, remaining);

          await tx.charge.update({
            where: { id: charge.id },
            data: { status: ChargeStatus.CANCELED },
          });

          await tx.packageUsage.create({
            data: { packageId, lessonParticipantId: lp.id, minutesConsumed },
          });

          remaining -= minutesConsumed;
        }

        await tx.package.update({
          where: { id: packageId },
          data: {
            remainingMinutes: remaining,
            status: remaining === 0 ? PackageStatus.EXHAUSTED : PackageStatus.ACTIVE,
          },
        });
      });
    }
  } catch (err) {
    handleNonFormActionError("migrateUnitLessonsToPackage", err);
  }

  redirect(`/packages/${packageId}`);
}

export async function removeParticipantFromPackage(formData: FormData) {
  const { user } = await requireTeacherAuth();
  const packageId = String(formData.get("packageId") || "").trim();
  const userId = String(formData.get("userId") || "").trim();

  if (!packageId || !userId) {
    throw new Error("Package id and user id are required.");
  }

  try {
    const pkg = await prisma.package.findFirst({
      where: { id: packageId, teacherId: user.id },
      select: { id: true },
    });

    if (!pkg) throw new DomainError("Package not found.");

    // Guard: refuse removal if this student has PackageUsage entries for this package
    const hasUsage = await prisma.packageUsage.findFirst({
      where: {
        packageId,
        lessonParticipant: { userId },
      },
      select: { id: true },
    });

    if (hasUsage) {
      throw new DomainError(
        "Cannot remove this participant: they have usage records linked to this package."
      );
    }

    await prisma.packageParticipant.delete({
      where: { packageId_userId: { packageId, userId } },
    });
  } catch (err) {
    handleNonFormActionError("removeParticipantFromPackage", err);
  }

  redirect(`/packages/${packageId}`);
}
