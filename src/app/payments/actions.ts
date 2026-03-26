"use server";

import { prisma } from "@/lib/prisma";
import {
  ChargeStatus,
  PaymentMethod,
  PaymentStatus,
  UserRole,
} from "@/generated/prisma/client";
import { redirect } from "next/navigation";
import type { PaymentFormState } from "./form-state";

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

function isValidDateTimeLocal(value: string): boolean {
  if (!value) {
    return false;
  }

  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

export async function createPayment(
  _prevState: PaymentFormState,
  formData: FormData
): Promise<PaymentFormState> {
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

  if (paidAt && !isValidDateTimeLocal(paidAt)) {
    state.errors.paidAt = "Paid date is invalid.";
  }

  if (Object.keys(state.errors).length > 0) {
    return state;
  }

  const student = await prisma.user.findFirst({
    where: {
      id: userId,
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
        userId: "Selected student was not found.",
      },
    };
  }

  const payment = await prisma.payment.create({
    data: {
      userId,
      amount,
      currency,
      method,
      status,
      note: parseOptionalString(formData.get("note")),
      paidAt: paidAt ? new Date(paidAt) : null,
    },
  });

  const chargeId = parseOptionalString(formData.get("chargeId"));

  if (chargeId) {
    const charge = await prisma.charge.findUnique({
      where: { id: chargeId },
      select: {
        amount: true,
        allocations: { select: { amount: true } },
      },
    });

    if (charge) {
      await prisma.paymentAllocation.create({
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

      await prisma.charge.update({
        where: { id: chargeId },
        data: { status: newStatus },
      });
    }
  }

  redirect(`/payments/${payment.id}`);
}

export async function updatePayment(
  _prevState: PaymentFormState,
  formData: FormData
): Promise<PaymentFormState> {
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

  if (paidAt && !isValidDateTimeLocal(paidAt)) {
    state.errors.paidAt = "Paid date is invalid.";
  }

  if (Object.keys(state.errors).length > 0) {
    return state;
  }

  const existingPayment = await prisma.payment.findUnique({
    where: {
      id,
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

  await prisma.payment.update({
    where: {
      id,
    },
    data: {
      userId,
      amount,
      currency,
      method,
      status,
      note: parseOptionalString(formData.get("note")),
      paidAt: paidAt ? new Date(paidAt) : null,
    },
  });

  redirect(`/payments/${id}`);
}