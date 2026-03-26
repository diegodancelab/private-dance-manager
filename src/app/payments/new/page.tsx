import { prisma } from "@/lib/prisma";
import { UserRole, ChargeStatus } from "@/generated/prisma/client";
import PaymentCreateForm from "./PaymentCreateForm";

export default async function NewPaymentPage() {
  const students = await prisma.user.findMany({
    where: { role: UserRole.STUDENT },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    },
  });

  const charges = await prisma.charge.findMany({
    where: {
      status: { in: [ChargeStatus.PENDING, ChargeStatus.PARTIALLY_PAID] },
    },
    select: {
      id: true,
      userId: true,
      title: true,
      amount: true,
      currency: true,
      allocations: { select: { amount: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const chargeOptions = charges.map((c) => ({
    id: c.id,
    userId: c.userId,
    title: c.title,
    amount: Number(c.amount),
    currency: c.currency,
    alreadyPaid: c.allocations.reduce((sum, a) => sum + Number(a.amount), 0),
  }));

  return <PaymentCreateForm students={students} charges={chargeOptions} />;
}
