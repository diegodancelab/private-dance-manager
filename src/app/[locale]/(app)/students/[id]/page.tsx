import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getStudentDetail } from "@/features/students/queries/getStudentDetail";
import { requireAuth } from "@/lib/auth/require-auth";
import StudentSummaryCards from "./StudentSummaryCards";
import StudentInfoCard from "./StudentInfoCard";
import StudentChargesSection from "./StudentChargesSection";
import StudentPackagesSection from "./StudentPackagesSection";
import StudentLessonsSection from "./StudentLessonsSection";
import StudentRecentPaymentsSection from "./StudentRecentPaymentsSection";
import Button from "@/components/ui/Button";
import styles from "./StudentDetail.module.css";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function StudentDetailPage({ params }: Props) {
  const { id } = await params;
  const { user } = await requireAuth();
  const data = await getStudentDetail(id, user.id);

  if (!data) notFound();

  const { student, summary, unpaidCharges, packages, upcomingLessons, recentPayments } = data;

  return (
    <div className={styles.page}>
      <Link href="/students" className={styles.backLink}>
        ← Back to students
      </Link>

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          {student.firstName} {student.lastName}
        </h1>
        <div className={styles.quickActions}>
          <Button href={`/lessons/new?studentId=${student.id}`} size="sm">
            Add lesson
          </Button>
          <Button href={`/payments/new?userId=${student.id}`} size="sm">
            Add payment
          </Button>
          <Button href={`/charges/new?userId=${student.id}`} size="sm">
            Add charge
          </Button>
          <Button href={`/packages/new?userId=${student.id}`} size="sm">
            Add package
          </Button>
          <Button
            href={`/students/${student.id}/edit`}
            variant="secondary"
            size="sm"
          >
            Edit
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
