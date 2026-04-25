"use server";

import { requireTeacherAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { sendPortalInvitation } from "@/lib/email/sendPortalInvitation";
import { sendPortalAccessGranted } from "@/lib/email/sendPortalAccessGranted";
import { DomainError, isDomainError } from "@/lib/errors";
import { logger } from "@/lib/logger";

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

/**
 * Activates portal access for a student and sends the appropriate email:
 * - If the student already has an account elsewhere (same email + passwordHash),
 *   copy the password hash, activate immediately, send a "just log in" email.
 * - Otherwise create a token, send a setup link to create a password.
 */
async function activatePortalAndNotify(
  studentId: string,
  teacherFirstName: string,
  locale: string
): Promise<void> {
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: { email: true, firstName: true },
  });

  if (!student?.email) {
    throw new DomainError(
      "Un email est requis pour envoyer une invitation portail."
    );
  }

  // Check if this email already has an active portal account with another teacher.
  const existingAccount = await prisma.user.findFirst({
    where: {
      email: student.email,
      id: { not: studentId },
      role: "STUDENT",
      passwordHash: { not: null },
      portalActivatedAt: { not: null },
    },
    select: { passwordHash: true },
  });

  if (existingAccount) {
    // Already has a password — copy it and activate immediately.
    await prisma.user.update({
      where: { id: studentId },
      data: {
        passwordHash: existingAccount.passwordHash,
        portalActivatedAt: new Date(),
      },
    });

    const loginUrl = `${getAppUrl()}/${locale}/login`;
    await sendPortalAccessGranted({
      studentEmail: student.email,
      studentFirstName: student.firstName,
      teacherFirstName,
      loginUrl,
    });

    logger.info("portal", "Portal activated immediately (existing account)", {
      studentId,
    });
  } else {
    // No existing account — create token and send setup link.
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h

    await prisma.portalInvitation.create({
      data: { userId: studentId, token, expiresAt },
    });

    const invitationUrl = `${getAppUrl()}/${locale}/portal/setup?token=${token}`;
    await sendPortalInvitation({
      studentEmail: student.email,
      studentFirstName: student.firstName,
      teacherFirstName,
      invitationUrl,
    });

    logger.info("portal", "Portal invitation sent (new account)", { studentId });
  }
}

export type AddEmailFormState = { error: string | null };

export async function addEmailAndActivatePortal(
  _prevState: AddEmailFormState,
  formData: FormData
): Promise<AddEmailFormState> {
  try {
    const { user } = await requireTeacherAuth();
    const studentId = String(formData.get("studentId") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();

    if (!studentId) throw new Error("studentId is required");
    if (!email) throw new DomainError("L'email est requis.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new DomainError("Adresse email invalide.");
    }

    const student = await prisma.user.findFirst({
      where: { id: studentId, createdByTeacherId: user.id },
      select: { id: true, email: true, portalActivatedAt: true },
    });

    if (!student) throw new Error("Student not found");
    if (student.email) throw new DomainError("Cet élève a déjà un email enregistré.");
    if (student.portalActivatedAt) throw new DomainError("Le portail est déjà activé pour cet élève.");

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: studentId },
        OR: [{ role: "TEACHER" }, { createdByTeacherId: user.id }],
      },
      select: { id: true },
    });
    if (existingUser) throw new DomainError("Cette adresse email est déjà utilisée par un autre compte.");

    await prisma.user.update({
      where: { id: studentId },
      data: { email },
    });

    const locale = await getLocale();
    await activatePortalAndNotify(studentId, user.firstName, locale);

    logger.info("portal", "Email added and portal activated", {
      studentId,
      teacherId: user.id,
    });

    revalidatePath(`/students/${studentId}`);
    return { error: null };
  } catch (err) {
    if (isDomainError(err)) return { error: err.message };
    throw err;
  }
}

export async function activateStudentPortal(formData: FormData): Promise<void> {
  const { user } = await requireTeacherAuth();
  const studentId = String(formData.get("studentId") || "").trim();

  if (!studentId) throw new Error("studentId is required");

  const student = await prisma.user.findFirst({
    where: { id: studentId, createdByTeacherId: user.id },
    select: { id: true, email: true, portalActivatedAt: true },
  });

  if (!student) throw new Error("Student not found");

  if (!student.email) {
    throw new DomainError(
      "Un email est requis pour activer l'accès portail. Ajoutez d'abord un email à la fiche élève."
    );
  }

  if (student.portalActivatedAt) {
    throw new DomainError("Le portail est déjà activé pour cet élève.");
  }

  const locale = await getLocale();
  await activatePortalAndNotify(studentId, user.firstName, locale);

  logger.info("portal", "Portal activation triggered", {
    studentId,
    teacherId: user.id,
  });

  revalidatePath(`/students/${studentId}`);
}

export async function resendPortalInvitation(
  formData: FormData
): Promise<void> {
  const { user } = await requireTeacherAuth();
  const studentId = String(formData.get("studentId") || "").trim();

  if (!studentId) throw new Error("studentId is required");

  const student = await prisma.user.findFirst({
    where: { id: studentId, createdByTeacherId: user.id },
    select: { id: true, email: true, portalActivatedAt: true },
  });

  if (!student) throw new Error("Student not found");

  if (!student.email) {
    throw new DomainError("Un email est requis pour envoyer une invitation.");
  }

  if (student.portalActivatedAt) {
    throw new DomainError("Le portail est déjà activé — aucune invitation à renvoyer.");
  }

  // Invalidate all existing unused invitations for this student.
  await prisma.portalInvitation.updateMany({
    where: { userId: studentId, usedAt: null },
    data: { expiresAt: new Date() },
  });

  const locale = await getLocale();
  await activatePortalAndNotify(studentId, user.firstName, locale);

  logger.info("portal", "Portal invitation resent", {
    studentId,
    teacherId: user.id,
  });

  revalidatePath(`/students/${studentId}`);
}

export async function deactivateStudentPortal(
  formData: FormData
): Promise<void> {
  const { user } = await requireTeacherAuth();
  const studentId = String(formData.get("studentId") || "").trim();

  if (!studentId) throw new Error("studentId is required");

  const student = await prisma.user.findFirst({
    where: { id: studentId, createdByTeacherId: user.id },
    select: { id: true, portalActivatedAt: true },
  });

  if (!student) throw new Error("Student not found");

  // Clear portal access, revoke all sessions, and expire invitations.
  await prisma.$transaction([
    prisma.user.update({
      where: { id: studentId },
      data: { portalActivatedAt: null, passwordHash: null },
    }),
    prisma.session.deleteMany({ where: { userId: studentId } }),
    prisma.portalInvitation.updateMany({
      where: { userId: studentId, usedAt: null },
      data: { expiresAt: new Date() },
    }),
  ]);

  logger.info("portal", "Portal access deactivated", {
    studentId,
    teacherId: user.id,
  });

  revalidatePath(`/students/${studentId}`);
}
