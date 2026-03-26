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

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("fr-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

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

  const packages = await prisma.package.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      totalMinutes: true,
      remainingMinutes: true,
      status: true,
      expiresAt: true,
    },
  });

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

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Packages</h2>

          {packages.length === 0 ? (
            <p className={styles.emptyText}>No packages assigned.</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.tableHeadCell}>Name</th>
                    <th className={styles.tableHeadCell}>Remaining</th>
                    <th className={styles.tableHeadCell}>Status</th>
                    <th className={styles.tableHeadCell}>Expires</th>
                    <th className={styles.tableHeadCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((pkg) => {
                    const pct =
                      pkg.totalMinutes > 0
                        ? Math.round(
                            (pkg.remainingMinutes / pkg.totalMinutes) * 100
                          )
                        : 0;

                    return (
                      <tr key={pkg.id}>
                        <td className={styles.tableCell}>{pkg.name}</td>
                        <td className={styles.tableCell}>
                          <div className={styles.progressBar}>
                            <div
                              className={styles.progressFill}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className={styles.progressLabel}>
                            {formatMinutes(pkg.remainingMinutes)} /{" "}
                            {formatMinutes(pkg.totalMinutes)}
                          </p>
                        </td>
                        <td className={styles.tableCell}>{pkg.status}</td>
                        <td className={styles.tableCell}>
                          {formatDate(pkg.expiresAt)}
                        </td>
                        <td className={styles.tableCell}>
                          <Link
                            href={`/packages/${pkg.id}`}
                            className={styles.actionLink}
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
