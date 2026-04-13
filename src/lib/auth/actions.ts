"use server";

import { redirect } from "@/lib/server-redirect";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "./session";
import { sendLoginAlert } from "@/lib/email/sendLoginAlert";
import { logger } from "@/lib/logger";

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
        logger.error("login", "Failed to send security alert email", {
          email,
          error: err instanceof Error ? err.message : String(err),
        });
      });
    }
    logger.warn("login", "Login blocked — rate limit exceeded", {
      email,
      recentFailures,
    });
    return {
      ...empty,
      errors: {
        form: "Too many failed sign-in attempts. Please try again in 15 minutes.",
      },
    };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true, isActive: true, role: true, portalActivatedAt: true },
  });

  if (!user || !user.passwordHash || !user.isActive) {
    await prisma.loginAttempt.create({ data: { email } });
    logger.warn("login", "Failed login attempt — invalid credentials", { email });
    return { ...empty, errors: { form: "Invalid email or password" } };
  }

  // Students without activated portal access cannot log in.
  if (user.role === "STUDENT" && !user.portalActivatedAt) {
    await prisma.loginAttempt.create({ data: { email } });
    logger.warn("login", "Failed login attempt — student portal not activated", { email });
    return { ...empty, errors: { form: "Invalid email or password" } };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    await prisma.loginAttempt.create({ data: { email } });
    logger.warn("login", "Failed login attempt — wrong password", { email });
    return { ...empty, errors: { form: "Invalid email or password" } };
  }

  // Successful login: clear failed attempts for this email, then create the session.
  // Also prune expired attempts globally (opportunistic cleanup — avoids a separate cron job).
  const expired = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  await prisma.loginAttempt.deleteMany({
    where: { OR: [{ email }, { attemptedAt: { lt: expired } }] },
  });
  logger.info("login", "Successful login", { email, userId: user.id });

  // Students go directly to the portal (single-role).
  if (user.role === "STUDENT") {
    await createSession(user.id);
    return redirect("/portal");
  }

  // Teachers: check if they are also enrolled as a student by another teacher.
  const crossEnrollmentCount = await prisma.teacherStudentRelation.count({
    where: { studentId: user.id },
  });

  if (crossEnrollmentCount > 0) {
    // Dual-role: no active role set yet — redirect to role selection.
    await createSession(user.id, null);
    return redirect("/choose-role");
  }

  await createSession(user.id, "TEACHER");
  return redirect("/");
}

export async function logout(): Promise<void> {
  await deleteSession();
  return redirect("/login");
}
