import Link from "next/link";
import styles from "./CalendarWeekHeader.module.css";
import { addDays, formatWeekLabel } from "@/lib/calendar";

type CalendarWeekHeaderProps = {
  currentDate: Date;
};

function toDateParam(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function CalendarWeekHeader({
  currentDate,
}: CalendarWeekHeaderProps) {
  const previousWeek = addDays(currentDate, -7);
  const nextWeek = addDays(currentDate, 7);
  const today = new Date();

  return (
    <div className={styles.header}>
      <div>
        <h1 className={styles.title}>Calendar</h1>
        <p className={styles.subtitle}>{formatWeekLabel(currentDate)}</p>
      </div>

      <div className={styles.actions}>
        <Link
          href={`/calendar?date=${toDateParam(previousWeek)}`}
          className={styles.button}
        >
          Previous
        </Link>

        <Link
          href={`/calendar?date=${toDateParam(today)}`}
          className={styles.button}
        >
          Today
        </Link>

        <Link
          href={`/calendar?date=${toDateParam(nextWeek)}`}
          className={styles.button}
        >
          Next
        </Link>

        <Link href="/lessons/new" className={styles.primaryButton}>
          Add lesson
        </Link>
      </div>
    </div>
  );
}