import { formatDateKey, getWeekDays } from "@/lib/calendar";
import LessonCard from "./LessonCard";
import styles from "./CalendarWeekView.module.css";

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
  lessons,
}: CalendarWeekViewProps) {
  const weekDays = getWeekDays(currentDate);

  const lessonsByDay = weekDays.reduce<Record<string, LessonItem[]>>(
    (accumulator, day) => {
      const key = formatDateKey(day);

      accumulator[key] = lessons.filter((lesson) => {
        return formatDateKey(new Date(lesson.scheduledAt)) === key;
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

        return (
          <section key={key} className={styles.dayColumn}>
            <header className={styles.dayHeader}>
              <h2 className={styles.dayTitle}>{formatDayLabel(day)}</h2>
            </header>

            <div className={styles.dayContent}>
              {dayLessons.length > 0 ? (
                dayLessons.map((lesson) => (
                  <LessonCard key={lesson.id} lesson={lesson} />
                ))
              ) : (
                <p className={styles.empty}>No lessons</p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}