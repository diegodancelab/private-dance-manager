import { formatDateKey, getWindowDays, CalendarViewMode } from "@/lib/calendar";
import { utcToZurichDate } from "@/lib/dates";
import LessonCard from "./LessonCard";
import styles from "./CalendarWeekView.module.css";
import Button from "@/components/ui/Button";

type LessonParticipantItem = {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
  };
};

type LessonItem = {
  id: string;
  title: string;
  lessonType: string;
  scheduledAt: Date;
  durationMin: number;
  location: string | null;
  participants: LessonParticipantItem[];
};

type CalendarWeekViewProps = {
  currentDate: Date;
  viewMode: CalendarViewMode;
  lessons: LessonItem[];
};

function formatDayLabel(date: Date): string {
  return new Intl.DateTimeFormat("fr-CH", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

export default function CalendarWeekView({
  currentDate,
  viewMode,
  lessons,
}: CalendarWeekViewProps) {
  const weekDays = getWindowDays(currentDate, viewMode);
  const todayKey = formatDateKey(new Date());

  const lessonsByDay = weekDays.reduce<Record<string, LessonItem[]>>(
    (accumulator, day) => {
      const key = formatDateKey(day);

      accumulator[key] = lessons.filter((lesson) => {
        return utcToZurichDate(new Date(lesson.scheduledAt)) === key;
      });

      return accumulator;
    },
    {}
  );

  return (
    <div className={styles.grid}>
      {weekDays.map((day) => {
        const key = formatDateKey(day);
        const dayLessons = lessonsByDay[key] || [];
        const isToday = key === todayKey;

        return (
          <section
            key={key}
            className={`${styles.dayColumn} ${isToday ? styles.todayColumn : ""}`}
          >
            <header
              className={`${styles.dayHeader} ${isToday ? styles.todayDayHeader : ""}`}
            >
              <div className={styles.dayLabelWrapper}>
                <h2
                  className={`${styles.dayTitle} ${isToday ? styles.todayDayTitle : ""}`}
                >
                  {formatDayLabel(day)}
                </h2>
                {isToday && (
                  <span className={styles.todayBadge}>Aujourd&apos;hui</span>
                )}
              </div>

              <Button
                href={`/lessons/new?date=${key}`}
                size="sm"
                variant="secondary"
                className={styles.addLessonBtn}
              >
                + Cours
              </Button>
            </header>

            <div className={styles.dayContent}>
              {dayLessons.length > 0 ? (
                dayLessons.map((lesson) => (
                  <LessonCard key={lesson.id} lesson={lesson} />
                ))
              ) : (
                <p className={styles.empty}>Aucun cours</p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
