"use server";

import { ChargeStatus, ChargeType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

function parseChargeType(value: FormDataEntryValue | null): ChargeType {
  const parsed = String(value || "").trim();

  if (Object.values(ChargeType).includes(parsed as ChargeType)) {
    return parsed as ChargeType;
  }

  return ChargeType.LESSON;
}

function parseChargeStatus(value: FormDataEntryValue | null): ChargeStatus {
  const parsed = String(value || "").trim();

  if (Object.values(ChargeStatus).includes(parsed as ChargeStatus)) {
    return parsed as ChargeStatus;
  }

  return ChargeStatus.PENDING;
}

export async function createCharge(formData: FormData) {
  const userId = String(formData.get("userId") || "").trim();
  const lessonId = String(formData.get("lessonId") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const amount = String(formData.get("amount") || "").trim();
  const currency = String(formData.get("currency") || "CHF").trim();
  const dueAt = String(formData.get("dueAt") || "").trim();

  const type = parseChargeType(formData.get("type"));
  const status = parseChargeStatus(formData.get("status"));

  if (!userId || !title || !amount) {
    throw new Error("User, title and amount are required.");
  }

  const charge = await prisma.charge.create({
    data: {
      userId,
      lessonId: lessonId || null,
      type,
      title,
      description: description || null,
      amount,
      currency,
      status,
      dueAt: dueAt ? new Date(dueAt) : null,
    },
  });

  redirect(`/charges/${charge.id}`);
}