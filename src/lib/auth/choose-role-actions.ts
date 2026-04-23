"use server";

import { getSession, updateSessionRole } from "./session";
import { redirect } from "@/lib/server-redirect";
import { prisma } from "@/lib/prisma";

export async function chooseRole(formData: FormData): Promise<never> {
  const role = String(formData.get("role") || "");
  if (role !== "TEACHER" && role !== "STUDENT") {
    throw new Error("Invalid role");
  }

  const session = await getSession();
  if (!session || session.user.role !== "TEACHER") {
    return redirect("/login");
  }

  await updateSessionRole(role);
  return redirect(role === "TEACHER" ? "/" : "/portal");
}

export async function switchActiveRole(formData: FormData): Promise<never> {
  const targetRole = String(formData.get("targetRole") || "");
  if (targetRole !== "TEACHER" && targetRole !== "STUDENT") {
    throw new Error("Invalid targetRole");
  }

  const session = await getSession();
  if (!session || session.user.role !== "TEACHER") {
    return redirect("/login");
  }

  // Verify the user still has at least one active enrollment as student.
  if (targetRole === "STUDENT") {
    const count = await prisma.teacherStudentRelation.count({
      where: { studentId: session.user.id },
    });
    if (count === 0) return redirect("/");
  }

  await updateSessionRole(targetRole);
  return redirect(targetRole === "TEACHER" ? "/" : "/portal");
}
