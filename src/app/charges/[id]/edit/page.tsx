import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ChargeEditForm from "./ChargeEditForm";
import type { ChargeFormState } from "../../form-state";
import { UserRole } from "@/generated/prisma/client";


type Props = {
  params: Promise<{
    id: string;
  }>;
};

function toDateInputValue(date: Date | null): string {
  if (!date) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default async function EditChargePage({ params }: Props) {
  const { id } = await params;

  const charge = await prisma.charge.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      userId: true,
      lessonId: true,
      type: true,
      title: true,
      description: true,
      amount: true,
      currency: true,
      status: true,
      dueAt: true,
    },
  });

  if (!charge) {
    notFound();
  }

  const students = await prisma.user.findMany({
    where: {
      role: UserRole.STUDENT,
    },
    orderBy: [
      { firstName: "asc" },
      { lastName: "asc" },
    ],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    },
  });

  const lessons = await prisma.lesson.findMany({
    orderBy: {
      scheduledAt: "desc",
    },
    select: {
      id: true,
      title: true,
      scheduledAt: true,
    },
  });

  const initialState: ChargeFormState = {
    success: false,
    message: "",
    fields: {
      id: charge.id,
      userId: charge.userId,
      lessonId: charge.lessonId ?? "",
      type: charge.type,
      title: charge.title,
      description: charge.description ?? "",
      amount: String(charge.amount),
      currency: charge.currency,
      status: charge.status,
      dueAt: toDateInputValue(charge.dueAt),
    },
    errors: {},
  };

  return (
    <div>
      <h1>Edit charge</h1>
      <ChargeEditForm
        initialState={initialState}
        students={students}
        lessons={lessons}
      />
    </div>
  );
}