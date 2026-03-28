import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import type { StudentPackageItem } from "@/features/students/queries/getStudentDetail";
import { formatDate, formatMinutes } from "@/lib/format";
import styles from "./StudentDetail.module.css";

type Props = {
  packages: StudentPackageItem[];
};

function sortPackages(packages: StudentPackageItem[]): StudentPackageItem[] {
  return [...packages].sort((a, b) => {
    if (a.status === "ACTIVE" && b.status !== "ACTIVE") return -1;
    if (a.status !== "ACTIVE" && b.status === "ACTIVE") return 1;
    return 0;
  });
}

export default function StudentPackagesSection({ packages }: Props) {
  const sorted = sortPackages(packages);

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Packages</h2>
        <Link href="/packages/new" className={styles.sectionLink}>
          Add package
        </Link>
      </div>

      {sorted.length === 0 ? (
        <p className={styles.emptyText}>No packages assigned.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeadCell}>Name</th>
                <th className={styles.tableHeadCell}>Remaining</th>
                <th className={styles.tableHeadCell}>Used</th>
                <th className={styles.tableHeadCell}>Status</th>
                <th className={styles.tableHeadCell}>Expires</th>
                <th className={styles.tableHeadCell}></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((pkg) => {
                const pct =
                  pkg.totalMinutes > 0
                    ? Math.round(
                        (pkg.remainingMinutes / pkg.totalMinutes) * 100
                      )
                    : 0;
                const usedMinutes = pkg.totalMinutes - pkg.remainingMinutes;

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
                    <td className={styles.tableCell}>
                      <span className={styles.progressLabel}>
                        {formatMinutes(usedMinutes)}
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      <StatusBadge status={pkg.status} />
                    </td>
                    <td className={styles.tableCell}>
                      {formatDate(pkg.expiresAt)}
                    </td>
                    <td className={styles.tableCell}>
                      <Link
                        href={`/packages/${pkg.id}`}
                        className={styles.actionLink}
                      >
                        Open package
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
  );
}
