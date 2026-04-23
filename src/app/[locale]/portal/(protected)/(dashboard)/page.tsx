import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireStudentAuth } from "@/lib/auth/require-auth";
import { getStudentDashboard } from "@/features/portal/queries/getStudentDashboard";
import { Link } from "@/i18n/navigation";
import { formatMinutes } from "@/lib/format";
import { Clock, CheckCircle, Star, Calendar, MapPin } from "lucide-react";
import Badge from "@/components/ui/Badge/Badge";
import styles from "./PortalDashboard.module.css";

type Props = { params: Promise<{ locale: string }> };

export default async function PortalDashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { user } = await requireStudentAuth();
  const t = await getTranslations("portal.dashboard");
  const tLabels = await getTranslations("labels");

  const data = await getStudentDashboard(user.id);
  const { nextLesson, activePackage, lastAssessmentDate, stats, lastAssessmentTopSkills } = data;

  const packagePct = activePackage
    ? Math.round((activePackage.remainingMinutes / activePackage.totalMinutes) * 100)
    : 0;

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.greeting}>{t("greeting", { name: user.firstName })}</h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>
        </div>
        <button className={styles.btnBook} disabled>
          {t("bookLesson")}
        </button>
      </div>

      {/* Hero — next lesson */}
      {nextLesson ? (
        <div className={styles.heroCard}>
          <div className={styles.heroLabel}>
            <Clock size={14} />
            {t("nextLesson")}
          </div>
          <div className={styles.heroTitle}>{nextLesson.title}</div>
          <div className={styles.heroMeta}>
            <span>
              <Calendar size={15} />
              {nextLesson.scheduledAt.toLocaleDateString("fr-CH", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}{" "}
              ·{" "}
              {nextLesson.scheduledAt.toLocaleTimeString("fr-CH", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span>
              <Clock size={15} />
              {nextLesson.durationMin} min
            </span>
            {nextLesson.location && (
              <span>
                <MapPin size={15} />
                {nextLesson.location}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.heroEmpty}>
          <div className={styles.heroEmptyIcon}><Calendar size={22} /></div>
          <div className={styles.heroEmptyTitle}>{t("noNextLessonTitle")}</div>
          <div className={styles.heroEmptyDesc}>{t("noNextLessonDesc")}</div>
        </div>
      )}

      {/* KPI tiles */}
      <div className={styles.grid3}>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.kpiIconIndigo}`}><Clock size={20} /></div>
          <div className={styles.kpiMeta}>
            <div className={styles.kpiValue}>{formatMinutes(stats.totalMinutes)}</div>
            <div className={styles.kpiLabel}>{t("stats.totalTime")}</div>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.kpiIconGreen}`}><CheckCircle size={20} /></div>
          <div className={styles.kpiMeta}>
            <div className={styles.kpiValue}>{stats.lessonsCompletedCount}</div>
            <div className={styles.kpiLabel}>{t("stats.completedLessons")}</div>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.kpiIconAmber}`}><Star size={20} /></div>
          <div className={styles.kpiMeta}>
            <div className={styles.kpiValue}>
              {stats.lastAssessmentAverage !== null ? (
                <>{stats.lastAssessmentAverage}<span className={styles.kpiUnit}>/10</span></>
              ) : "—"}
            </div>
            <div className={styles.kpiLabel}>{t("stats.averageScore")}</div>
          </div>
        </div>
      </div>

      {/* Package + last assessment */}
      <div className={styles.grid2}>
        {/* Package card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <div className={styles.cardLabel}>{t("packageStatus")}</div>
              {activePackage && <div className={styles.cardTitle}>{activePackage.name}</div>}
            </div>
            {activePackage && <Badge variant="success" dot>{t("packageActive")}</Badge>}
          </div>
          {activePackage ? (
            <>
              <div className={styles.kpiRow}>
                <span className={styles.kpiValueLg}>{formatMinutes(activePackage.remainingMinutes)}</span>
                <span className={styles.kpiUnit}>/ {formatMinutes(activePackage.totalMinutes)}</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${packagePct}%` }} />
              </div>
              <div className={styles.cardFooter}>
                {activePackage.expiresAt ? (
                  <span>{t("packageExpiresOn", {
                    date: activePackage.expiresAt.toLocaleDateString("fr-CH", {
                      day: "numeric", month: "long", year: "numeric",
                    }),
                  })}</span>
                ) : <span />}
                <span />
              </div>
            </>
          ) : (
            <p className={styles.cardEmpty}>{t("noActivePackage")}</p>
          )}
        </div>

        {/* Last assessment card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <div className={styles.cardLabel}>{t("lastAssessment")}</div>
              {lastAssessmentDate && (
                <div className={styles.cardTitle}>
                  {lastAssessmentDate.toLocaleDateString("fr-CH", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </div>
              )}
            </div>
            {lastAssessmentDate && (
              <Link href="/portal/progression" className={styles.btnSeeMore}>
                {t("seeMore")} →
              </Link>
            )}
          </div>
          {lastAssessmentTopSkills.length > 0 ? (
            <div className={styles.skillList}>
              {lastAssessmentTopSkills.map((skill) => (
                <div key={skill.label} className={styles.skill}>
                  <div className={styles.skillHead}>
                    <span className={styles.skillName}>{skill.label}</span>
                    <span className={styles.skillValue}>{skill.score}/10</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${skill.score * 10}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.cardEmpty}>{t("noAssessment")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
