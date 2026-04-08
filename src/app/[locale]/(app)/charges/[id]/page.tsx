import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { getTranslations, setRequestLocale } from "next-intl/server";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import styles from "./ChargeDetail.module.css";

type Props = {
  params: Promise<{
    id: string;
    locale: string;
  }>;
};

export default async function ChargeDetailPage({ params }: Props) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const { user } = await requireAuth();
  const tLabels = await getTranslations("labels");
  const t = await getTranslations("chargeDetail");
  const tCommon = await getTranslations("common");

  const charge = await prisma.charge.findFirst({
    where: {
      id,
      teacherId: user.id,
    },
    include: {
      user: true,
      lesson: true,
      allocations: {
        include: {
          payment: true,
        },
      },
    },
  });

  if (!charge) {
    notFound();
  }

  const totalPaid = charge.allocations.reduce((sum, allocation) => {
    return sum + Number(allocation.amount);
  }, 0);

  const chargeAmount = Number(charge.amount);
  const remainingBalance = Math.max(chargeAmount - totalPaid, 0);

  return (
    <div className={styles.page}>
      <Link href="/charges" className={styles.backLink}>
        {t("back")}
      </Link>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h1 className={styles.cardTitle}>{charge.title}</h1>

          <div className={styles.cardActions}>
            <Link
              href={`/payments/new?chargeId=${charge.id}&userId=${charge.userId}&amount=${remainingBalance.toFixed(2)}`}
              className={styles.primaryLink}
            >
              {t("createPayment")}
            </Link>
            <Link href={`/charges/${charge.id}/edit`} className={styles.secondaryLink}>
              {tCommon("edit")}
            </Link>
          </div>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t("labelStudent")}</span>
              <span className={styles.infoValue}>
                {charge.user.firstName} {charge.user.lastName}
              </span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t("labelType")}</span>
              <span className={styles.infoValue}>{tLabels(charge.type)}</span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t("labelAmount")}</span>
              <span className={styles.infoValue}>
                {charge.amount.toString()} {charge.currency}
              </span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t("labelStatus")}</span>
              <span className={styles.infoValue}><StatusBadge status={charge.status} label={tLabels(charge.status)} /></span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t("labelTotalPaid")}</span>
              <span className={styles.infoValue}>
                {totalPaid.toFixed(2)} {charge.currency}
              </span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t("labelRemaining")}</span>
              <span className={styles.infoValue}>
                {remainingBalance.toFixed(2)} {charge.currency}
              </span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t("labelLesson")}</span>
              <span className={styles.infoValue}>
                {charge.lesson ? charge.lesson.title : "—"}
              </span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t("labelDueAt")}</span>
              <span className={styles.infoValue}>
                {charge.dueAt
                  ? charge.dueAt.toLocaleDateString("fr-CH")
                  : "—"}
              </span>
            </div>

            {charge.description ? (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t("labelDescription")}</span>
                <span className={styles.infoValue}>{charge.description}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t("sectionPaymentAllocations")}</h2>

          {charge.allocations.length === 0 ? (
            <p className={styles.emptyText}>{t("noPaymentsAllocated")}</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.tableHeadCell}>{t("colAmount")}</th>
                    <th className={styles.tableHeadCell}>{t("colMethod")}</th>
                    <th className={styles.tableHeadCell}>{t("colStatus")}</th>
                  </tr>
                </thead>
                <tbody>
                  {charge.allocations.map((allocation) => (
                    <tr key={allocation.id}>
                      <td className={styles.tableCell}>
                        {allocation.amount.toString()} {charge.currency}
                      </td>
                      <td className={styles.tableCell}>
                        {allocation.payment.method ? tLabels(allocation.payment.method) : "—"}
                      </td>
                      <td className={styles.tableCell}>
                        <StatusBadge status={allocation.payment.status} label={tLabels(allocation.payment.status)} />
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
