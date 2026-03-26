"use server";

import { prisma } from "@/lib/prisma";
import { UserRole, ChargeType, PackageStatus } from "@/generated/prisma/client";
import { redirect } from "next/navigation";
import type { PackageFormState } from "./form-state";

function isValidDecimal(value: string): boolean {
  return /^\d+(\.\d{1,2})?$/.test(value);
}

function isValidPositiveInt(value: string): boolean {
  const n = Number(value);
  return Number.isInteger(n) && n > 0;
}

function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function createPackage(
  _prevState: PackageFormState,
  formData: FormData
): Promise<PackageFormState> {
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

  if (expiresAt && Number.isNaN(new Date(expiresAt).getTime())) {
    state.errors.expiresAt = "Expiry date is invalid.";
  }

  if (Object.keys(state.errors).length > 0) return state;

  const student = await prisma.user.findFirst({
    where: { id: userId, role: UserRole.STUDENT },
    select: { id: true },
  });

  if (!student) {
    return { ...state, errors: { userId: "Selected student was not found." } };
  }

  const totalMinutes = Number(totalHours) * 60;
  const parsedExpiresAt = expiresAt ? new Date(expiresAt) : null;

  await prisma.$transaction(async (tx) => {
    const pkg = await tx.package.create({
      data: {
        userId,
        name,
        totalMinutes,
        remainingMinutes: totalMinutes,
        status: PackageStatus.ACTIVE,
        expiresAt: parsedExpiresAt,
      },
    });

    await tx.charge.create({
      data: {
        userId,
        type: ChargeType.PACKAGE,
        title: name,
        amount,
        currency,
        package: { connect: { id: pkg.id } },
      },
    });
  });

  redirect("/packages");
}

export async function updatePackage(
  _prevState: PackageFormState,
  formData: FormData
): Promise<PackageFormState> {
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

  if (expiresAt && Number.isNaN(new Date(expiresAt).getTime())) {
    state.errors.expiresAt = "Expiry date is invalid.";
  }

  if (Object.keys(state.errors).length > 0) return state;

  const existing = await prisma.package.findUnique({
    where: { id },
    select: { id: true, totalMinutes: true, remainingMinutes: true },
  });

  if (!existing) {
    return { ...state, errors: { form: "Package not found." } };
  }

  const newTotalMinutes = Number(totalHours) * 60;
  const diff = newTotalMinutes - existing.totalMinutes;
  const newRemainingMinutes = Math.max(existing.remainingMinutes + diff, 0);
  const parsedExpiresAt = expiresAt ? new Date(expiresAt) : null;

  await prisma.package.update({
    where: { id },
    data: {
      name,
      totalMinutes: newTotalMinutes,
      remainingMinutes: newRemainingMinutes,
      status: newRemainingMinutes === 0 ? PackageStatus.EXHAUSTED : PackageStatus.ACTIVE,
      expiresAt: parsedExpiresAt,
    },
  });

  redirect(`/packages/${id}`);
}
