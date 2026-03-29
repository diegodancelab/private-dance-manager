"use server";

import { requireTeacherAuth } from "@/lib/auth/require-auth";
import { zurichDateToUtc, isValidDate } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { ChargeStatus, ChargeType, UserRole } from "@/generated/prisma/client";
import { redirect } from "next/navigation";
import type { ChargeFormState } from "./form-state";
import { withFormAction } from "@/lib/errors";

function parseRequiredString(value: FormDataEntryValue | null): string {
  return String(value || "").trim();
}

function parseOptionalString(value: FormDataEntryValue | null): string | null {
  const parsed = String(value || "").trim();
  return parsed === "" ? null : parsed;
}

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

function isValidDecimal(value: string): boolean {
  return /^\d+(\.\d{1,2})?$/.test(value);
}


export const createCharge = withFormAction(async function createCharge(
  _prevState: ChargeFormState,
  formData: FormData
): Promise<ChargeFormState> {
  const { user } = await requireTeacherAuth();
  const userId = parseRequiredString(formData.get("userId"));
  const lessonId = parseRequiredString(formData.get("lessonId"));
  const type = parseChargeType(formData.get("type"));
  const title = parseRequiredString(formData.get("title"));
  const description = String(formData.get("description") || "").trim();
  const amount = parseRequiredString(formData.get("amount"));
  const currency = parseRequiredString(formData.get("currency")) || "CHF";
  const status = parseChargeStatus(formData.get("status"));
  const dueAt = parseRequiredString(formData.get("dueAt"));

  const state: ChargeFormState = {
    success: false,
    message: "",
    fields: {
      id: "",
      userId,
      lessonId,
      type,
      title,
      description,
      amount,
      currency,
      status,
      dueAt,
    },
    errors: {},
  };

  if (!userId) {
    state.errors.userId = "Student is required.";
  }

  if (!title) {
    state.errors.title = "Title is required.";
  }

  if (!amount) {
    state.errors.amount = "Amount is required.";
  } else if (!isValidDecimal(amount)) {
    state.errors.amount = "Amount must be a valid value with up to 2 decimals.";
  } else if (Number(amount) <= 0) {
    state.errors.amount = "Amount must be greater than 0.";
  }

  if (!currency) {
    state.errors.currency = "Currency is required.";
  }

  if (dueAt && !isValidDate(dueAt)) {
    state.errors.dueAt = "Due date is invalid.";
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

  if (lessonId) {
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        teacherId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!lesson) {
      return {
        ...state,
        errors: {
          lessonId: "Selected lesson was not found.",
        },
      };
    }
  }

  const charge = await prisma.charge.create({
    data: {
      userId,
      teacherId: user.id,
      lessonId: lessonId || null,
      type,
      title,
      description: parseOptionalString(formData.get("description")),
      amount,
      currency,
      status,
      dueAt: dueAt ? zurichDateToUtc(dueAt) : null,
    },
  });

  redirect(`/charges/${charge.id}`);
});

export const updateCharge = withFormAction(async function updateCharge(
  _prevState: ChargeFormState,
  formData: FormData
): Promise<ChargeFormState> {
  const { user } = await requireTeacherAuth();
  const id = parseRequiredString(formData.get("id"));
  const userId = parseRequiredString(formData.get("userId"));
  const lessonId = parseRequiredString(formData.get("lessonId"));
  const type = parseChargeType(formData.get("type"));
  const title = parseRequiredString(formData.get("title"));
  const description = String(formData.get("description") || "").trim();
  const amount = parseRequiredString(formData.get("amount"));
  const currency = parseRequiredString(formData.get("currency")) || "CHF";
  const status = parseChargeStatus(formData.get("status"));
  const dueAt = parseRequiredString(formData.get("dueAt"));

  const state: ChargeFormState = {
    success: false,
    message: "",
    fields: {
      id,
      userId,
      lessonId,
      type,
      title,
      description,
      amount,
      currency,
      status,
      dueAt,
    },
    errors: {},
  };

  if (!id) {
    state.errors.form = "Charge id is required.";
    return state;
  }

  if (!userId) {
    state.errors.userId = "Student is required.";
  }

  if (!title) {
    state.errors.title = "Title is required.";
  }

  if (!amount) {
    state.errors.amount = "Amount is required.";
  } else if (!isValidDecimal(amount)) {
    state.errors.amount = "Amount must be a valid value with up to 2 decimals.";
  } else if (Number(amount) <= 0) {
    state.errors.amount = "Amount must be greater than 0.";
  }

  if (!currency) {
    state.errors.currency = "Currency is required.";
  }

  if (dueAt && !isValidDate(dueAt)) {
    state.errors.dueAt = "Due date is invalid.";
  }

  if (Object.keys(state.errors).length > 0) {
    return state;
  }

  const existingCharge = await prisma.charge.findFirst({
    where: {
      id,
      teacherId: user.id,
    },
    select: {
      id: true,
    },
  });

  if (!existingCharge) {
    return {
      ...state,
      errors: {
        form: "Charge not found.",
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

  if (lessonId) {
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        teacherId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!lesson) {
      return {
        ...state,
        errors: {
          lessonId: "Selected lesson was not found.",
        },
      };
    }
  }

  await prisma.$transaction(async (tx) => {
    // Derive status from actual allocations unless the teacher is canceling.
    let resolvedStatus = status;
    if (status !== ChargeStatus.CANCELED) {
      const existing = await tx.charge.findUnique({
        where: { id },
        select: { allocations: { select: { amount: true } } },
      });

      if (existing) {
        const totalPaid = existing.allocations.reduce(
          (sum, a) => sum + Number(a.amount),
          0
        );
        resolvedStatus =
          totalPaid >= Number(amount)
            ? ChargeStatus.PAID
            : totalPaid > 0
            ? ChargeStatus.PARTIALLY_PAID
            : ChargeStatus.PENDING;
      }
    }

    await tx.charge.update({
      where: { id },
      data: {
        userId,
        lessonId: lessonId || null,
        type,
        title,
        description: parseOptionalString(formData.get("description")),
        amount,
        currency,
        status: resolvedStatus,
        dueAt: dueAt ? zurichDateToUtc(dueAt) : null,
      },
    });
  });

  redirect(`/charges/${id}`);
});