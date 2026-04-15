"use server";

import { prisma } from "@/lib/prisma";
import { getSession, createSession } from "@/lib/auth/session";
import { redirect } from "@/lib/server-redirect";
import { TeacherStudentInvitationStatus } from "@/generated/prisma/client";
import { logger } from "@/lib/logger";
import bcrypt from "bcryptjs";

export type AcceptFormState = {
  success: boolean;
  errors: {
    form?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
    confirmPassword?: string;
  };
};

/**
 * Validates a token and returns the invitation or an error reason.
 * Used by the accept-invitation page to decide what to render.
 */
export async function getInvitationByToken(token: string): Promise<{
  valid: boolean;
  email?: string;
  teacherFirstName?: string;
  error?: "expired" | "invalid" | "already_used";
}> {
  if (!token) return { valid: false, error: "invalid" };

  const invitation = await prisma.teacherStudentInvitation.findUnique({
    where: { token },
    select: {
      email: true,
      status: true,
      expiresAt: true,
      teacher: { select: { firstName: true } },
    },
  });

  if (!invitation) return { valid: false, error: "invalid" };
  if (invitation.status === TeacherStudentInvitationStatus.ACCEPTED) {
    return { valid: false, error: "already_used" };
  }
  if (
    invitation.status === TeacherStudentInvitationStatus.CANCELED ||
    invitation.expiresAt < new Date()
  ) {
    return { valid: false, error: "expired" };
  }

  return {
    valid: true,
    email: invitation.email,
    teacherFirstName: invitation.teacher.firstName,
  };
}

/**
 * Accepts an invitation for a user who is already logged in.
 * Verifies that the logged-in user's email matches the invitation email.
 */
export async function acceptInvitationAsLoggedInUser(
  formData: FormData
): Promise<never> {
  const token = String(formData.get("token") || "").trim();
  const session = await getSession();

  if (!session) return redirect(`/login?next=/accept-invitation?token=${token}`);

  const invitation = await prisma.teacherStudentInvitation.findUnique({
    where: { token },
    select: {
      id: true,
      teacherId: true,
      email: true,
      status: true,
      expiresAt: true,
    },
  });

  if (
    !invitation ||
    invitation.status !== TeacherStudentInvitationStatus.PENDING ||
    invitation.expiresAt < new Date()
  ) {
    return redirect("/accept-invitation?token=" + token + "&error=expired");
  }

  // Security: the logged-in user must own the invited email.
  if (session.user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    return redirect("/accept-invitation?token=" + token + "&error=email_mismatch");
  }

  // Check not already enrolled.
  const alreadyEnrolled = await prisma.teacherStudentRelation.findUnique({
    where: {
      teacherId_studentId: {
        teacherId: invitation.teacherId,
        studentId: session.user.id,
      },
    },
    select: { id: true },
  });

  if (!alreadyEnrolled) {
    await prisma.$transaction([
      prisma.teacherStudentRelation.create({
        data: { teacherId: invitation.teacherId, studentId: session.user.id },
      }),
      prisma.teacherStudentInvitation.update({
        where: { id: invitation.id },
        data: { status: TeacherStudentInvitationStatus.ACCEPTED },
      }),
    ]);

    logger.info("cross-enrollment", "Invitation accepted by logged-in user", {
      teacherId: invitation.teacherId,
      studentId: session.user.id,
    });
  }

  // If the user is a teacher, redirect to choose-role so they can pick context.
  if (session.user.role === "TEACHER") {
    return redirect("/choose-role");
  }
  return redirect("/portal");
}

/**
 * Creates a new account and accepts the invitation in one step.
 * For users who don't have an account yet.
 */
export async function createAccountAndAccept(
  _prevState: AcceptFormState,
  formData: FormData
): Promise<AcceptFormState> {
  const token = String(formData.get("token") || "").trim();
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  const empty: AcceptFormState = { success: false, errors: {} };

  if (!firstName) return { ...empty, errors: { firstName: "Le prénom est requis." } };
  if (!lastName) return { ...empty, errors: { lastName: "Le nom est requis." } };
  if (!password) return { ...empty, errors: { password: "Le mot de passe est requis." } };
  if (password.length < 8) {
    return { ...empty, errors: { password: "Le mot de passe doit contenir au moins 8 caractères." } };
  }
  if (password !== confirmPassword) {
    return { ...empty, errors: { confirmPassword: "Les mots de passe ne correspondent pas." } };
  }

  const invitation = await prisma.teacherStudentInvitation.findUnique({
    where: { token },
    select: {
      id: true,
      teacherId: true,
      email: true,
      status: true,
      expiresAt: true,
    },
  });

  if (
    !invitation ||
    invitation.status !== TeacherStudentInvitationStatus.PENDING ||
    invitation.expiresAt < new Date()
  ) {
    return { ...empty, errors: { form: "Ce lien d'invitation a expiré ou a déjà été utilisé." } };
  }

  // Double-check no account exists for this email (race condition guard).
  const existingUser = await prisma.user.findUnique({
    where: { email: invitation.email },
    select: { id: true },
  });
  if (existingUser) {
    return {
      ...empty,
      errors: { form: "Un compte existe déjà avec cet email. Connectez-vous pour accepter l'invitation." },
    };
  }

  const passwordHash = await bcrypt.hash(
    password,
    process.env.NODE_ENV === "production" ? 12 : 4
  );

  const newUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        firstName,
        lastName,
        email: invitation.email,
        role: "STUDENT",
        passwordHash,
        portalActivatedAt: new Date(),
        createdByTeacherId: invitation.teacherId,
      },
    });

    await tx.teacherStudentRelation.create({
      data: { teacherId: invitation.teacherId, studentId: user.id },
    });

    await tx.teacherStudentInvitation.update({
      where: { id: invitation.id },
      data: { status: TeacherStudentInvitationStatus.ACCEPTED },
    });

    return user;
  });

  logger.info("cross-enrollment", "New account created and invitation accepted", {
    teacherId: invitation.teacherId,
    newUserId: newUser.id,
  });

  await createSession(newUser.id);
  return redirect("/portal");
}
