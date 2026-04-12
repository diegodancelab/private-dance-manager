"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireStudentAuth } from "@/lib/auth/require-auth";

type State = {
  success: boolean;
  error: string | null;
};

export async function changePortalPassword(
  _prev: State,
  formData: FormData
): Promise<State> {
  const { user } = await requireStudentAuth();

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { success: false, error: "Tous les champs sont requis." };
  }

  if (newPassword.length < 8) {
    return {
      success: false,
      error: "Le nouveau mot de passe doit contenir au moins 8 caractères.",
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      success: false,
      error: "Les mots de passe ne correspondent pas.",
    };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });

  if (!dbUser?.passwordHash) {
    return { success: false, error: "Impossible de vérifier le mot de passe." };
  }

  const valid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
  if (!valid) {
    return { success: false, error: "Le mot de passe actuel est incorrect." };
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  return { success: true, error: null };
}
