import Link from "next/link";
import type { DashboardAlert } from "@/features/dashboard/queries";
import styles from "./AlertsSection.module.css";

type Props = {
  alerts: DashboardAlert[];
};

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("fr-CH", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Zurich",
  }).format(date);
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export default function AlertsSection({ alerts }: Props) {
  if (alerts.length === 0) {
    return (
      <section className={styles.section}>
        <h2 className={styles.title}>Alerts</h2>
        <p className={styles.empty}>Nothing requires your attention.</p>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>
        Alerts
        <span className={styles.count}>{alerts.length}</span>
      </h2>

      <div className={styles.list}>
        {alerts.map((alert, i) => {
          if (alert.type === "package_low") {
            return (
              <Link key={i} href={`/packages/${alert.packageId}`} className={`${styles.alert} ${styles.warning}`}>
                <span className={styles.icon}>⚠️</span>
                <div className={styles.text}>
                  <span className={styles.alertTitle}>Package running low</span>
                  <span className={styles.alertSub}>
                    {alert.studentName} — {formatMinutes(alert.remainingMinutes)} remaining
                  </span>
                </div>
              </Link>
            );
          }

          if (alert.type === "package_expiring") {
            return (
              <Link key={i} href={`/packages/${alert.packageId}`} className={`${styles.alert} ${styles.warning}`}>
                <span className={styles.icon}>🕐</span>
                <div className={styles.text}>
                  <span className={styles.alertTitle}>Package expiring soon</span>
                  <span className={styles.alertSub}>
                    {alert.studentName} — {alert.daysLeft === 1 ? "tomorrow" : `in ${alert.daysLeft} days`}
                  </span>
                </div>
              </Link>
            );
          }

          if (alert.type === "lesson_no_participant") {
            return (
              <Link key={i} href={`/lessons/${alert.lessonId}/edit`} className={`${styles.alert} ${styles.danger}`}>
                <span className={styles.icon}>👤</span>
                <div className={styles.text}>
                  <span className={styles.alertTitle}>Lesson without student</span>
                  <span className={styles.alertSub}>
                    {alert.lessonTitle} — {formatTime(alert.scheduledAt)}
                  </span>
                </div>
              </Link>
            );
          }

          if (alert.type === "lesson_no_package") {
            return (
              <Link key={i} href={`/lessons/${alert.lessonId}`} className={`${styles.alert} ${styles.info}`}>
                <span className={styles.icon}>📦</span>
                <div className={styles.text}>
                  <span className={styles.alertTitle}>No package assigned</span>
                  <span className={styles.alertSub}>
                    {alert.studentName} — {alert.lessonTitle} — {formatTime(alert.scheduledAt)}
                  </span>
                </div>
              </Link>
            );
          }

          return null;
        })}
      </div>
    </section>
  );
}
