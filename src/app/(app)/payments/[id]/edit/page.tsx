import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { PaymentFormState } from "../../form-state";
import { UserRole } from "@/generated/prisma/client";
import PaymentEditForm from "./PaymentEditForm";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function toDateTimeLocalValue(date: Date | null): string {
  if (!date) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default async function EditPaymentPage({ params }: Props) {
  const { id } = await params;

  const payment = await prisma.payment.findUnique({
    where: {
      id,
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
      paidAt: toDateTimeLocalValue(payment.paidAt),
    },
    errors: {},
  };

  return <PaymentEditForm initialState={initialState} students={students} />;
}