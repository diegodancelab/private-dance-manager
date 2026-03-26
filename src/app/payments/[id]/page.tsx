import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./PaymentDetail.module.css";

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
    <div className={styles.page}>
      <Link href="/payments" className={styles.backLink}>
        ← Back to payments
      </Link>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h1 className={styles.cardTitle}>
            Payment — {payment.amount.toString()} {payment.currency}
          </h1>

          <div className={styles.cardActions}>
            <Link
              href={`/payments/${payment.id}/edit`}
              className={styles.secondaryLink}
            >
              Edit
            </Link>
          </div>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Student</span>
              <span className={styles.infoValue}>
                {payment.user.firstName} {payment.user.lastName}
              </span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Amount</span>
              <span className={styles.infoValue}>
                {payment.amount.toString()} {payment.currency}
              </span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Method</span>
              <span className={styles.infoValue}>{payment.method ?? "—"}</span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Status</span>
              <span className={styles.infoValue}>{payment.status}</span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Paid at</span>
              <span className={styles.infoValue}>
                {payment.paidAt
                  ? new Intl.DateTimeFormat("fr-CH", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(payment.paidAt)
                  : "—"}
              </span>
            </div>

            {payment.note ? (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Note</span>
                <span className={styles.infoValue}>{payment.note}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Charge allocations</h2>

          {payment.allocations.length === 0 ? (
            <p className={styles.emptyText}>No allocations.</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.tableHeadCell}>Charge</th>
                    <th className={styles.tableHeadCell}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {payment.allocations.map((allocation) => (
                    <tr key={allocation.id}>
                      <td className={styles.tableCell}>
                        {allocation.charge.title}
                      </td>
                      <td className={styles.tableCell}>
                        {allocation.amount.toString()} {payment.currency}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
