"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createUser(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const role = String(formData.get("role") || "STUDENT").trim();

  if (!email || !firstName || !lastName) {
    throw new Error("Email, first name and last name are required.");
  }

  await prisma.user.create({
    data: {
      email,
      firstName,
      lastName,
      phone: phone || null,
      role: role as "ADMIN" | "TEACHER" | "STUDENT",
    },
  });

  redirect("/users");
}