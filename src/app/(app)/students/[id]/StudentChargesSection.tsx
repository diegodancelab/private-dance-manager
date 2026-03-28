import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import type { UnpaidCharge } from "@/features/students/queries/getStudentDetail";
import { formatDate } from "@/lib/format";
import styles from "./StudentDetail.module.css";

type Props = {
  charges: UnpaidCharge[];
  studentId: string;
};

export default function StudentChargesSection({ charges, studentId }: Props) {
  const now = new Date();

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Unpaid charges</h2>
        <Link
          href={`/charges/new?userId=${studentId}`}
          className={styles.sectionLink}
        >
          Add charge
        </Link>
      </div>

      {charges.length === 0 ? (
        <p className={styles.emptyText}>No outstanding charges.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeadCell}>Charge</th>
                <th className={styles.tableHeadCell}>Paid / Total</th>
                <th className={styles.tableHeadCell}>Remaining</th>
                <th className={styles.tableHeadCell}>Status</th>
                <th className={styles.tableHeadCell}>Due date</th>
                <th className={styles.tableHeadCell}></th>
              </tr>
            </thead>
            <tbody>
              {charges.map((charge) => {
                const remaining = charge.amount - charge.alreadyPaid;
                const pct =
                  charge.amount > 0
                    ? Math.round((charge.alreadyPaid / charge.amount) * 100)
                    : 0;
                const isOverdue =
                  charge.dueAt !== null && charge.dueAt < now;

                return (
                  <tr key={charge.id}>
                    <td className={styles.tableCell}>{charge.title}</td>
                    <td className={styles.tableCell}>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className={styles.progressLabel}>
                        {charge.alreadyPaid.toFixed(2)} /{" "}
                        {charge.amount.toFixed(2)} {charge.currency}
                      </p>
                    </td>
                    <td className={styles.tableCell}>
                      <span className={styles.amountDue}>
                        {remaining.toFixed(2)} {charge.currency}
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      <StatusBadge status={charge.status} />
                    </td>
                    <td
                      className={`${styles.tableCell} ${isOverdue ? styles.overdueDate : ""}`}
                    >
                      {formatDate(charge.dueAt)}
                    </td>
                    <td className={styles.tableCell}>
                      <Link
                        href={`/charges/${charge.id}`}
                        className={styles.actionLink}
                      >
                        Open charge
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
