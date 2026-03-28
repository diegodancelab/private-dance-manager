import { prisma } from "@/lib/prisma";
import { UserRole, ChargeStatus } from "@/generated/prisma/client";
import { requireAuth } from "@/lib/auth/require-auth";
import PaymentCreateForm from "./PaymentCreateForm";

type Props = {
  searchParams: Promise<{
    chargeId?: string;
    userId?: string;
    amount?: string;
  }>;
};

export default async function NewPaymentPage({ searchParams }: Props) {
  const { user } = await requireAuth();
  const { chargeId, userId, amount } = await searchParams;
  const students = await prisma.user.findMany({
    where: { role: UserRole.STUDENT, createdByTeacherId: user.id },
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
      teacherId: user.id,
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

  return (
    <PaymentCreateForm
      students={students}
      charges={chargeOptions}
      preselect={{ chargeId, userId, amount }}
    />
  );
}
