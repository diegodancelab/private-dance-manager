"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "./session";
import { sendLoginAlert } from "@/lib/email/sendLoginAlert";

export type LoginFormState = {
  success: boolean;
  errors: {
    form?: string;
    email?: string;
    password?: string;
  };
};

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 5;

export async function login(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  const empty: LoginFormState = { success: false, errors: {} };

  if (!email) return { ...empty, errors: { email: "Email is required" } };
  if (!password) return { ...empty, errors: { password: "Password is required" } };

  // Rate limiting: count failed attempts for this email within the window.
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  const recentFailures = await prisma.loginAttempt.count({
    where: { email, attemptedAt: { gte: windowStart } },
  });

  if (recentFailures >= RATE_LIMIT_MAX_ATTEMPTS) {
    // Send alert only once — exactly when the limit is first reached (5th attempt).
    // recentFailures is counted before recording the new attempt, so at exactly
    // RATE_LIMIT_MAX_ATTEMPTS the 5th bad attempt just got recorded and we're now on the 6th.
    if (recentFailures === RATE_LIMIT_MAX_ATTEMPTS) {
      sendLoginAlert(email).catch((err) => {
        console.error("[login-alert] Failed to send security email:", err);
      });
    }
    return {
      ...empty,
      errors: {
        form: "Too many failed sign-in attempts. Please try again in 15 minutes.",
      },
    };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true, isActive: true },
  });

  if (!user || !user.passwordHash || !user.isActive) {
    await prisma.loginAttempt.create({ data: { email } });
    return { ...empty, errors: { form: "Invalid email or password" } };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    await prisma.loginAttempt.create({ data: { email } });
    return { ...empty, errors: { form: "Invalid email or password" } };
  }

  // Successful login: clear failed attempts then create the session.
  await prisma.loginAttempt.deleteMany({ where: { email } });
  await createSession(user.id);
  redirect("/");
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
