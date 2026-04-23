import { Users, BookOpen, Wallet, Clock } from "lucide-react";
import styles from "./KpiRow.module.css";

type Props = {
  activeStudents: number;
  lessonsThisMonth: number;
  revenueThisMonth: number;
  hoursThisMonth: number;
  currency: string;
  labels: {
    activeStudents: string;
    lessonsThisMonth: string;
    revenueThisMonth: string;
    hoursThisMonth: string;
  };
};

export default function KpiRow({
  activeStudents,
  lessonsThisMonth,
  revenueThisMonth,
  hoursThisMonth,
  currency,
  labels,
}: Props) {
  const tiles = [
    {
      Icon: Users,
      value: activeStudents,
      label: labels.activeStudents,
      color: "indigo",
    },
    {
      Icon: BookOpen,
      value: lessonsThisMonth,
      label: labels.lessonsThisMonth,
      color: "violet",
    },
    {
      Icon: Wallet,
      value: `${revenueThisMonth.toFixed(2)} ${currency}`,
      label: labels.revenueThisMonth,
      color: "green",
    },
    {
      Icon: Clock,
      value: `${hoursThisMonth}h`,
      label: labels.hoursThisMonth,
      color: "amber",
    },
  ] as const;

  return (
    <div className={styles.row}>
      {tiles.map(({ Icon, value, label, color }) => (
        <div key={label} className={`${styles.tile} ${styles[color]}`}>
          <div className={styles.iconWrap}>
            <Icon size={18} strokeWidth={1.75} />
          </div>
          <div className={styles.value}>{value}</div>
          <div className={styles.label}>{label}</div>
        </div>
      ))}
    </div>
  );
}
