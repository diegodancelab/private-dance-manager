import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireStudentAuth } from "@/lib/auth/require-auth";
import { getStudentAssessments } from "@/features/portal/queries/getStudentAssessments";
import RadarChart from "@/features/portal/components/RadarChart";
import styles from "./PortalProgression.module.css";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PortalProgressionPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { user } = await requireStudentAuth();
  const t = await getTranslations("portal.progression");

  const assessments = await getStudentAssessments(user.id, 5);

  const latest = assessments[0] ?? null;
  const history = assessments.slice(1);

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>{t("title")}</h1>

      {assessments.length === 0 ? (
        <p className={styles.emptyText}>{t("noAssessments")}</p>
      ) : (
        <>
          {/* Latest radar */}
          {latest && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t("latestAssessment")}</h2>
              <div className={styles.radarCard}>
                <div className={styles.radarWrapper}>
                  <RadarChart data={latest.scores.map((s) => ({ label: s.axisLabel, score: s.score }))} size={280} />
                </div>
                <p className={styles.assessmentDate}>
                  {t("assessmentOf", {
                    date: latest.createdAt.toLocaleDateString("fr-CH", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }),
                  })}
                </p>
              </div>
            </section>
          )}

          {/* History */}
          {history.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t("history")}</h2>
              <ul className={styles.historyList}>
                {history.map((assessment) => (
                  <li key={assessment.id} className={styles.historyCard}>
                    <p className={styles.historyDate}>
                      {t("assessmentOf", {
                        date: assessment.createdAt.toLocaleDateString("fr-CH", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }),
                      })}
                    </p>
                    <div className={styles.historyRadar}>
                      <RadarChart
                        data={assessment.scores.map((s) => ({ label: s.axisLabel, score: s.score }))}
                        size={200}
                      />
                    </div>
                    <ul className={styles.scoreList}>
                      {assessment.scores.map((s) => (
                        <li key={s.axisId} className={styles.scoreItem}>
                          <span className={styles.scoreLabel}>{s.axisLabel}</span>
                          <span className={styles.scoreBar}>
                            <span
                              className={styles.scoreBarFill}
                              style={{ width: `${s.score * 10}%` }}
                            />
                          </span>
                          <span className={styles.scoreValue}>{s.score}</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
