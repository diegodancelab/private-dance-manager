import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { TodayLesson } from "@/features/dashboard/queries";
import { getLabel } from "@/lib/labels";
import styles from "./TodaySection.module.css";

type Props = {
  lessons: TodayLesson[];
  now: Date;
};

const LOCALE_MAP: Record<string, string> = {
  fr: "fr-CH",
  en: "en-GB",
  es: "es-ES",
};

export default async function TodaySection({ lessons, now }: Props) {
  const t = await getTranslations("dashboard");
  const tLabels = await getTranslations("labels");
  const locale = await getLocale();
  const dateLocale = LOCALE_MAP[locale] || "fr-CH";

  function formatTime(date: Date): string {
    return new Intl.DateTimeFormat(dateLocale, {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Zurich",
    }).format(date);
  }

  function formatEndTime(date: Date, durationMin: number): string {
    return formatTime(new Date(date.getTime() + durationMin * 60 * 1000));
  }

  // Next upcoming lesson = first one that hasn't ended yet
  const nextLesson = lessons.find((l) => {
    const end = new Date(l.scheduledAt.getTime() + l.durationMin * 60 * 1000);
    return end > now;
  });

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{t("today")}</h2>

      {lessons.length === 0 ? (
        <p className={styles.empty}>{t("noLessonsToday")}</p>
      ) : (
        <div className={styles.list}>
          {lessons.map((lesson) => {
            const isNext = nextLesson?.id === lesson.id;
            return (
              <Link
                key={lesson.id}
                href={`/lessons/${lesson.id}/edit`}
                className={`${styles.card} ${isNext ? styles.next : ""}`}
              >
                {isNext && <span className={styles.nextBadge}>{t("next")}</span>}

                <div className={styles.time}>
                  {formatTime(lesson.scheduledAt)} — {formatEndTime(lesson.scheduledAt, lesson.durationMin)}
                </div>

                <div className={styles.lessonTitle}>{lesson.title}</div>

                <div className={styles.meta}>
                  <span className={styles.type}>{tLabels(lesson.lessonType)}</span>
                  <span className={styles.duration}>{lesson.durationMin} min</span>
                </div>

                {lesson.participants.length > 0 ? (
                  <div className={styles.participants}>
                    {lesson.participants
                      .map((p) => `${p.firstName} ${p.lastName}`)
                      .join(", ")}
                  </div>
                ) : (
                  <div className={styles.noParticipant}>{t("noStudentAssigned")}</div>
                )}

                {lesson.location && (
                  <div className={styles.location}>{lesson.location}</div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
