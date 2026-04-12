"use server";

import { requireTeacherAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { sendPortalInvitation } from "@/lib/email/sendPortalInvitation";
import { DomainError } from "@/lib/errors";
import { logger } from "@/lib/logger";

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

async function createAndSendInvitation(
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
  await createAndSendInvitation(studentId, user.firstName, locale);

  logger.info("portal", "Portal invitation sent", {
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
    throw new DomainError(
      "Un email est requis pour envoyer une invitation."
    );
  }

  if (student.portalActivatedAt) {
    throw new DomainError("Le portail est déjà activé — aucune invitation à renvoyer.");
  }

  // Invalidate all existing unused invitations for this student.
  await prisma.portalInvitation.updateMany({
    where: { userId: studentId, usedAt: null },
    data: { expiresAt: new Date() }, // force-expire them
  });

  const locale = await getLocale();
  await createAndSendInvitation(studentId, user.firstName, locale);

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
