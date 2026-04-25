import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { getStudentDetail } from "@/features/students/queries/getStudentDetail";
import { getStudentProgressionHistory } from "@/features/progression/queries";
import { ensureStudentAxes } from "@/features/skill-axes/actions";
import ProgressionView from "@/features/progression/components/ProgressionView";
import SkillAxesManager from "@/app/[locale]/(app)/settings/skill-axes/SkillAxesManager";
import { prisma } from "@/lib/prisma";
import styles from "./ProgressionPage.module.css";

type Props = {
  params: Promise<{ id: string; locale: string }>;
};

export default async function StudentProgressionPage({ params }: Props) {
  const { id, locale } = await params;
  setRequestLocale(locale);

  const { user } = await requireAuth();
  const t = await getTranslations("studentProgression");
  const tAxes = await getTranslations("skillAxes");

  const studentData = await getStudentDetail(id, user.id);
  if (!studentData) notFound();

  const { student } = studentData;

  await ensureStudentAxes(id, user.id);

  const [{ assessments, axes }, allStudentAxes] = await Promise.all([
    getStudentProgressionHistory(id, user.id),
    prisma.skillAxis.findMany({
      where: { teacherId: user.id, studentId: id },
      orderBy: { order: "asc" },
      select: { id: true, label: true, order: true, isActive: true },
    }),
  ]);

  return (
    <div className={styles.page}>
      <Link href={`/students/${id}`} className={styles.backLink}>
        {t("back")}
      </Link>

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          {t("title")} — {student.firstName} {student.lastName}
        </h1>
      </div>

      <ProgressionView
        studentId={id}
        assessments={assessments}
        axes={axes}
        t={{
          newAssessment: t("newAssessment"),
          noAssessments: t("noAssessments"),
          assessmentOfTemplate: t.raw("assessmentOf") as string,
          avgScore: t("avgScore"),
          referenceLabel: t("referenceLabel"),
          currentLabel: t("currentLabel"),
          delete: t("delete"),
          confirmDelete: t("confirmDelete"),
          notes: t("notes"),
          formTitle: t("newAssessmentTitle"),
          formNotes: t("formNotes"),
          formNotesPlaceholder: t("formNotesPlaceholder"),
          formSave: t("formSave"),
          formCancel: t("formCancel"),
          noAxes: t("noAxes"),
          configureAxes: t("configureAxes"),
        }}
      />

      <div className={styles.axesSection}>
        <div className={styles.axesSectionHeader}>
          <h2 className={styles.axesSectionTitle}>{t("axesSectionTitle")}</h2>
          <p className={styles.axesSectionSubtitle}>{t("axesSectionSubtitle")}</p>
        </div>
        <SkillAxesManager
          axes={allStudentAxes}
          studentId={id}
          t={{
            addAxis: tAxes("addAxis"),
            labelPlaceholder: tAxes("labelPlaceholder"),
            add: tAxes("add"),
            remove: tAxes("remove"),
            noAxes: tAxes("noAxes"),
            active: tAxes("active"),
            inactive: tAxes("inactive"),
          }}
        />
      </div>
    </div>
  );
}
