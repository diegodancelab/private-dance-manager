import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
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
  status: string;
};

const LOCALE_MAP: Record<string, string> = {
  fr: "fr-CH",
  en: "en-GB",
  es: "es-ES",
};

export default async function LessonCard({ lesson, status }: LessonCardProps) {
  const t = await getTranslations("lessons");
  const tLabels = await getTranslations("labels");
  const locale = await getLocale();
  const dateLocale = LOCALE_MAP[locale] || "fr-CH";
  const isCanceled = status === "CANCELED";

  function formatTime(date: Date) {
    return new Intl.DateTimeFormat(dateLocale, {
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

  const participantNames = lesson.participants
    .map(
      (participant) =>
        `${participant.user.firstName} ${participant.user.lastName}`
    )
    .join(", ");

  return (
    <Link href={`/lessons/${lesson.id}`} className={styles.link}>
      <article className={`${styles.card} ${isCanceled ? styles.cardCanceled : ""}`}>
        {isCanceled && (
          <div className={styles.canceledBadge}>{t("statusCanceled")}</div>
        )}
        <div className={`${styles.time} ${isCanceled ? styles.canceledText : ""}`}>
          {formatTime(lesson.scheduledAt)} -{" "}
          {formatEndTime(lesson.scheduledAt, lesson.durationMin)}
        </div>

        <div className={`${styles.title} ${isCanceled ? styles.canceledText : ""}`}>{lesson.title}</div>

        <div className={styles.meta}>
          <span>{tLabels(lesson.lessonType)}</span>
          <span>{lesson.durationMin} min</span>
        </div>

        <p className={styles.participants}>
          {participantNames || t("noStudentAssigned")}
        </p>

        {lesson.location ? (
          <p className={styles.location}>{lesson.location}</p>
        ) : null}
      </article>
    </Link>
  );
}
