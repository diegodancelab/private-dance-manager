import { getTranslations, getLocale } from "next-intl/server";
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

const LOCALE_MAP: Record<string, string> = {
  fr: "fr-CH",
  en: "en-GB",
  es: "es-ES",
};

export default async function CalendarWeekView({
  currentDate,
  viewMode,
  lessons,
}: CalendarWeekViewProps) {
  const t = await getTranslations("calendar");
  const locale = await getLocale();
  const dateLocale = LOCALE_MAP[locale] || "fr-CH";

  function formatDayLabel(date: Date): string {
    return new Intl.DateTimeFormat(dateLocale, {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(date);
  }

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
                  <span className={styles.todayBadge}>{t("today")}</span>
                )}
              </div>

              <Button
                href={`/lessons/new?date=${key}`}
                size="sm"
                variant="secondary"
                className={styles.addLessonBtn}
              >
                {t("addLesson")}
              </Button>
            </header>

            <div className={styles.dayContent}>
              {dayLessons.length > 0 ? (
                dayLessons.map((lesson) => (
                  <LessonCard key={lesson.id} lesson={lesson} />
                ))
              ) : (
                <p className={styles.empty}>{t("noLessons")}</p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
