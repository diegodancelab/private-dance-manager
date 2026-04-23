"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireStudentAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
});

export type ProfileFormState = {
  ok: boolean;
  errors?: Record<string, string[]>;
};

export async function updateStudentProfile(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const { user } = await requireStudentAuth();

  const parsed = schema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone") || null,
  });

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  await prisma.user.update({ where: { id: user.id }, data: parsed.data });
  revalidatePath("/portal/profile");
  return { ok: true };
}
