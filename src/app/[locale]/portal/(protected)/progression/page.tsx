import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireStudentAuth } from "@/lib/auth/require-auth";
import { getStudentAssessments } from "@/features/portal/queries/getStudentAssessments";
import ProgressionView from "@/features/portal/components/ProgressionView";
import styles from "./PortalProgression.module.css";

type Props = { params: Promise<{ locale: string }> };

export default async function PortalProgressionPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { user } = await requireStudentAuth();
  const t = await getTranslations("portal.progression");

  const assessments = await getStudentAssessments(user.id, 20);

  const dateLocale = locale === "fr" ? "fr-CH" : locale === "es" ? "es-ES" : "en-GB";

  const serialized = assessments.map((a) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
  }));

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
        <ProgressionView
          assessments={serialized}
          dateLocale={dateLocale}
          labels={{
            latestAssessment: t("latestAssessment"),
            averageLabel: t.raw("averageLabel") as string,
            compareWith: t("compareWith"),
            compareNone: t("compareNone"),
            coachLabel: t("coachLabel"),
            history: t("history"),
            countBilans: t.raw("countBilans") as string,
            referenceTag: t("referenceTag"),
          }}
        />
      )}
    </div>
  );
}
