import { requireAuth } from "@/lib/auth/require-auth";
import { getUpcomingLessons, getPendingCharges, getAlerts } from "@/features/dashboard/queries";
import { getTranslations, setRequestLocale } from "next-intl/server";
import QuickActions from "@/features/dashboard/components/QuickActions";
import TodaySection from "@/features/dashboard/components/TodaySection";
import MoneySection from "@/features/dashboard/components/MoneySection";
import AlertsSection from "@/features/dashboard/components/AlertsSection";
import styles from "./DashboardPage.module.css";

type Props = { params: Promise<{ locale: string }> };

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { user } = await requireAuth();
  const t = await getTranslations("dashboard");

  const now = new Date();

  const [todayLessons, { charges, totalOwed, currency }, alerts] = await Promise.all([
    getUpcomingLessons(user.id),
    getPendingCharges(user.id),
    getAlerts(user.id),
  ]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>{t("greeting", { name: user.firstName })}</p>
        </div>
        <QuickActions />
      </div>

      <div className={styles.grid}>
        <div className={styles.main}>
          <TodaySection lessons={todayLessons} now={now} />
          <AlertsSection alerts={alerts} />
        </div>
        <div className={styles.sidebar}>
          <MoneySection charges={charges} totalOwed={totalOwed} currency={currency} />
        </div>
      </div>
    </div>
  );
}
