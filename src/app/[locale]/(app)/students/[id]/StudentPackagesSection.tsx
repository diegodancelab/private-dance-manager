import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Eye } from "lucide-react";
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

export default async function StudentPackagesSection({ packages }: Props) {
  const tLabels = await getTranslations("labels");
  const t = await getTranslations("studentDetail");
  const sorted = sortPackages(packages);

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t("sectionPackages")}</h2>
        <Link href="/packages/new" className={styles.sectionLink}>
          {t("addPackage")}
        </Link>
      </div>

      {sorted.length === 0 ? (
        <p className={styles.emptyText}>{t("noPackagesAssigned")}</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeadCell}>{t("colName")}</th>
                <th className={styles.tableHeadCell}>{t("colRemaining")}</th>
                <th className={styles.tableHeadCell}>{t("colUsed")}</th>
                <th className={styles.tableHeadCell}>{t("colStatus")}</th>
                <th className={styles.tableHeadCell}>{t("colExpires")}</th>
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
                      <StatusBadge status={pkg.status} label={tLabels(pkg.status)} />
                    </td>
                    <td className={styles.tableCell}>
                      {formatDate(pkg.expiresAt)}
                    </td>
                    <td className={styles.tableCell}>
                      <Link
                        href={`/packages/${pkg.id}`}
                        className={styles.actionIconLink}
                        title={t("openPackage")}
                      >
                        <Eye size={16} />
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
