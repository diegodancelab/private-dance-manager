import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PaymentDetailPage({ params }: Props) {
  const { id } = await params;

  const payment = await prisma.payment.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
      allocations: {
        include: {
          charge: true,
        },
      },
    },
  });

  if (!payment) {
    notFound();
  }

  return (
    <div>
      <p>
        <Link href="/charges">← Back to charges</Link>
      </p>

      <h1>Payment detail</h1>

      <p>
        <strong>Student:</strong> {payment.user.firstName} {payment.user.lastName}
      </p>

      <p>
        <strong>Amount:</strong> {payment.amount.toString()} {payment.currency}
      </p>

      <p>
        <strong>Method:</strong> {payment.method ?? "—"}
      </p>

      <p>
        <strong>Status:</strong> {payment.status}
      </p>

      <p>
        <strong>Note:</strong> {payment.note ?? "—"}
      </p>

      <p>
        <strong>Paid at:</strong> {payment.paidAt ? payment.paidAt.toString() : "—"}
      </p>

      <h2>Allocations</h2>

      {payment.allocations.length === 0 ? (
        <p>No allocations.</p>
      ) : (
        <ul>
          {payment.allocations.map((allocation) => (
            <li key={allocation.id}>
              {allocation.charge.title} - {allocation.amount.toString()}{" "}
              {payment.currency}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}