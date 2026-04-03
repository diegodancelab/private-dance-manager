import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PackageStatus } from "@/generated/prisma/client";
import StatusBadge from "@/components/ui/StatusBadge";
import { requireAuth } from "@/lib/auth/require-auth";
import Button from "@/components/ui/Button";
import styles from "./PackagesPage.module.css";

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

type PackagesPageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function PackagesPage({ searchParams }: PackagesPageProps) {
  const { user } = await requireAuth();
  const { status } = await searchParams;

  const showAll = status === "all";

  const packages = await prisma.package.findMany({
    where: {
      teacherId: user.id,
      ...(showAll ? {} : { status: PackageStatus.ACTIVE }),
    },
    orderBy: { createdAt: "desc" },
    include: {
      participants: {
        select: { user: { select: { id: true, firstName: true, lastName: true } } },
      },
    },
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <h1 className={styles.title}>Packages</h1>
          <p className={styles.subtitle}>
            Manage prepaid hour packages for your students.
          </p>
        </div>

        <div className={styles.headerActions}>
          {showAll ? (
            <Link href="/packages" className={styles.filterLink}>
              Active only
            </Link>
          ) : (
            <Link href="/packages?status=all" className={styles.filterLink}>
              Show all
            </Link>
          )}
          <Button href="/packages/new" size="sm">Create package</Button>
        </div>
      </div>

      {packages.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>
            {showAll ? "No packages yet." : "No active packages."}
          </p>
          <p className={styles.emptySubtext}>
            {showAll
              ? "Create your first package to start tracking prepaid hours."
              : "All packages are exhausted, expired, or canceled."}
          </p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeadCell}>Students</th>
                <th className={styles.tableHeadCell}>Name</th>
                <th className={styles.tableHeadCell}>Progress</th>
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

                const participantNames = pkg.participants
                  .map((p) => `${p.user.firstName} ${p.user.lastName}`)
                  .join(", ");

                return (
                  <tr key={pkg.id}>
                    <td className={styles.tableCell}>
                      {participantNames || "—"}
                    </td>

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
                      <div className={styles.actions}>
                        <Link
                          href={`/packages/${pkg.id}`}
                          className={styles.actionLink}
                        >
                          View
                        </Link>
                        <Link
                          href={`/packages/${pkg.id}/edit`}
                          className={styles.actionLink}
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
