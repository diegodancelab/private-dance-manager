import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import styles from "./StudentDetail.module.css";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function StudentDetailPage({ params }: Props) {
  const { id } = await params;

  const student = await prisma.user.findFirst({
    where: {
      id,
      role: UserRole.STUDENT,
    },
  });

  if (!student) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <Link href="/students" className={styles.backLink}>
        ← Back to students
      </Link>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h1 className={styles.cardTitle}>
            {student.firstName} {student.lastName}
          </h1>

          <div className={styles.cardActions}>
            <Link href={`/students/${student.id}/edit`} className={styles.primaryLink}>
              Edit
            </Link>
          </div>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>First name</span>
              <span className={styles.infoValue}>{student.firstName}</span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Last name</span>
              <span className={styles.infoValue}>{student.lastName}</span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValue}>{student.email ?? "—"}</span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Phone</span>
              <span className={styles.infoValue}>{student.phone ?? "—"}</span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Created at</span>
              <span className={styles.infoValue}>
                {student.createdAt.toLocaleDateString("fr-CH")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
