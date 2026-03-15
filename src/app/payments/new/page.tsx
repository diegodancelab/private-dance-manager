import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/client";
import PaymentCreateForm from "./PaymentCreateForm";

export default async function NewPaymentPage() {
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

  return (
    <div>
      <h1>Create payment</h1>
      <PaymentCreateForm students={students} />
    </div>
  );
}