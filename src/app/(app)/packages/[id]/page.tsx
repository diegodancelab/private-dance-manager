import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { UserRole, ChargeType, ChargeStatus, PackageStatus } from "@/generated/prisma/client";
import StatusBadge from "@/components/ui/StatusBadge";
import styles from "./PackageDetail.module.css";
import {
  addParticipantToPackage,
  removeParticipantFromPackage,
  migrateUnitLessonsToPackage,
} from "../actions";

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
      charge: true,
      participants: {
        include: { user: { select: { id: true, firstName: true, lastName: true } } },
      },
      usages: {
        include: {
          lessonParticipant: {
            include: {
              user: { select: { firstName: true, lastName: true } },
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

  const participantUserIds = pkg.participants.map((p) => p.userId);

  // Count unit-billed lessons eligible for migration (PENDING, no PackageUsage yet)
  let migratableCount = 0;
  let blockedCount = 0;
  if (pkg.status === PackageStatus.ACTIVE && participantUserIds.length > 0) {
    const [pending, partial] = await Promise.all([
      prisma.charge.count({
        where: {
          teacherId: user.id,
          userId: { in: participantUserIds },
          type: ChargeType.LESSON,
          status: ChargeStatus.PENDING,
          lesson: {
            participants: {
              some: {
                userId: { in: participantUserIds },
                packageUsage: null,
              },
            },
          },
        },
      }),
      prisma.charge.count({
        where: {
          teacherId: user.id,
          userId: { in: participantUserIds },
          type: ChargeType.LESSON,
          status: ChargeStatus.PARTIALLY_PAID,
          lessonId: { not: null },
        },
      }),
    ]);
    migratableCount = pending;
    blockedCount = partial;
  }

  // Students who can be added as participants (teacher's students, not already participants)
  const addableStudents = await prisma.user.findMany({
    where: {
      role: UserRole.STUDENT,
      createdByTeacherId: user.id,
      id: { notIn: participantUserIds },
    },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    select: { id: true, firstName: true, lastName: true },
  });

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

        {/* Participants section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Participants ({pkg.participants.length})
          </h2>

          {pkg.participants.length === 0 ? (
            <p className={styles.emptyText}>No participants.</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.tableHeadCell}>Student</th>
                    <th className={styles.tableHeadCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pkg.participants.map((pp) => (
                    <tr key={pp.userId}>
                      <td className={styles.tableCell}>
                        {pp.user.firstName} {pp.user.lastName}
                      </td>
                      <td className={styles.tableCell}>
                        <form action={removeParticipantFromPackage}>
                          <input type="hidden" name="packageId" value={pkg.id} />
                          <input type="hidden" name="userId" value={pp.userId} />
                          <button
                            type="submit"
                            className={styles.removeButton}
                          >
                            Remove
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {addableStudents.length > 0 && (
            <form
              action={addParticipantToPackage}
              className={styles.addParticipantForm}
            >
              <input type="hidden" name="packageId" value={pkg.id} />
              <select name="userId" className={styles.addSelect}>
                <option value="">Add a student…</option>
                {addableStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName}
                  </option>
                ))}
              </select>
              <button type="submit" className={styles.addButton}>
                Add
              </button>
            </form>
          )}
        </div>

        {/* Usage history section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Usage history</h2>

          {pkg.usages.length === 0 ? (
            <p className={styles.emptyText}>No usage recorded yet.</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.tableHeadCell}>Student</th>
                    <th className={styles.tableHeadCell}>Lesson</th>
                    <th className={styles.tableHeadCell}>Date</th>
                    <th className={styles.tableHeadCell}>Consumed</th>
                  </tr>
                </thead>
                <tbody>
                  {pkg.usages.map((usage) => (
                    <tr key={usage.id}>
                      <td className={styles.tableCell}>
                        {usage.lessonParticipant.user.firstName}{" "}
                        {usage.lessonParticipant.user.lastName}
                      </td>
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
        {migratableCount > 0 && (
          <div className={styles.migrationBanner}>
            <p className={styles.migrationBannerText}>
              {migratableCount} unit-billed lesson{migratableCount > 1 ? "s" : ""} found without package coverage. Migrate to this package?
            </p>
            {blockedCount > 0 && (
              <p className={styles.migrationBannerNote}>
                {blockedCount} lesson{blockedCount > 1 ? "s" : ""} with partial payments will be skipped — settle them manually first.
              </p>
            )}
            <form action={migrateUnitLessonsToPackage}>
              <input type="hidden" name="packageId" value={pkg.id} />
              <button type="submit" className={styles.migrateButton}>
                Migrate {migratableCount} lesson{migratableCount > 1 ? "s" : ""}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
