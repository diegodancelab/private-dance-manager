import Link from "next/link";
import styles from "./LessonCard.module.css";

type LessonParticipantItem = {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
  };
};

type LessonCardProps = {
  lesson: {
    id: string;
    title: string;
    lessonType: string;
    scheduledAt: Date;
    durationMin: number;
    location: string | null;
    participants: LessonParticipantItem[];
  };
};

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("fr-CH", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Zurich",
  }).format(new Date(date));
}

function formatEndTime(date: Date, durationMin: number) {
  const endDate = new Date(date);
  endDate.setMinutes(endDate.getMinutes() + durationMin);

  return formatTime(endDate);
}

export default function LessonCard({ lesson }: LessonCardProps) {
  const participantNames = lesson.participants
    .map(
      (participant) =>
        `${participant.user.firstName} ${participant.user.lastName}`
    )
    .join(", ");

  return (
    <Link href={`/lessons/${lesson.id}/edit`} className={styles.link}>
      <article className={styles.card}>
        <div className={styles.time}>
          {formatTime(lesson.scheduledAt)} -{" "}
          {formatEndTime(lesson.scheduledAt, lesson.durationMin)}
        </div>

        <div className={styles.title}>{lesson.title}</div>

        <div className={styles.meta}>
          <span>{lesson.lessonType}</span>
          <span>{lesson.durationMin} min</span>
        </div>

        <p className={styles.participants}>
          {participantNames || "Aucun élève assigné"}
        </p>

        {lesson.location ? (
          <p className={styles.location}>📍 {lesson.location}</p>
        ) : null}
      </article>
    </Link>
  );
}