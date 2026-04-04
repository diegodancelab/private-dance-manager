import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { UserRole } from "@/generated/prisma/client";
import { requireAuth } from "@/lib/auth/require-auth";
import StudentEditForm from "./StudentEditForm";
import type { StudentFormState } from "../../form-state";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditStudentPage({ params }: Props) {
  const { id } = await params;
  const { user } = await requireAuth();

  const student = await prisma.user.findFirst({
    where: {
      id,
      role: UserRole.STUDENT,
      createdByTeacherId: user.id,
    },
  });

  if (!student) {
    notFound();
  }

  const initialState: StudentFormState = {
    success: false,
    message: "",
    fields: {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email ?? "",
      phone: student.phone ?? "",
    },
    errors: {},
  };

  return <StudentEditForm initialState={initialState} />;
}