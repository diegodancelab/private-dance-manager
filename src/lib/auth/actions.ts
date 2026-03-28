"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "./session";

export type LoginFormState = {
  success: boolean;
  errors: {
    form?: string;
    email?: string;
    password?: string;
  };
};

export async function login(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  const empty: LoginFormState = { success: false, errors: {} };

  if (!email) return { ...empty, errors: { email: "Email is required" } };
  if (!password) return { ...empty, errors: { password: "Password is required" } };

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true, isActive: true },
  });

  if (!user || !user.passwordHash || !user.isActive) {
    return { ...empty, errors: { form: "Invalid email or password" } };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { ...empty, errors: { form: "Invalid email or password" } };
  }

  await createSession(user.id);
  redirect("/");
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
