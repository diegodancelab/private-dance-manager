import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { utcToZurichDatetimeLocal } from "@/lib/dates";
import { requireAuth } from "@/lib/auth/require-auth";
import type { PaymentFormState } from "../../form-state";
import { UserRole } from "@/generated/prisma/client";
import PaymentEditForm from "./PaymentEditForm";

type Props = {
  params: Promise<{
    id: string;
  }>;
};


export default async function EditPaymentPage({ params }: Props) {
  const { id } = await params;
  const { user } = await requireAuth();

  const payment = await prisma.payment.findFirst({
    where: {
      id,
      teacherId: user.id,
    },
    select: {
      id: true,
      userId: true,
      amount: true,
      currency: true,
      method: true,
      status: true,
      note: true,
      paidAt: true,
    },
  });

  if (!payment) {
    notFound();
  }

  const students = await prisma.user.findMany({
    where: {
      role: UserRole.STUDENT,
      createdByTeacherId: user.id,
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

  const initialState: PaymentFormState = {
    success: false,
    message: "",
    fields: {
      id: payment.id,
      userId: payment.userId,
      amount: String(payment.amount),
      currency: payment.currency,
      method: payment.method ?? "",
      status: payment.status,
      note: payment.note ?? "",
      paidAt: payment.paidAt ? utcToZurichDatetimeLocal(payment.paidAt) : "",
    },
    errors: {},
  };

  return <PaymentEditForm initialState={initialState} students={students} />;
}