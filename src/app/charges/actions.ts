"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createCharge(formData: FormData) {
  const userId = String(formData.get("userId") || "").trim();
  const lessonId = String(formData.get("lessonId") || "").trim();
  const type = String(formData.get("type") || "LESSON").trim();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const amount = String(formData.get("amount") || "").trim();
  const currency = String(formData.get("currency") || "CHF").trim();
  const status = String(formData.get("status") || "PENDING").trim();
  const dueAt = String(formData.get("dueAt") || "").trim();

  if (!userId || !title || !amount) {
    throw new Error("User, title and amount are required.");
  }

  const charge = await prisma.charge.create({
    data: {
      userId,
      lessonId: lessonId || null,
      type: type as "LESSON" | "PACKAGE" | "ADJUSTMENT" | "OTHER",
      title,
      description: description || null,
      amount,
      currency,
      status: status as "PENDING" | "PARTIALLY_PAID" | "PAID" | "CANCELED",
      dueAt: dueAt ? new Date(dueAt) : null,
    },
  });

  redirect(`/charges/${charge.id}`);
}