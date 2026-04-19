import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireStudentAuth } from "@/lib/auth/require-auth";
import { getStudentAssessments } from "@/features/portal/queries/getStudentAssessments";
import RadarChart from "@/features/portal/components/RadarChart";
import Avatar from "@/components/ui/Avatar/Avatar";
import Badge from "@/components/ui/Badge/Badge";
import styles from "./PortalProgression.module.css";

type Props = { params: Promise<{ locale: string }> };

export default async function PortalProgressionPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { user } = await requireStudentAuth();
  const t = await getTranslations("portal.progression");

  const assessments = await getStudentAssessments(user.id, 10);
  const latest = assessments[0] ?? null;
  const history = assessments.slice(1);

  function formatDate(date: Date) {
    return date.toLocaleDateString("fr-CH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t("title")}</h1>
          <p className={styles.pageSubtitle}>{t("subtitle")}</p>
        </div>
        <button className={styles.btnExport} disabled>{t("export")}</button>
      </div>

      {assessments.length === 0 ? (
        <p className={styles.emptyText}>{t("noAssessments")}</p>
      ) : (
        <div className={styles.progGrid}>
          {/* ── Left: latest assessment ── */}
          {latest && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <div className={styles.cardLabel}>{t("latestAssessment")}</div>
                  <div className={styles.cardTitle}>{formatDate(latest.createdAt)}</div>
                </div>
                <Badge variant="primary">
                  {t("averageLabel", { score: latest.averageScore })}
                </Badge>
              </div>

              <div className={styles.radarWrap}>
                <RadarChart
                  data={latest.scores.map((s) => ({ label: s.axisLabel, score: s.score }))}
                  size={280}
                />
              </div>

              <div className={styles.skillList}>
                {latest.scores.map((s) => (
                  <div key={s.axisId} className={styles.skill}>
                    <div className={styles.skillHead}>
                      <span className={styles.skillName}>{s.axisLabel}</span>
                      <span className={styles.skillValue}>{s.score}/10</span>
                    </div>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${s.score * 10}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {latest.notes && (
                <div className={styles.coachQuote}>
                  {latest.notes}
                  <div className={styles.coachMeta}>
                    <Avatar
                      initials={`${latest.teacher.firstName[0]}${latest.teacher.lastName[0]}`}
                      size="sm"
                      gradient="cool"
                    />
                    <span>{latest.teacher.firstName} {latest.teacher.lastName} · {t("coachLabel")}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Right: history ── */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>{t("history")}</div>
              <span className={styles.cardLabel}>
                {t("countBilans", { count: assessments.length })}
              </span>
            </div>

            <div className={styles.timeline}>
              {assessments.map((assessment, idx) => (
                <div key={assessment.id} className={styles.timelineItem}>
                  <div
                    className={styles.timelineDot}
                    style={idx > 0 ? { background: "var(--c-text-muted)", boxShadow: "0 0 0 4px #f1f5f9" } : undefined}
                  />
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineDate}>
                      {formatDate(assessment.createdAt)} · {t("averageLabel", { score: assessment.averageScore })}
                    </div>
                    {assessment.notes && (
                      <div className={styles.timelineDesc}>{assessment.notes}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
