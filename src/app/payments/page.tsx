import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function PaymentsPage() {
  const payments = await prisma.payment.findMany({
    orderBy: {
      createdAt: "desc",
    }
  });

  return (
    <div>
      <h1>Payments</h1>

      <p>
        <Link href="/payments/new">Create </Link>
      </p>

      <ul>
        {payments.map((payment) => (
          <li key={payment.id}>
            <Link href={`/payments/${payment.id}`}>
              {payment.amount.toString()} {payment.currency}
            </Link>{" "}
            - {payment.method} - {payment.status}
          </li>
        ))}
      </ul>
    </div>
  );
}