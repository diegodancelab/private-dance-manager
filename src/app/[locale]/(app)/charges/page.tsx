import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import StatusBadge from "@/components/ui/StatusBadge";
import { requireAuth } from "@/lib/auth/require-auth";
import Button from "@/components/ui/Button";
import styles from "./ChargesPage.module.css";

function formatAmount(amount: string | number, currency: string) {
  return `${amount} ${currency}`;
}

const LOCALE_MAP: Record<string, string> = {
  fr: "fr-CH",
  en: "en-GB",
  es: "es-ES",
};

export default async function ChargesPage() {
  const { user } = await requireAuth();
  const t = await getTranslations("chargesPage");
  const tLabels = await getTranslations("labels");
  const tCommon = await getTranslations("common");
  const locale = await getLocale();
  const dateLocale = LOCALE_MAP[locale] ?? "fr-CH";

  const charges = await prisma.charge.findMany({
    where: { teacherId: user.id },
    include: {
      user: true,
      lesson: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>
        </div>

        <Button href="/charges/new" size="sm">{t("addCharge")}</Button>
      </div>

      {charges.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>{t("noChargesTitle")}</p>
          <p className={styles.emptySubtext}>{t("noChargesSubtitle")}</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeadCell}>{t("colStudent")}</th>
                <th className={styles.tableHeadCell}>{t("colTitle")}</th>
                <th className={styles.tableHeadCell}>{t("colAmount")}</th>
                <th className={styles.tableHeadCell}>{t("colStatus")}</th>
                <th className={styles.tableHeadCell}>{t("colLesson")}</th>
                <th className={styles.tableHeadCell}>{t("colCreated")}</th>
                <th className={styles.tableHeadCell}></th>
              </tr>
            </thead>

            <tbody>
              {charges.map((charge) => (
                <tr key={charge.id}>
                  <td className={styles.tableCell}>
                    {charge.user.firstName} {charge.user.lastName}
                  </td>

                  <td className={styles.tableCell}>{charge.title}</td>

                  <td className={styles.tableCell}>
                    {formatAmount(charge.amount.toString(), charge.currency)}
                  </td>

                  <td className={styles.tableCell}>
                    <StatusBadge status={charge.status} label={tLabels(charge.status)} />
                  </td>

                  <td className={styles.tableCell}>
                    {charge.lesson ? charge.lesson.title : "—"}
                  </td>

                  <td className={styles.tableCell}>
                    {charge.createdAt.toLocaleDateString(dateLocale)}
                  </td>

                  <td className={styles.tableCell}>
                    <div className={styles.actions}>
                      <Link
                        href={`/charges/${charge.id}`}
                        className={styles.actionLink}
                      >
                        {tCommon("view")}
                      </Link>
                      <Link
                        href={`/charges/${charge.id}/edit`}
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
