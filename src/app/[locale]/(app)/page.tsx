import { requireAuth } from "@/lib/auth/require-auth";
import { getTodayLessons, getPendingCharges, getAlerts } from "@/features/dashboard/queries";
import { getTranslations } from "next-intl/server";
import QuickActions from "@/components/dashboard/QuickActions";
import TodaySection from "@/components/dashboard/TodaySection";
import MoneySection from "@/components/dashboard/MoneySection";
import AlertsSection from "@/components/dashboard/AlertsSection";
import styles from "./DashboardPage.module.css";

export default async function DashboardPage() {
  const { user } = await requireAuth();
  const t = await getTranslations("dashboard");

  const now = new Date();

  const [todayLessons, { charges, totalOwed, currency }, alerts] = await Promise.all([
    getTodayLessons(user.id),
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
