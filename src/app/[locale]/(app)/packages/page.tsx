import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
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

const LOCALE_MAP: Record<string, string> = {
  fr: "fr-CH",
  en: "en-GB",
  es: "es-ES",
};

type PackagesPageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function PackagesPage({ searchParams }: PackagesPageProps) {
  const { user } = await requireAuth();
  const t = await getTranslations("packagesPage");
  const tLabels = await getTranslations("labels");
  const tCommon = await getTranslations("common");
  const locale = await getLocale();
  const dateLocale = LOCALE_MAP[locale] ?? "fr-CH";
  const { status } = await searchParams;

  const showAll = status === "all";

  function formatDate(date: Date | null): string {
    if (!date) return "—";
    return new Intl.DateTimeFormat(dateLocale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  }

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
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>
        </div>

        <div className={styles.headerActions}>
          {showAll ? (
            <Link href="/packages" className={styles.filterLink}>
              {t("activeOnly")}
            </Link>
          ) : (
            <Link href="/packages?status=all" className={styles.filterLink}>
              {t("showAll")}
            </Link>
          )}
          <Button href="/packages/new" size="sm">{t("createPackage")}</Button>
        </div>
      </div>

      {packages.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>
            {showAll ? t("noPackagesTitle") : t("noActivePackagesTitle")}
          </p>
          <p className={styles.emptySubtext}>
            {showAll
              ? t("noPackagesSubtitle")
              : t("noActivePackagesSubtitle")}
          </p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeadCell}>{t("colStudents")}</th>
                <th className={styles.tableHeadCell}>{t("colName")}</th>
                <th className={styles.tableHeadCell}>{t("colProgress")}</th>
                <th className={styles.tableHeadCell}>{t("colStatus")}</th>
                <th className={styles.tableHeadCell}>{t("colExpires")}</th>
                <th className={styles.tableHeadCell}></th>
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

                    <td className={styles.tableCell}>
                      <StatusBadge status={pkg.status} label={tLabels(pkg.status)} />
                    </td>

                    <td className={styles.tableCell}>
                      {formatDate(pkg.expiresAt)}
                    </td>

                    <td className={styles.tableCell}>
                      <div className={styles.actions}>
                        <Link
                          href={`/packages/${pkg.id}`}
                          className={styles.actionLink}
                        >
                          {tCommon("view")}
                        </Link>
                        <Link
                          href={`/packages/${pkg.id}/edit`}
                          className={styles.actionLink}
                        >
                          {tCommon("edit")}
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
