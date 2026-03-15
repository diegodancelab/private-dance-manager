"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ChargeStatus, PaymentMethod, PaymentStatus } from "@/generated/prisma/client";

function parsePaymentMethod(value: FormDataEntryValue | null): PaymentMethod | null {
  const parsed = String(value || "").trim();
  
  if (!parsed) {
    return null;
  }
  
  if (Object.values(PaymentMethod).includes(parsed as PaymentMethod)) {
    return parsed as PaymentMethod;
  }
  
  return null;
}

function parsePaymentStatus(value: FormDataEntryValue | null): PaymentStatus {
  const parsed = String(value || "").trim();
  
  if (Object.values(PaymentStatus).includes(parsed as PaymentStatus)) {
    return parsed as PaymentStatus;
  }
  
  return PaymentStatus.COMPLETED;
}

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

  let status: ChargeStatus = ChargeStatus.PENDING;

  if (allocatedTotal <= 0) {
    status = ChargeStatus.PENDING;
  } else if (allocatedTotal < chargeAmount) {
    status = ChargeStatus.PARTIALLY_PAID;
  } else {
    status = ChargeStatus.PAID;
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
  const method = parsePaymentMethod(formData.get("method"));
  const status = parsePaymentStatus(formData.get("status"));
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
      method,
      status,
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