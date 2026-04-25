"use server";

import { requireTeacherAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { DomainError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { sendTeacherStudentInvitation } from "@/lib/email/sendTeacherStudentInvitation";
import { TeacherStudentInvitationStatus } from "@/generated/prisma/client";
import { withFormAction } from "@/lib/errors";

export type InviteFormState = {
  success: boolean;
  message: string;
  errors: { email?: string; form?: string };
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export const inviteStudent = withFormAction(async function inviteStudent(
  _prevState: InviteFormState,
  formData: FormData
): Promise<InviteFormState> {
  const { user: teacher } = await requireTeacherAuth();
  const email = String(formData.get("email") || "").trim().toLowerCase();

  if (!email) {
    return { success: false, message: "", errors: { email: "L'email est requis." } };
  }
  if (!isValidEmail(email)) {
    return { success: false, message: "", errors: { email: "Adresse email invalide." } };
  }

  // Anti-enumeration: do not reveal if the email has an account or not.
  // Validate all business rules before touching the DB.

  // Cannot invite yourself.
  if (teacher.email && teacher.email.toLowerCase() === email) {
    throw new DomainError("Vous ne pouvez pas vous inviter vous-même.");
  }

  // Check if a TeacherStudentRelation already exists for this teacher + this email.
  const existingRelation = await prisma.teacherStudentRelation.findFirst({
    where: {
      teacherId: teacher.id,
      student: { email },
    },
    select: { id: true },
  });
  if (existingRelation) {
    throw new DomainError("Cette personne est déjà votre élève.");
  }

  // Check for an already-accepted invitation (edge-case guard).
  const acceptedInvitation = await prisma.teacherStudentInvitation.findUnique({
    where: { teacherId_email: { teacherId: teacher.id, email } },
    select: { status: true },
  });
  if (acceptedInvitation?.status === TeacherStudentInvitationStatus.ACCEPTED) {
    throw new DomainError("Cette personne a déjà accepté votre invitation.");
  }

  // Look up existing user (for the email in the invitation URL).
  const existingUser = await prisma.user.findFirst({
    where: { email },
    select: { id: true, firstName: true },
  });

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
  const locale = await getLocale();
  const invitationUrl = `${getAppUrl()}/${locale}/accept-invitation?token=${token}`;

  // Upsert: one record per (teacherId, email) — update token + expiry on resend.
  await prisma.teacherStudentInvitation.upsert({
    where: { teacherId_email: { teacherId: teacher.id, email } },
    create: {
      teacherId: teacher.id,
      email,
      token,
      status: TeacherStudentInvitationStatus.PENDING,
      expiresAt,
    },
    update: {
      token,
      status: TeacherStudentInvitationStatus.PENDING,
      expiresAt,
    },
  });

  await sendTeacherStudentInvitation({
    recipientEmail: email,
    recipientFirstName: existingUser?.firstName,
    teacherFirstName: teacher.firstName,
    invitationUrl,
    isExistingUser: !!existingUser,
  });

  logger.info("cross-enrollment", "Invitation sent", {
    teacherId: teacher.id,
    email,
    hasAccount: !!existingUser,
  });

  revalidatePath("/students");
  return {
    success: true,
    message: "Invitation envoyée.",
    errors: {},
  };
});

export async function resendInvitation(formData: FormData): Promise<void> {
  const { user: teacher } = await requireTeacherAuth();
  const invitationId = String(formData.get("invitationId") || "").trim();

  const invitation = await prisma.teacherStudentInvitation.findFirst({
    where: {
      id: invitationId,
      teacherId: teacher.id,
      status: TeacherStudentInvitationStatus.PENDING,
    },
    select: { id: true, email: true },
  });

  if (!invitation) throw new DomainError("Invitation introuvable.");

  const existingUser = await prisma.user.findFirst({
    where: { email: invitation.email },
    select: { firstName: true },
  });

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
  const locale = await getLocale();
  const invitationUrl = `${getAppUrl()}/${locale}/accept-invitation?token=${token}`;

  await prisma.teacherStudentInvitation.update({
    where: { id: invitation.id },
    data: { token, expiresAt },
  });

  await sendTeacherStudentInvitation({
    recipientEmail: invitation.email,
    recipientFirstName: existingUser?.firstName,
    teacherFirstName: teacher.firstName,
    invitationUrl,
    isExistingUser: !!existingUser,
  });

  logger.info("cross-enrollment", "Invitation resent", {
    teacherId: teacher.id,
    invitationId,
  });

  revalidatePath("/students");
}

export async function cancelInvitation(formData: FormData): Promise<void> {
  const { user: teacher } = await requireTeacherAuth();
  const invitationId = String(formData.get("invitationId") || "").trim();

  const invitation = await prisma.teacherStudentInvitation.findFirst({
    where: {
      id: invitationId,
      teacherId: teacher.id,
      status: TeacherStudentInvitationStatus.PENDING,
    },
    select: { id: true },
  });

  if (!invitation) throw new DomainError("Invitation introuvable.");

  await prisma.teacherStudentInvitation.update({
    where: { id: invitation.id },
    data: {
      status: TeacherStudentInvitationStatus.CANCELED,
      expiresAt: new Date(), // force-expire immediately
    },
  });

  logger.info("cross-enrollment", "Invitation canceled", {
    teacherId: teacher.id,
    invitationId,
  });

  revalidatePath("/students");
}
