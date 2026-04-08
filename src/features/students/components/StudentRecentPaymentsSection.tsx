import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Eye } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
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
  const t = await getTranslations("studentDetail");
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t("sectionRecentPayments")}</h2>
        <Link
          href={`/payments/new?userId=${studentId}`}
          className={styles.sectionLink}
        >
          {t("addPayment")}
        </Link>
      </div>

      {payments.length === 0 ? (
        <p className={styles.emptyText}>{t("noPaymentsRecorded")}</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeadCell}>{t("colAmount")}</th>
                <th className={styles.tableHeadCell}>{t("colMethod")}</th>
                <th className={styles.tableHeadCell}>{t("colStatus")}</th>
                <th className={styles.tableHeadCell}>{t("colDate")}</th>
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
                      className={styles.actionIconLink}
                      title={t("openPayment")}
                    >
                      <Eye size={16} />
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
