import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getStudentDetail } from "@/features/students/queries/getStudentDetail";
import { requireAuth } from "@/lib/auth/require-auth";
import StudentSummaryCards from "@/features/students/components/StudentSummaryCards";
import StudentInfoCard from "@/features/students/components/StudentInfoCard";
import StudentChargesSection from "@/features/students/components/StudentChargesSection";
import StudentPackagesSection from "@/features/students/components/StudentPackagesSection";
import StudentLessonsSection from "@/features/students/components/StudentLessonsSection";
import StudentRecentPaymentsSection from "@/features/students/components/StudentRecentPaymentsSection";
import Button from "@/components/ui/Button/Button";
import styles from "@/features/students/components/StudentDetail.module.css";

type Props = {
  params: Promise<{ id: string; locale: string }>;
};

export default async function StudentDetailPage({ params }: Props) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const { user } = await requireAuth();
  const t = await getTranslations("studentDetail");
  const tCommon = await getTranslations("common");
  const data = await getStudentDetail(id, user.id);

  if (!data) notFound();

  const { student, summary, unpaidCharges, packages, upcomingLessons, recentPayments } = data;

  return (
    <div className={styles.page}>
      <Link href="/students" className={styles.backLink}>
        {t("back")}
      </Link>

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          {student.firstName} {student.lastName}
        </h1>
        <div className={styles.quickActions}>
          <Button href={`/lessons/new?studentId=${student.id}`} size="sm">
            {t("addLesson")}
          </Button>
          <Button href={`/payments/new?userId=${student.id}`} size="sm">
            {t("addPayment")}
          </Button>
          <Button href={`/charges/new?userId=${student.id}`} size="sm">
            {t("addCharge")}
          </Button>
          <Button href={`/packages/new?userId=${student.id}`} size="sm">
            {t("addPackage")}
          </Button>
          <Button
            href={`/students/${student.id}/edit`}
            variant="secondary"
            size="sm"
          >
            {tCommon("edit")}
          </Button>
        </div>
      </div>

      <StudentSummaryCards summary={summary} />

      <div className={styles.card}>
        <StudentInfoCard student={student} />
        <StudentChargesSection charges={unpaidCharges} studentId={student.id} />
        <StudentPackagesSection packages={packages} />
        <StudentLessonsSection lessons={upcomingLessons} />
        <StudentRecentPaymentsSection
          payments={recentPayments}
          studentId={student.id}
        />
      </div>
    </div>
  );
}
