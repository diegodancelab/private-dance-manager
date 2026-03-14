import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ChargeDetailPage({ params }: Props) {
  const { id } = await params;

  const charge = await prisma.charge.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
      lesson: true,
      allocations: {
        include: {
          payment: true,
        },
      },
    },
  });

  if (!charge) {
    notFound();
  }

const totalPaid = charge.allocations.reduce((sum, allocation) => {
    return sum + Number(allocation.amount);
  }, 0);

  const chargeAmount = Number(charge.amount);
  const remainingBalance = Math.max(chargeAmount - totalPaid, 0);

  return (
    <div>
      <p>
        <Link href="/charges">← Back to charges</Link>
      </p>

      <h1>Charge detail</h1>
      <p>
        <Link href="/payments/new">Create payment</Link>
    </p>

      <p>
        <strong>Student:</strong> {charge.user.firstName} {charge.user.lastName}
      </p>

      <p>
        <strong>Title:</strong> {charge.title}
      </p>

      <p>
        <strong>Description:</strong> {charge.description ?? "—"}
      </p>

      <p>
        <strong>Type:</strong> {charge.type}
      </p>

      <p>
        <strong>Amount:</strong> {charge.amount.toString()} {charge.currency}
      </p>

      <p>
        <strong>Status:</strong> {charge.status}
      </p>

      <p>
        <strong>Total paid:</strong> {totalPaid.toFixed(2)} {charge.currency}
      </p>

      <p>
        <strong>Remaining balance:</strong> {remainingBalance.toFixed(2)} {charge.currency}
      </p>

      <p>
        <strong>Lesson:</strong> {charge.lesson ? charge.lesson.title : "—"}
      </p>

      <p>
        <strong>Due at:</strong> {charge.dueAt ? charge.dueAt.toString() : "—"}
      </p>

      <h2>Allocations</h2>

      {charge.allocations.length === 0 ? (
        <p>No payments allocated yet.</p>
      ) : (
        <ul>
          {charge.allocations.map((allocation) => (
            <li key={allocation.id}>
              {allocation.amount.toString()} {charge.currency} -{" "}
              {allocation.payment.method ?? "No method"} -{" "}
              {allocation.payment.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}