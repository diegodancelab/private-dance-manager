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

  // Fetch all users with this email (students may have one record per teacher space).
  const users = await prisma.user.findMany({
    where: { email },
    select: { id: true, passwordHash: true, isActive: true, role: true, portalActivatedAt: true },
  });

  if (users.length === 0) {
    await prisma.loginAttempt.create({ data: { email } });
    logger.warn("login", "Failed login attempt — invalid credentials", { email });
    return { ...empty, errors: { form: "Invalid email or password" } };
  }

  // Separate teachers from student portal accounts.
  const teacherUser = users.find((u) => u.role === "TEACHER");
  const studentUsers = users.filter(
    (u) => u.role === "STUDENT" && u.isActive && u.portalActivatedAt && u.passwordHash
  );

  // --- TEACHER login ---
  if (teacherUser) {
    if (!teacherUser.passwordHash || !teacherUser.isActive) {
      await prisma.loginAttempt.create({ data: { email } });
      return { ...empty, errors: { form: "Invalid email or password" } };
    }
    const valid = await bcrypt.compare(password, teacherUser.passwordHash);
    if (!valid) {
      await prisma.loginAttempt.create({ data: { email } });
      logger.warn("login", "Failed login attempt — wrong password", { email });
      return { ...empty, errors: { form: "Invalid email or password" } };
    }
    const expired = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
    await prisma.loginAttempt.deleteMany({
      where: { OR: [{ email }, { attemptedAt: { lt: expired } }] },
    });
    logger.info("login", "Successful login", { email, userId: teacherUser.id });
    const crossEnrollmentCount = await prisma.teacherStudentRelation.count({
      where: { studentId: teacherUser.id },
    });
    if (crossEnrollmentCount > 0) {
      await createSession(teacherUser.id, null);
      return redirect("/choose-role");
    }
    await createSession(teacherUser.id, "TEACHER");
    return redirect("/");
  }

  // --- STUDENT login ---
  if (studentUsers.length === 0) {
    await prisma.loginAttempt.create({ data: { email } });
    logger.warn("login", "Failed login attempt — no active student portal", { email });
    return { ...empty, errors: { form: "Invalid email or password" } };
  }

  // Verify password against all matching student records and collect valid ones.
  const validStudents = (
    await Promise.all(
      studentUsers.map(async (u) => {
        const ok = await bcrypt.compare(password, u.passwordHash!);
        return ok ? u : null;
      })
    )
  ).filter(Boolean) as typeof studentUsers;

  if (validStudents.length === 0) {
    await prisma.loginAttempt.create({ data: { email } });
    logger.warn("login", "Failed login attempt — wrong password", { email });
    return { ...empty, errors: { form: "Invalid email or password" } };
  }

  const expired = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  await prisma.loginAttempt.deleteMany({
    where: { OR: [{ email }, { attemptedAt: { lt: expired } }] },
  });
  logger.info("login", "Successful student login", { email, count: validStudents.length });

  // Single teacher space → go directly to portal.
  if (validStudents.length === 1) {
    await createSession(validStudents[0].id);
    return redirect("/portal");
  }

  // Multiple teacher spaces → let student choose.
  return redirect(`/choose-teacher?ids=${validStudents.map((u) => u.id).join(",")}`);
}

export async function logout(): Promise<void> {
  await deleteSession();
  return redirect("/login");
}
