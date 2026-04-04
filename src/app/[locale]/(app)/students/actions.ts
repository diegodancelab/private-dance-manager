"use server";

import { requireTeacherAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { UserRole } from "@/generated/prisma/client";
import type { StudentFormState } from "./form-state";
import { withFormAction } from "@/lib/errors";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const createStudent = withFormAction(async function createStudent(
  _prevState: StudentFormState,
  formData: FormData
): Promise<StudentFormState> {
  const { user } = await requireTeacherAuth();
  const t = await getTranslations("validation");
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  const state: StudentFormState = {
    success: false,
    message: "",
    fields: {
      id: "",
      firstName,
      lastName,
      email,
      phone,
    },
    errors: {},
  };

  if (!firstName) {
    state.errors.firstName = t("firstNameRequired");
  }

  if (!lastName) {
    state.errors.lastName = t("lastNameRequired");
  }

  if (!email && !phone) {
    state.errors.form = t("contactRequired");
  }

  if (email && !isValidEmail(email)) {
    state.errors.email = t("emailInvalid");
  }

  if (Object.keys(state.errors).length > 0) {
    return state;
  }

  if (email) {
    const existingUser = await prisma.user.findFirst({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return {
        ...state,
        errors: {
          email: t("emailAlreadyUsed"),
        },
      };
    }
  }

  await prisma.user.create({
    data: {
      firstName,
      lastName,
      email: email || null,
      phone: phone || null,
      role: UserRole.STUDENT,
      createdByTeacherId: user.id,
    },
  });

  redirect("/students");
});

export const updateStudent = withFormAction(async function updateStudent(
  _prevState: StudentFormState,
  formData: FormData
): Promise<StudentFormState> {
  const { user } = await requireTeacherAuth();
  const t = await getTranslations("validation");
  const id = String(formData.get("id") || "").trim();
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  const state: StudentFormState = {
    success: false,
    message: "",
    fields: {
      id,
      firstName,
      lastName,
      email,
      phone,
    },
    errors: {},
  };

  if (!id) {
    state.errors.form = "Student id is required.";
    return state;
  }

  if (!firstName) {
    state.errors.firstName = t("firstNameRequired");
  }

  if (!lastName) {
    state.errors.lastName = t("lastNameRequired");
  }

  if (!email && !phone) {
    state.errors.form = t("contactRequired");
  }

  if (email && !isValidEmail(email)) {
    state.errors.email = t("emailInvalid");
  }

  if (Object.keys(state.errors).length > 0) {
    return state;
  }

  const existingStudent = await prisma.user.findFirst({
    where: {
      id,
      role: UserRole.STUDENT,
      createdByTeacherId: user.id,
    },
    select: { id: true },
  });

  if (!existingStudent) {
    return {
      ...state,
      errors: {
        form: "Student not found.",
      },
    };
  }

  if (email) {
    const existingUserWithEmail = await prisma.user.findFirst({
      where: {
        email,
        id: { not: id },
      },
      select: { id: true },
    });

    if (existingUserWithEmail) {
      return {
        ...state,
        errors: {
          email: t("emailAlreadyUsed"),
        },
      };
    }
  }

  await prisma.user.update({
    where: { id },
    data: {
      firstName,
      lastName,
      email: email || null,
      phone: phone || null,
      role: UserRole.STUDENT,
    },
  });

  redirect(`/students/${id}`);
});