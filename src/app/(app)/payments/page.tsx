import Link from "next/link";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/ui/StatusBadge";
import { getLabel } from "@/lib/labels";
import styles from "./PaymentsPage.module.css";

function formatAmount(amount: string | number, currency: string) {
  return `${amount} ${currency}`;
}

function formatDateTime(date: Date | null) {
  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat("fr-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default async function PaymentsPage() {
  const payments = await prisma.payment.findMany({
    orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <h1 className={styles.title}>Payments</h1>
          <p className={styles.subtitle}>
            Track received money from your students.
          </p>
        </div>

        <Link href="/payments/new" className={styles.createLink}>
          Create payment
        </Link>
      </div>

      {payments.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No payments yet.</p>
          <p className={styles.emptySubtext}>
            Create your first payment to start tracking received money.
          </p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeadCell}>Student</th>
                <th className={styles.tableHeadCell}>Amount</th>
                <th className={styles.tableHeadCell}>Method</th>
                <th className={styles.tableHeadCell}>Status</th>
                <th className={styles.tableHeadCell}>Paid at</th>
                <th className={styles.tableHeadCell}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className={styles.tableCell}>
                    {payment.user.firstName} {payment.user.lastName}
                  </td>

                  <td className={styles.tableCell}>
                    {formatAmount(String(payment.amount), payment.currency)}
                  </td>

                  <td className={styles.tableCell}>
                    {payment.method ? getLabel(payment.method) : "—"}
                  </td>

                  <td className={styles.tableCell}>
                    <StatusBadge status={payment.status} />
                  </td>

                  <td className={styles.tableCell}>
                    {formatDateTime(payment.paidAt)}
                  </td>

                  <td className={styles.tableCell}>
                    <div className={styles.actions}>
                      <Link
                        href={`/payments/${payment.id}`}
                        className={styles.actionLink}
                      >
                        View
                      </Link>
                      <Link
                        href={`/payments/${payment.id}/edit`}
                        className={styles.actionLink}
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}