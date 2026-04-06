import { getTranslations } from "next-intl/server";
import type { StudentSummary } from "@/features/students/queries/getStudentDetail";
import { formatDate, formatMinutes } from "@/lib/format";
import styles from "./StudentSummaryCards.module.css";

type Props = {
  summary: StudentSummary;
};

export default async function StudentSummaryCards({ summary }: Props) {
  const t = await getTranslations("studentDetail");

  const STATUS_CONFIG = {
    healthy: {
      label: t("statusHealthy"),
      cardClass: "statusHealthy",
      valueClass: "valueHealthy",
    },
    warning: {
      label: t("statusHasDues"),
      cardClass: "statusWarning",
      valueClass: "valueWarning",
    },
    overdue: {
      label: t("statusOverdue"),
      cardClass: "statusOverdue",
      valueClass: "valueOverdue",
    },
  };

  const statusCfg = STATUS_CONFIG[summary.status];

  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <p className={styles.label}>{t("cardOutstanding")}</p>
        <p className={styles.value}>
          {summary.outstandingBalance > 0
            ? `${summary.outstandingBalance.toFixed(2)} ${summary.outstandingCurrency}`
            : t("allClear")}
        </p>
      </div>

      <div className={styles.card}>
        <p className={styles.label}>{t("cardPackageTime")}</p>
        <p className={styles.value}>
          {summary.activePackageRemainingMinutes > 0
            ? formatMinutes(summary.activePackageRemainingMinutes)
            : t("noneActive")}
        </p>
      </div>

      <div className={styles.card}>
        <p className={styles.label}>{t("cardNextLesson")}</p>
        <p className={styles.value}>
          {summary.nextLessonDate
            ? formatDate(summary.nextLessonDate)
            : t("noneScheduled")}
        </p>
      </div>

      <div className={styles.card}>
        <p className={styles.label}>{t("cardUpcomingLessons")}</p>
        <p className={styles.value}>
          {t("upcomingCount", { count: summary.upcomingLessonsCount })}
        </p>
      </div>

      <div className={`${styles.card} ${styles[statusCfg.cardClass]}`}>
        <p className={styles.label}>{t("cardStatus")}</p>
        <p className={`${styles.value} ${styles[statusCfg.valueClass]}`}>
          {statusCfg.label}
        </p>
      </div>

      <div className={styles.card}>
        <p className={styles.label}>{t("cardLastPayment")}</p>
        <p className={styles.value}>
          {summary.lastPaymentDate
            ? formatDate(summary.lastPaymentDate)
            : t("never")}
        </p>
      </div>
    </div>
  );
}
