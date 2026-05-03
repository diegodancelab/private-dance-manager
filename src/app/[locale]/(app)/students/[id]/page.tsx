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
import StudentPortalAccessCard from "@/features/students/components/StudentPortalAccessCard";
import StudentActionsDropdown from "@/features/students/components/StudentActionsDropdown";
import StudentProgrammePanel from "@/features/programmes/components/StudentProgrammePanel";
import Button from "@/components/ui/Button/Button";
import styles from "@/features/students/components/StudentDetail.module.css";
import { getStudentProgramme, getTeacherProgrammes } from "@/features/programmes/queries";

type Props = {
  params: Promise<{ id: string; locale: string }>;
};

export default async function StudentDetailPage({ params }: Props) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const { user } = await requireAuth();
  const t = await getTranslations("studentDetail");
  const tCommon = await getTranslations("common");
  const tPortal = await getTranslations("portalAccess");
  const tProg = await getTranslations("programmes");

  const [data, studentProgramme, teacherProgrammes] = await Promise.all([
    getStudentDetail(id, user.id),
    getStudentProgramme(id, user.id),
    getTeacherProgrammes(user.id),
  ]);

  if (!data) notFound();

  const { student, summary, unpaidCharges, packages, upcomingLessons, recentPayments, portalAccess } = data;

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
          <StudentActionsDropdown
            studentId={student.id}
            labels={{
              trigger: t("actions"),
              addLesson: t("addLesson"),
              addPayment: t("addPayment"),
              addCharge: t("addCharge"),
              addPackage: t("addPackage"),
            }}
          />
          <Button
            href={`/students/${student.id}/progression`}
            variant="secondary"
            size="sm"
          >
            {t("progressionLink")}
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
        <StudentPortalAccessCard
          studentId={student.id}
          hasEmail={!!student.email}
          portalAccess={portalAccess}
          t={{
            cardTitle: tPortal("cardTitle"),
            statusInactive: tPortal("statusInactive"),
            statusPending: tPortal("statusPending"),
            statusActive: tPortal("statusActive"),
            activatedOn: portalAccess.activatedAt
              ? tPortal("activatedOn", { date: portalAccess.activatedAt.toLocaleDateString("fr-CH") })
              : "",
            activate: tPortal("activate"),
            resend: tPortal("resend"),
            deactivate: tPortal("deactivate"),
            emailRequired: tPortal("emailRequired"),
            addEmailAndActivate: tPortal("addEmailAndActivate"),
            emailLabel: tPortal("emailLabel"),
            emailPlaceholder: tPortal("emailPlaceholder"),
            sendInvitation: tPortal("sendInvitation"),
            cancel: tPortal("cancel"),
            confirmDeactivate: tPortal("confirmDeactivate"),
            confirmDeactivateConfirm: tPortal("confirmDeactivateConfirm"),
            confirmDeactivateBack: tPortal("confirmDeactivateBack"),
          }}
        />
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{tProg("studentProgramme")}</h2>
          </div>
          <StudentProgrammePanel
            studentId={student.id}
            studentProgramme={studentProgramme}
            teacherProgrammes={teacherProgrammes}
            t={{
              studentProgramme: tProg("studentProgramme"),
              assignProgramme: tProg("assignProgramme"),
              selectProgramme: tProg("selectProgramme"),
              assign: tProg("assign"),
              unassign: tProg("unassign"),
              progress: tProg.raw("progress") as string,
              NOT_STARTED: tProg("NOT_STARTED"),
              INTRODUCED: tProg("INTRODUCED"),
              IN_PROGRESS: tProg("IN_PROGRESS"),
              MASTERED: tProg("MASTERED"),
              noAssignedProgramme: tProg("noAssignedProgramme"),
              optional: tProg("optional"),
            }}
          />
        </div>
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
