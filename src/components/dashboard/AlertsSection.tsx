import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { DashboardAlert } from "@/features/dashboard/queries";
import styles from "./AlertsSection.module.css";

type Props = {
  alerts: DashboardAlert[];
};

const LOCALE_MAP: Record<string, string> = {
  fr: "fr-CH",
  en: "en-GB",
  es: "es-ES",
};

export default async function AlertsSection({ alerts }: Props) {
  const t = await getTranslations("dashboard");
  const tCommon = await getTranslations("common");
  const locale = await getLocale();
  const dateLocale = LOCALE_MAP[locale] || "fr-CH";

  function formatTime(date: Date): string {
    return new Intl.DateTimeFormat(dateLocale, {
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

  if (alerts.length === 0) {
    return (
      <section className={styles.section}>
        <h2 className={styles.title}>{t("alerts")}</h2>
        <p className={styles.empty}>{t("noAlerts")}</p>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>
        {t("alerts")}
        <span className={styles.count}>{alerts.length}</span>
      </h2>

      <div className={styles.list}>
        {alerts.map((alert, i) => {
          if (alert.type === "package_low") {
            return (
              <Link key={i} href={`/packages/${alert.packageId}`} className={`${styles.alert} ${styles.warning}`}>
                <div className={styles.text}>
                  <span className={styles.alertTitle}>{t("packageRunningLow")}</span>
                  <span className={styles.alertSub}>
                    {alert.studentName} — {formatMinutes(alert.remainingMinutes)} {tCommon("remaining")}
                  </span>
                </div>
              </Link>
            );
          }

          if (alert.type === "package_expiring") {
            return (
              <Link key={i} href={`/packages/${alert.packageId}`} className={`${styles.alert} ${styles.warning}`}>
                <div className={styles.text}>
                  <span className={styles.alertTitle}>{t("packageExpiringSoon")}</span>
                  <span className={styles.alertSub}>
                    {alert.studentName} — {alert.daysLeft === 1 ? t("expiringTomorrow") : t("expiringInDays", { days: alert.daysLeft })}
                  </span>
                </div>
              </Link>
            );
          }

          if (alert.type === "lesson_no_participant") {
            return (
              <Link key={i} href={`/lessons/${alert.lessonId}/edit`} className={`${styles.alert} ${styles.danger}`}>
                <div className={styles.text}>
                  <span className={styles.alertTitle}>{t("lessonWithoutStudent")}</span>
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
                <div className={styles.text}>
                  <span className={styles.alertTitle}>{t("noPackageAssigned")}</span>
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
