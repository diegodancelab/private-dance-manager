import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import type { UnpaidCharge } from "@/features/students/queries/getStudentDetail";
import { formatDate } from "@/lib/format";
import styles from "./StudentDetail.module.css";

type Props = {
  charges: UnpaidCharge[];
  studentId: string;
};

export default async function StudentChargesSection({ charges, studentId }: Props) {
  const tLabels = await getTranslations("labels");
  const t = await getTranslations("studentDetail");
  const now = new Date();

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t("sectionUnpaidCharges")}</h2>
        <Link
          href={`/charges/new?userId=${studentId}`}
          className={styles.sectionLink}
        >
          {t("addCharge")}
        </Link>
      </div>

      {charges.length === 0 ? (
        <p className={styles.emptyText}>{t("noOutstandingCharges")}</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeadCell}>{t("colCharge")}</th>
                <th className={styles.tableHeadCell}>{t("colPaidTotal")}</th>
                <th className={styles.tableHeadCell}>{t("colRemaining")}</th>
                <th className={styles.tableHeadCell}>{t("colStatus")}</th>
                <th className={styles.tableHeadCell}>{t("colDueDate")}</th>
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
                      <StatusBadge status={charge.status} label={tLabels(charge.status)} />
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
                        {t("openCharge")}
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
