import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { requireStudentAuth } from "@/lib/auth/require-auth";
import { getStudentDashboard } from "@/features/portal/queries/getStudentDashboard";
import { formatMinutes } from "@/lib/format";
import styles from "./PortalDashboard.module.css";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PortalDashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { user } = await requireStudentAuth();
  const t = await getTranslations("portal.dashboard");
  const tLabels = await getTranslations("labels");

  const data = await getStudentDashboard(user.id);
  const { nextLesson, activePackage, lastAssessmentDate } = data;

  return (
    <div className={styles.page}>
      <h1 className={styles.greeting}>{t("greeting", { name: user.firstName })}</h1>

      <div className={styles.cards}>
        {/* Next lesson */}
        <div className={styles.card}>
          <span className={styles.cardLabel}>{t("nextLesson")}</span>
          {nextLesson ? (
            <>
              <span className={styles.cardValue}>{nextLesson.title}</span>
              <span className={styles.cardSub}>
                {nextLesson.scheduledAt.toLocaleDateString("fr-CH", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}{" "}
                —{" "}
                {nextLesson.scheduledAt.toLocaleTimeString("fr-CH", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className={styles.cardSub}>
                {tLabels(nextLesson.lessonType as Parameters<typeof tLabels>[0])}{" "}
                · {nextLesson.durationMin} min
                {nextLesson.location ? ` · ${nextLesson.location}` : ""}
              </span>
            </>
          ) : (
            <span className={styles.cardEmpty}>{t("noUpcomingLesson")}</span>
          )}
        </div>

        {/* Package status */}
        <div className={styles.card}>
          <span className={styles.cardLabel}>{t("packageStatus")}</span>
          {activePackage ? (
            <>
              <span className={styles.cardValue}>{activePackage.name}</span>
              <span className={styles.cardSub}>
                {t("remainingTime", {
                  time: formatMinutes(activePackage.remainingMinutes),
                })}
              </span>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${Math.round(
                      (activePackage.remainingMinutes / activePackage.totalMinutes) * 100
                    )}%`,
                  }}
                />
              </div>
            </>
          ) : (
            <span className={styles.cardEmpty}>{t("noActivePackage")}</span>
          )}
        </div>

        {/* Last assessment */}
        <div className={styles.card}>
          <span className={styles.cardLabel}>{t("lastAssessment")}</span>
          {lastAssessmentDate ? (
            <span className={styles.cardValue}>
              {lastAssessmentDate.toLocaleDateString("fr-CH", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          ) : (
            <span className={styles.cardEmpty}>{t("noAssessment")}</span>
          )}
        </div>
      </div>
    </div>
  );
}
