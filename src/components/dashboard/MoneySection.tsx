import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { PendingCharge } from "@/features/dashboard/queries";
import StatusBadge from "@/components/ui/StatusBadge";
import styles from "./MoneySection.module.css";

type Props = {
  charges: PendingCharge[];
  totalOwed: number;
  currency: string;
};

function formatAmount(amount: number, currency: string): string {
  return `${amount.toFixed(2)} ${currency}`;
}

export default async function MoneySection({ charges, totalOwed, currency }: Props) {
  const t = await getTranslations("dashboard");
  const tLabels = await getTranslations("labels");

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{t("moneyOwed")}</h2>

      <div className={styles.totalCard}>
        <span className={styles.totalLabel}>{t("totalOutstanding")}</span>
        <span className={styles.totalAmount}>{formatAmount(totalOwed, currency)}</span>
      </div>

      {charges.length === 0 ? (
        <p className={styles.empty}>{t("allChargesPaid")}</p>
      ) : (
        <div className={styles.list}>
          {charges.map((charge) => {
            const due = charge.amount - charge.alreadyPaid;
            return (
              <Link
                key={charge.id}
                href={`/charges/${charge.id}`}
                className={styles.row}
              >
                <div className={styles.rowLeft}>
                  <span className={styles.studentName}>
                    {charge.studentFirstName} {charge.studentLastName}
                  </span>
                  <span className={styles.chargeTitle}>{charge.title}</span>
                </div>
                <div className={styles.rowRight}>
                  <span className={styles.amount}>{formatAmount(due, charge.currency)}</span>
                  <StatusBadge status={charge.status} label={tLabels(charge.status)} />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Link href="/charges" className={styles.viewAll}>
        {t("viewAllCharges")}
      </Link>
    </section>
  );
}
