import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import StatusBadge from "@/components/ui/StatusBadge";
import type { RecentPayment } from "@/features/students/queries/getStudentDetail";
import { formatDate } from "@/lib/format";
import styles from "./StudentDetail.module.css";

type Props = {
  payments: RecentPayment[];
  studentId: string;
};

export default async function StudentRecentPaymentsSection({
  payments,
  studentId,
}: Props) {
  const tLabels = await getTranslations("labels");
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Recent payments</h2>
        <Link
          href={`/payments/new?userId=${studentId}`}
          className={styles.sectionLink}
        >
          Add payment
        </Link>
      </div>

      {payments.length === 0 ? (
        <p className={styles.emptyText}>No payments recorded.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeadCell}>Amount</th>
                <th className={styles.tableHeadCell}>Method</th>
                <th className={styles.tableHeadCell}>Status</th>
                <th className={styles.tableHeadCell}>Date</th>
                <th className={styles.tableHeadCell}></th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className={styles.tableCell}>
                    {payment.amount.toFixed(2)} {payment.currency}
                  </td>
                  <td className={styles.tableCell}>
                    {payment.method ? tLabels(payment.method) : "—"}
                  </td>
                  <td className={styles.tableCell}>
                    <StatusBadge status={payment.status} label={tLabels(payment.status)} />
                  </td>
                  <td className={styles.tableCell}>
                    {payment.paidAt ? formatDate(payment.paidAt) : "—"}
                  </td>
                  <td className={styles.tableCell}>
                    <Link
                      href={`/payments/${payment.id}`}
                      className={styles.actionLink}
                    >
                      Open payment
                    </Link>
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
