import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import StatusBadge from "@/components/ui/StatusBadge";
import styles from "./PackageDetail.module.css";

type Props = {
  params: Promise<{ id: string }>;
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

export default async function PackageDetailPage({ params }: Props) {
  const { id } = await params;
  const { user } = await requireAuth();

  const pkg = await prisma.package.findFirst({
    where: { id, teacherId: user.id },
    include: {
      user: true,
      charge: true,
      usages: {
        include: {
          lessonParticipant: {
            include: {
              lesson: {
                select: {
                  id: true,
                  title: true,
                  scheduledAt: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!pkg) notFound();

  const pct =
    pkg.totalMinutes > 0
      ? Math.round((pkg.remainingMinutes / pkg.totalMinutes) * 100)
      : 0;

  return (
    <div className={styles.page}>
      <Link href="/packages" className={styles.backLink}>
        ← Back to packages
      </Link>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h1 className={styles.cardTitle}>{pkg.name}</h1>

          <div className={styles.cardActions}>
            <Link
              href={`/packages/${pkg.id}/edit`}
              className={styles.secondaryLink}
            >
              Edit
            </Link>
          </div>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Student</span>
              <span className={styles.infoValue}>
                {pkg.user.firstName} {pkg.user.lastName}
              </span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Status</span>
              <span className={styles.infoValue}><StatusBadge status={pkg.status} /></span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Total hours</span>
              <span className={styles.infoValue}>
                {formatMinutes(pkg.totalMinutes)}
              </span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Remaining</span>
              <span className={styles.infoValue}>
                {formatMinutes(pkg.remainingMinutes)}
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Expires at</span>
              <span className={styles.infoValue}>
                {formatDate(pkg.expiresAt)}
              </span>
            </div>

            {pkg.charge ? (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Charge</span>
                <span className={styles.infoValue}>
                  <Link href={`/charges/${pkg.charge.id}`}>
                    {pkg.charge.amount.toString()} {pkg.charge.currency}
                  </Link>
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Usage history</h2>

          {pkg.usages.length === 0 ? (
            <p className={styles.emptyText}>No usage recorded yet.</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.tableHeadCell}>Lesson</th>
                    <th className={styles.tableHeadCell}>Date</th>
                    <th className={styles.tableHeadCell}>Consumed</th>
                  </tr>
                </thead>
                <tbody>
                  {pkg.usages.map((usage) => (
                    <tr key={usage.id}>
                      <td className={styles.tableCell}>
                        <Link
                          href={`/lessons/${usage.lessonParticipant.lessonId}`}
                        >
                          {usage.lessonParticipant.lesson.title}
                        </Link>
                      </td>
                      <td className={styles.tableCell}>
                        {formatDate(usage.lessonParticipant.lesson.scheduledAt)}
                      </td>
                      <td className={styles.tableCell}>
                        {formatMinutes(usage.minutesConsumed)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
