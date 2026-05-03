"use server";

import { requireStudentAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";

export async function updateNotificationPreferences(data: {
  notifLessonReminder: boolean;
  notifAssessment: boolean;
}): Promise<void> {
  const { user } = await requireStudentAuth();
  await prisma.user.update({
    where: { id: user.id },
    data,
  });
}
