import type { StudentSummary } from "@/features/students/queries/getStudentDetail";
import { formatDate, formatMinutes } from "@/lib/format";
import styles from "./StudentSummaryCards.module.css";

type Props = {
  summary: StudentSummary;
};

const STATUS_CONFIG = {
  healthy: {
    label: "Healthy",
    cardClass: "statusHealthy",
    valueClass: "valueHealthy",
  },
  warning: {
    label: "Has dues",
    cardClass: "statusWarning",
    valueClass: "valueWarning",
  },
  overdue: {
    label: "Overdue",
    cardClass: "statusOverdue",
    valueClass: "valueOverdue",
  },
};

export default function StudentSummaryCards({ summary }: Props) {
  const statusCfg = STATUS_CONFIG[summary.status];

  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <p className={styles.label}>Outstanding</p>
        <p className={styles.value}>
          {summary.outstandingBalance > 0
            ? `${summary.outstandingBalance.toFixed(2)} ${summary.outstandingCurrency}`
            : "All clear"}
        </p>
      </div>

      <div className={styles.card}>
        <p className={styles.label}>Package time</p>
        <p className={styles.value}>
          {summary.activePackageRemainingMinutes > 0
            ? formatMinutes(summary.activePackageRemainingMinutes)
            : "None active"}
        </p>
      </div>

      <div className={styles.card}>
        <p className={styles.label}>Next lesson</p>
        <p className={styles.value}>
          {summary.nextLessonDate
            ? formatDate(summary.nextLessonDate)
            : "None scheduled"}
        </p>
      </div>

      <div className={styles.card}>
        <p className={styles.label}>Upcoming lessons</p>
        <p className={styles.value}>
          {summary.upcomingLessonsCount > 0
            ? `${summary.upcomingLessonsCount} lesson${summary.upcomingLessonsCount > 1 ? "s" : ""}`
            : "None"}
        </p>
      </div>

      <div className={`${styles.card} ${styles[statusCfg.cardClass]}`}>
        <p className={styles.label}>Status</p>
        <p className={`${styles.value} ${styles[statusCfg.valueClass]}`}>
          {statusCfg.label}
        </p>
      </div>

      <div className={styles.card}>
        <p className={styles.label}>Last payment</p>
        <p className={styles.value}>
          {summary.lastPaymentDate
            ? formatDate(summary.lastPaymentDate)
            : "Never"}
        </p>
      </div>
    </div>
  );
}
