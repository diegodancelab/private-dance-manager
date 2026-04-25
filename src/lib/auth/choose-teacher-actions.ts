"use server";

import { prisma } from "@/lib/prisma";
import { createSession } from "./session";
import { redirect } from "@/lib/server-redirect";

export async function selectTeacherSpace(formData: FormData): Promise<void> {
  const userId = String(formData.get("userId") || "");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, isActive: true, portalActivatedAt: true },
  });

  if (!user || user.role !== "STUDENT" || !user.isActive || !user.portalActivatedAt) {
    return redirect("/login");
  }

  await createSession(user.id);
  return redirect("/portal");
}
