import Link from "next/link";
import Button from "@/components/ui/Button";
import styles from "./CalendarWeekHeader.module.css";
import { addDays, formatWindowLabel, CalendarViewMode } from "@/lib/calendar";

type CalendarWeekHeaderProps = {
  currentDate: Date;
  viewMode: CalendarViewMode;
};

function toDateParam(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function CalendarWeekHeader({
  currentDate,
  viewMode,
}: CalendarWeekHeaderProps) {
  const previousWeek = addDays(currentDate, -7);
  const nextWeek = addDays(currentDate, 7);
  const dateParam = toDateParam(currentDate);

  return (
    <div className={styles.header}>
      <div>
        <h1 className={styles.title}>Calendrier</h1>
        <p className={styles.subtitle}>
          {formatWindowLabel(currentDate, viewMode)}
        </p>
      </div>

      <div className={styles.actions}>
        <div className={styles.viewToggle} role="group" aria-label="Vue">
          <Link
            href={`/calendar?date=${dateParam}&view=rolling`}
            className={`${styles.toggleOption} ${viewMode === "rolling" ? styles.toggleActive : ""}`}
          >
            7 jours
          </Link>
          <Link
            href={`/calendar?date=${dateParam}&view=week`}
            className={`${styles.toggleOption} ${viewMode === "week" ? styles.toggleActive : ""}`}
          >
            Semaine
          </Link>
        </div>

        <Button
          href={`/calendar?date=${toDateParam(previousWeek)}&view=${viewMode}`}
          variant="secondary"
          size="sm"
        >
          ←
        </Button>

        <Button
          href={`/calendar?view=${viewMode}`}
          variant="secondary"
          size="sm"
        >
          Aujourd&apos;hui
        </Button>

        <Button
          href={`/calendar?date=${toDateParam(nextWeek)}&view=${viewMode}`}
          variant="secondary"
          size="sm"
        >
          →
        </Button>

        <Button href="/lessons/new" size="sm">
          + Cours
        </Button>
      </div>
    </div>
  );
}
