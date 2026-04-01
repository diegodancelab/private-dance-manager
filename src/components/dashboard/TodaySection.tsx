import Link from "next/link";
import type { TodayLesson } from "@/features/dashboard/queries";
import { getLabel } from "@/lib/labels";
import styles from "./TodaySection.module.css";

type Props = {
  lessons: TodayLesson[];
  now: Date;
};

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("fr-CH", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Zurich",
  }).format(date);
}

function formatEndTime(date: Date, durationMin: number): string {
  return formatTime(new Date(date.getTime() + durationMin * 60 * 1000));
}

export default function TodaySection({ lessons, now }: Props) {
  // Next upcoming lesson = first one that hasn't ended yet
  const nextLesson = lessons.find((l) => {
    const end = new Date(l.scheduledAt.getTime() + l.durationMin * 60 * 1000);
    return end > now;
  });

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Today</h2>

      {lessons.length === 0 ? (
        <p className={styles.empty}>No lessons scheduled today.</p>
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
                {isNext && <span className={styles.nextBadge}>Next</span>}

                <div className={styles.time}>
                  {formatTime(lesson.scheduledAt)} — {formatEndTime(lesson.scheduledAt, lesson.durationMin)}
                </div>

                <div className={styles.lessonTitle}>{lesson.title}</div>

                <div className={styles.meta}>
                  <span className={styles.type}>{getLabel(lesson.lessonType)}</span>
                  <span className={styles.duration}>{lesson.durationMin} min</span>
                </div>

                {lesson.participants.length > 0 ? (
                  <div className={styles.participants}>
                    {lesson.participants
                      .map((p) => `${p.firstName} ${p.lastName}`)
                      .join(", ")}
                  </div>
                ) : (
                  <div className={styles.noParticipant}>No student assigned</div>
                )}

                {lesson.location && (
                  <div className={styles.location}>📍 {lesson.location}</div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
