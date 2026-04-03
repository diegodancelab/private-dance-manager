import Button from "@/components/ui/Button";
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
        <Button
          href={`/calendar?date=${toDateParam(previousWeek)}`}
          variant="secondary"
          size="sm"
        >
          Previous
        </Button>

        <Button
          href={`/calendar?date=${toDateParam(today)}`}
          variant="secondary"
          size="sm"
        >
          Today
        </Button>

        <Button
          href={`/calendar?date=${toDateParam(nextWeek)}`}
          variant="secondary"
          size="sm"
        >
          Next
        </Button>

        <Button href="/lessons/new" size="sm">
          Add lesson
        </Button>
      </div>
    </div>
  );
}
