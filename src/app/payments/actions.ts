"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

async function updateChargeStatus(chargeId: string) {
  const charge = await prisma.charge.findUnique({
    where: {
      id: chargeId,
    },
    include: {
      allocations: true,
    },
  });

  if (!charge) {
    throw new Error("Charge not found.");
  }

  const allocatedTotal = charge.allocations.reduce((sum, allocation) => {
    return sum + Number(allocation.amount);
  }, 0);

  const chargeAmount = Number(charge.amount);

  let status: "PENDING" | "PARTIALLY_PAID" | "PAID" | "CANCELED" = "PENDING";

  if (allocatedTotal <= 0) {
    status = "PENDING";
  } else if (allocatedTotal < chargeAmount) {
    status = "PARTIALLY_PAID";
  } else {
    status = "PAID";
  }

  await prisma.charge.update({
    where: {
      id: chargeId,
    },
    data: {
      status,
    },
  });
}

export async function createPayment(formData: FormData) {
  const userId = String(formData.get("userId") || "").trim();
  const chargeId = String(formData.get("chargeId") || "").trim();
  const amount = String(formData.get("amount") || "").trim();
  const currency = String(formData.get("currency") || "CHF").trim();
  const method = String(formData.get("method") || "").trim();
  const status = String(formData.get("status") || "COMPLETED").trim();
  const note = String(formData.get("note") || "").trim();
  const paidAt = String(formData.get("paidAt") || "").trim();

  if (!userId || !chargeId || !amount) {
    throw new Error("User, charge and amount are required.");
  }

  const payment = await prisma.payment.create({
    data: {
      userId,
      amount,
      currency,
      method: method
        ? (method as "CASH" | "TWINT" | "BANK_TRANSFER" | "CARD" | "OTHER")
        : null,
      status: status as "PENDING" | "COMPLETED" | "CANCELED" | "REFUNDED",
      note: note || null,
      paidAt: paidAt ? new Date(paidAt) : null,
    },
  });

  await prisma.paymentAllocation.create({
    data: {
      chargeId,
      paymentId: payment.id,
      amount,
    },
  });

  await updateChargeStatus(chargeId);

  redirect(`/payments/${payment.id}`);
}