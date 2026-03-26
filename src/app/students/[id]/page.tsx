import { prisma } from "@/lib/prisma";
import { UserRole, ChargeStatus } from "@/generated/prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import { getLabel } from "@/lib/labels";
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

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("fr-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}


export default async function StudentDetailPage({ params }: Props) {
  const { id } = await params;

  const student = await prisma.user.findFirst({
    where: { id, role: UserRole.STUDENT },
  });

  if (!student) notFound();

  const [packages, charges, participations] = await Promise.all([
    prisma.package.findMany({
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
    }),

    prisma.charge.findMany({
      where: {
        userId: id,
        status: { in: [ChargeStatus.PENDING, ChargeStatus.PARTIALLY_PAID] },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        amount: true,
        currency: true,
        status: true,
        dueAt: true,
        allocations: { select: { amount: true } },
      },
    }),

    prisma.lessonParticipant.findMany({
      where: {
        userId: id,
        lesson: { scheduledAt: { gte: new Date() } },
      },
      orderBy: { lesson: { scheduledAt: "asc" } },
      take: 5,
      select: {
        lesson: {
          select: {
            id: true,
            title: true,
            scheduledAt: true,
            durationMin: true,
            lessonType: true,
            location: true,
          },
        },
      },
    }),
  ]);

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
            <Link
              href={`/students/${student.id}/edit`}
              className={styles.primaryLink}
            >
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

        {/* Unpaid charges */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Unpaid charges</h2>
            <Link href={`/charges/new?userId=${student.id}`} className={styles.sectionLink}>
              Add charge
            </Link>
          </div>

          {charges.length === 0 ? (
            <p className={styles.emptyText}>No outstanding charges.</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.tableHeadCell}>Charge</th>
                    <th className={styles.tableHeadCell}>Balance</th>
                    <th className={styles.tableHeadCell}>Status</th>
                    <th className={styles.tableHeadCell}>Due</th>
                    <th className={styles.tableHeadCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {charges.map((charge) => {
                    const alreadyPaid = charge.allocations.reduce(
                      (sum, a) => sum + Number(a.amount),
                      0
                    );
                    const total = Number(charge.amount);
                    const remaining = total - alreadyPaid;
                    const pct =
                      total > 0 ? Math.round((alreadyPaid / total) * 100) : 0;

                    return (
                      <tr key={charge.id}>
                        <td className={styles.tableCell}>{charge.title}</td>
                        <td className={styles.tableCell}>
                          <div className={styles.progressBar}>
                            <div
                              className={styles.progressFill}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className={styles.progressLabel}>
                            {alreadyPaid.toFixed(2)} / {total.toFixed(2)}{" "}
                            {charge.currency}
                          </p>
                          <p className={styles.progressRemaining}>
                            {remaining.toFixed(2)} {charge.currency} remaining
                          </p>
                        </td>
                        <td className={styles.tableCell}>
                          <StatusBadge status={charge.status} />
                        </td>
                        <td className={styles.tableCell}>
                          {formatDate(charge.dueAt)}
                        </td>
                        <td className={styles.tableCell}>
                          <Link
                            href={`/charges/${charge.id}`}
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

        {/* Packages */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Packages</h2>
            <Link href={`/packages/new`} className={styles.sectionLink}>
              Add package
            </Link>
          </div>

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
                        <td className={styles.tableCell}><StatusBadge status={pkg.status} /></td>
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

        {/* Upcoming lessons */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Upcoming lessons</h2>

          {participations.length === 0 ? (
            <p className={styles.emptyText}>No upcoming lessons.</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.tableHeadCell}>Lesson</th>
                    <th className={styles.tableHeadCell}>Date</th>
                    <th className={styles.tableHeadCell}>Duration</th>
                    <th className={styles.tableHeadCell}>Type</th>
                    <th className={styles.tableHeadCell}>Location</th>
                    <th className={styles.tableHeadCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {participations.map(({ lesson }) => (
                    <tr key={lesson.id}>
                      <td className={styles.tableCell}>{lesson.title}</td>
                      <td className={styles.tableCell}>
                        {formatDateTime(lesson.scheduledAt)}
                      </td>
                      <td className={styles.tableCell}>
                        {lesson.durationMin} min
                      </td>
                      <td className={styles.tableCell}>{getLabel(lesson.lessonType)}</td>
                      <td className={styles.tableCell}>
                        {lesson.location ?? "—"}
                      </td>
                      <td className={styles.tableCell}>
                        <Link
                          href={`/lessons/${lesson.id}`}
                          className={styles.actionLink}
                        >
                          View
                        </Link>
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
