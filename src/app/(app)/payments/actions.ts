"use server";

import { requireAuth } from "@/lib/auth/require-auth";
import { zurichLocalToUtc, isValidDatetimeLocal } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import {
  ChargeStatus,
  PaymentMethod,
  PaymentStatus,
  UserRole,
} from "@/generated/prisma/client";
import { redirect } from "next/navigation";
import type { PaymentFormState } from "./form-state";
import { withFormAction } from "@/lib/errors";

function parseRequiredString(value: FormDataEntryValue | null): string {
  return String(value || "").trim();
}

function parseOptionalString(value: FormDataEntryValue | null): string | null {
  const parsed = String(value || "").trim();
  return parsed === "" ? null : parsed;
}

function parsePaymentMethod(
  value: FormDataEntryValue | null
): PaymentMethod | null {
  const parsed = String(value || "").trim();

  if (parsed === "") {
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

function isValidDecimal(value: string): boolean {
  return /^\d+(\.\d{1,2})?$/.test(value);
}


export const createPayment = withFormAction(async function createPayment(
  _prevState: PaymentFormState,
  formData: FormData
): Promise<PaymentFormState> {
  const { user } = await requireAuth();
  const userId = parseRequiredString(formData.get("userId"));
  const amount = parseRequiredString(formData.get("amount"));
  const currency = parseRequiredString(formData.get("currency")) || "CHF";
  const method = parsePaymentMethod(formData.get("method"));
  const status = parsePaymentStatus(formData.get("status"));
  const note = String(formData.get("note") || "").trim();
  const paidAt = parseRequiredString(formData.get("paidAt"));

  const state: PaymentFormState = {
    success: false,
    message: "",
    fields: {
      id: "",
      userId,
      amount,
      currency,
      method: method ?? "",
      status,
      note,
      paidAt,
    },
    errors: {},
  };

  if (!userId) {
    state.errors.userId = "Student is required.";
  }

  if (!amount) {
    state.errors.amount = "Amount is required.";
  } else if (!isValidDecimal(amount)) {
    state.errors.amount = "Amount must be a valid value with up to 2 decimals.";
  }

  if (!currency) {
    state.errors.currency = "Currency is required.";
  }

  if (paidAt && !isValidDatetimeLocal(paidAt)) {
    state.errors.paidAt = "Paid date is invalid.";
  }

  if (Object.keys(state.errors).length > 0) {
    return state;
  }

  const student = await prisma.user.findFirst({
    where: {
      id: userId,
      role: UserRole.STUDENT,
      createdByTeacherId: user.id,
    },
    select: {
      id: true,
    },
  });

  if (!student) {
    return {
      ...state,
      errors: {
        userId: "Selected student was not found.",
      },
    };
  }

  const chargeId = parseOptionalString(formData.get("chargeId"));

  const paymentId = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        userId,
        teacherId: user.id,
        amount,
        currency,
        method,
        status,
        note: parseOptionalString(formData.get("note")),
        paidAt: paidAt ? zurichLocalToUtc(paidAt) : null,
      },
    });

    if (chargeId) {
      const charge = await tx.charge.findFirst({
        where: { id: chargeId, teacherId: user.id },
        select: {
          userId: true,
          amount: true,
          allocations: { select: { amount: true } },
        },
      });

      if (charge && charge.userId === userId) {
        await tx.paymentAllocation.create({
          data: {
            chargeId,
            paymentId: payment.id,
            amount,
          },
        });

        const totalPaid =
          charge.allocations.reduce((sum, a) => sum + Number(a.amount), 0) +
          Number(amount);

        const newStatus =
          totalPaid >= Number(charge.amount)
            ? ChargeStatus.PAID
            : ChargeStatus.PARTIALLY_PAID;

        await tx.charge.update({
          where: { id: chargeId },
          data: { status: newStatus },
        });
      }
    }

    return payment.id;
  });

  redirect(`/payments/${paymentId}`);
});

export const updatePayment = withFormAction(async function updatePayment(
  _prevState: PaymentFormState,
  formData: FormData
): Promise<PaymentFormState> {
  const { user } = await requireAuth();
  const id = parseRequiredString(formData.get("id"));
  const userId = parseRequiredString(formData.get("userId"));
  const amount = parseRequiredString(formData.get("amount"));
  const currency = parseRequiredString(formData.get("currency")) || "CHF";
  const method = parsePaymentMethod(formData.get("method"));
  const status = parsePaymentStatus(formData.get("status"));
  const note = String(formData.get("note") || "").trim();
  const paidAt = parseRequiredString(formData.get("paidAt"));

  const state: PaymentFormState = {
    success: false,
    message: "",
    fields: {
      id,
      userId,
      amount,
      currency,
      method: method ?? "",
      status,
      note,
      paidAt,
    },
    errors: {},
  };

  if (!id) {
    state.errors.form = "Payment id is required.";
    return state;
  }

  if (!userId) {
    state.errors.userId = "Student is required.";
  }

  if (!amount) {
    state.errors.amount = "Amount is required.";
  } else if (!isValidDecimal(amount)) {
    state.errors.amount = "Amount must be a valid value with up to 2 decimals.";
  }

  if (!currency) {
    state.errors.currency = "Currency is required.";
  }

  if (paidAt && !isValidDatetimeLocal(paidAt)) {
    state.errors.paidAt = "Paid date is invalid.";
  }

  if (Object.keys(state.errors).length > 0) {
    return state;
  }

  const existingPayment = await prisma.payment.findFirst({
    where: {
      id,
      teacherId: user.id,
    },
    select: {
      id: true,
    },
  });

  if (!existingPayment) {
    return {
      ...state,
      errors: {
        form: "Payment not found.",
      },
    };
  }

  const student = await prisma.user.findFirst({
    where: {
      id: userId,
      role: UserRole.STUDENT,
      createdByTeacherId: user.id,
    },
    select: {
      id: true,
    },
  });

  if (!student) {
    return {
      ...state,
      errors: {
        userId: "Selected student was not found.",
      },
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id },
      data: {
        userId,
        amount,
        currency,
        method,
        status,
        note: parseOptionalString(formData.get("note")),
        paidAt: paidAt ? zurichLocalToUtc(paidAt) : null,
      },
    });

    // Recalculate status for every charge linked to this payment.
    const allocations = await tx.paymentAllocation.findMany({
      where: { paymentId: id },
      select: { chargeId: true },
    });

    for (const { chargeId } of allocations) {
      const charge = await tx.charge.findUnique({
        where: { id: chargeId },
        select: {
          amount: true,
          status: true,
          allocations: { select: { amount: true } },
        },
      });

      if (!charge || charge.status === ChargeStatus.CANCELED) continue;

      const totalPaid = charge.allocations.reduce(
        (sum, a) => sum + Number(a.amount),
        0
      );
      const newChargeStatus =
        totalPaid >= Number(charge.amount)
          ? ChargeStatus.PAID
          : totalPaid > 0
          ? ChargeStatus.PARTIALLY_PAID
          : ChargeStatus.PENDING;

      await tx.charge.update({
        where: { id: chargeId },
        data: { status: newChargeStatus },
      });
    }
  });

  redirect(`/payments/${id}`);
});