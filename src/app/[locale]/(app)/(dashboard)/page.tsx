import { requireAuth } from "@/lib/auth/require-auth";
import { getUpcomingLessons, getPendingCharges, getAlerts, getDashboardKpis } from "@/features/dashboard/queries";
import { getTranslations, setRequestLocale } from "next-intl/server";
import QuickActions from "@/features/dashboard/components/QuickActions";
import TodaySection from "@/features/dashboard/components/TodaySection";
import MoneySection from "@/features/dashboard/components/MoneySection";
import AlertsSection from "@/features/dashboard/components/AlertsSection";
import KpiRow from "@/features/dashboard/components/KpiRow";
import styles from "./DashboardPage.module.css";

type Props = { params: Promise<{ locale: string }> };

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { user } = await requireAuth();
  const t = await getTranslations("dashboard");

  const now = new Date();

  const [todayLessons, { charges, totalOwed, currency }, alerts, kpis] = await Promise.all([
    getUpcomingLessons(user.id),
    getPendingCharges(user.id),
    getAlerts(user.id),
    getDashboardKpis(user.id),
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

      <KpiRow
        activeStudents={kpis.activeStudents}
        lessonsThisMonth={kpis.lessonsThisMonth}
        revenueThisMonth={kpis.revenueThisMonth}
        hoursThisMonth={kpis.hoursThisMonth}
        currency={currency}
        labels={{
          activeStudents: t("kpi.activeStudents"),
          lessonsThisMonth: t("kpi.lessonsThisMonth"),
          revenueThisMonth: t("kpi.revenueThisMonth"),
          hoursThisMonth: t("kpi.hoursThisMonth"),
        }}
      />

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
