"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { UserRole } from "@/generated/prisma/client";

export async function createStudent(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  if (!firstName || !lastName) {
    throw new Error("First name and last name are required.");
  }

  if (!email && !phone) {
    throw new Error("At least one contact method is required: email or phone.");
  }

  await prisma.user.create({
    data: {
      email: email || null,
      firstName,
      lastName,
      phone: phone || null,
      role: UserRole.STUDENT,
    },
  });

  redirect("/students");
}

export async function updateStudent(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  if (!id || !firstName || !lastName) {
    throw new Error("Id, first name and last name are required.");
  }

  if (!email && !phone) {
    throw new Error("At least one contact method is required: email or phone.");
  }

  await prisma.user.update({
    where: {
      id,
    },
    data: {
      email: email || null,
      firstName,
      lastName,
      phone: phone || null,
      role: UserRole.STUDENT,
    },
  });

  redirect(`/students/${id}`);
}