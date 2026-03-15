"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { UserRole } from "@/generated/prisma/client";

export async function createStudent(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  if (!email || !firstName || !lastName) {
    throw new Error("Email, first name and last name are required.");
  }

  await prisma.user.create({
    data: {
      email,
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

  if (!id || !email || !firstName || !lastName) {
    throw new Error("Id, email, first name and last name are required.");
  }

  await prisma.user.update({
    where: {
      id,
    },
    data: {
      email,
      firstName,
      lastName,
      phone: phone || null,
      role: UserRole.STUDENT
    },
  });

  redirect(`/students/${id}`);
}