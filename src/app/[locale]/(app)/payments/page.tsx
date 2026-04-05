import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/ui/StatusBadge";
import { requireAuth } from "@/lib/auth/require-auth";
import Button from "@/components/ui/Button";
import styles from "./PaymentsPage.module.css";

function formatAmount(amount: string | number, currency: string) {
  return `${amount} ${currency}`;
}

const LOCALE_MAP: Record<string, string> = {
  fr: "fr-CH",
  en: "en-GB",
  es: "es-ES",
};

export default async function PaymentsPage() {
  const { user } = await requireAuth();
  const t = await getTranslations("paymentsPage");
  const tLabels = await getTranslations("labels");
  const tCommon = await getTranslations("common");
  const locale = await getLocale();
  const dateLocale = LOCALE_MAP[locale] ?? "fr-CH";

  function formatDateTime(date: Date | null) {
    if (!date) return "-";
    return new Intl.DateTimeFormat(dateLocale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  }

  const payments = await prisma.payment.findMany({
    where: { teacherId: user.id },
    orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
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

        <Button href="/payments/new" size="sm">{t("createPayment")}</Button>
      </div>

      {payments.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>{t("noPaymentsTitle")}</p>
          <p className={styles.emptySubtext}>{t("noPaymentsSubtitle")}</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeadCell}>{t("colStudent")}</th>
                <th className={styles.tableHeadCell}>{t("colAmount")}</th>
                <th className={styles.tableHeadCell}>{t("colMethod")}</th>
                <th className={styles.tableHeadCell}>{t("colStatus")}</th>
                <th className={styles.tableHeadCell}>{t("colPaidAt")}</th>
                <th className={styles.tableHeadCell}></th>
              </tr>
            </thead>

            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className={styles.tableCell}>
                    {payment.user.firstName} {payment.user.lastName}
                  </td>

                  <td className={styles.tableCell}>
                    {formatAmount(String(payment.amount), payment.currency)}
                  </td>

                  <td className={styles.tableCell}>
                    {payment.method ? tLabels(payment.method) : "—"}
                  </td>

                  <td className={styles.tableCell}>
                    <StatusBadge status={payment.status} label={tLabels(payment.status)} />
                  </td>

                  <td className={styles.tableCell}>
                    {formatDateTime(payment.paidAt)}
                  </td>

                  <td className={styles.tableCell}>
                    <div className={styles.actions}>
                      <Link
                        href={`/payments/${payment.id}`}
                        className={styles.actionLink}
                      >
                        {tCommon("view")}
                      </Link>
                      <Link
                        href={`/payments/${payment.id}/edit`}
                        className={styles.actionLink}
                      >
                        {tCommon("edit")}
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
