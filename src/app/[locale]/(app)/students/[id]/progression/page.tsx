import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { getStudentDetail } from "@/features/students/queries/getStudentDetail";
import { getStudentProgressionHistory } from "@/features/progression/queries";
import ProgressionView from "@/features/progression/components/ProgressionView";
import styles from "./ProgressionPage.module.css";

type Props = {
  params: Promise<{ id: string; locale: string }>;
};

export default async function StudentProgressionPage({ params }: Props) {
  const { id, locale } = await params;
  setRequestLocale(locale);

  const { user } = await requireAuth();
  const t = await getTranslations("studentProgression");

  const studentData = await getStudentDetail(id, user.id);
  if (!studentData) notFound();

  const { student } = studentData;
  const { assessments, axes } = await getStudentProgressionHistory(id, user.id);

  return (
    <div className={styles.page}>
      <Link href={`/students/${id}`} className={styles.backLink}>
        {t("back")}
      </Link>

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          {t("title")} — {student.firstName} {student.lastName}
        </h1>
        <Link href="/settings/skill-axes" className={styles.manageAxesLink}>
          {t("manageAxes")}
        </Link>
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
    </div>
  );
}
