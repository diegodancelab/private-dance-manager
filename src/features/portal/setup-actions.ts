"use server";

import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth/session";
import { redirect } from "@/lib/server-redirect";
import bcrypt from "bcryptjs";

export type SetupFormState = {
  success: boolean;
  errors: {
    form?: string;
    password?: string;
    confirmPassword?: string;
  };
};

export async function setupPortalPassword(
  _prevState: SetupFormState,
  formData: FormData
): Promise<SetupFormState> {
  const token = String(formData.get("token") || "").trim();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  const empty: SetupFormState = { success: false, errors: {} };

  if (!password) {
    return { ...empty, errors: { password: "Le mot de passe est requis." } };
  }
  if (password.length < 8) {
    return {
      ...empty,
      errors: { password: "Le mot de passe doit contenir au moins 8 caractères." },
    };
  }
  if (password !== confirmPassword) {
    return {
      ...empty,
      errors: { confirmPassword: "Les mots de passe ne correspondent pas." },
    };
  }

  const invitation = await prisma.portalInvitation.findUnique({
    where: { token },
    include: {
      user: { select: { id: true, isActive: true, role: true } },
    },
  });

  if (
    !invitation ||
    invitation.usedAt !== null ||
    invitation.expiresAt < new Date()
  ) {
    return {
      ...empty,
      errors: {
        form: "Ce lien d'invitation a expiré ou a déjà été utilisé. Demandez à votre professeur de vous renvoyer une invitation.",
      },
    };
  }

  if (!invitation.user.isActive || invitation.user.role !== "STUDENT") {
    return {
      ...empty,
      errors: { form: "Ce lien d'invitation n'est plus valide." },
    };
  }

  const passwordHash = await bcrypt.hash(
    password,
    process.env.NODE_ENV === "production" ? 12 : 4
  );

  await prisma.$transaction([
    prisma.user.update({
      where: { id: invitation.userId },
      data: {
        passwordHash,
        portalActivatedAt: new Date(),
      },
    }),
    prisma.portalInvitation.update({
      where: { id: invitation.id },
      data: { usedAt: new Date() },
    }),
  ]);

  await createSession(invitation.userId);
  return redirect("/portal");
}
