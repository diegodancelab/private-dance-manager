import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireStudentAuth } from "@/lib/auth/require-auth";
import { getStudentLessons } from "@/features/portal/queries/getStudentLessons";
import styles from "./PortalLessons.module.css";

type Props = {
  params: Promise<{ locale: string }>;
};

function getVideoEmbedType(url: string): "youtube" | "vimeo" | "link" {
  if (/youtube\.com|youtu\.be/.test(url)) return "youtube";
  if (/vimeo\.com/.test(url)) return "vimeo";
  return "link";
}

function getYoutubeEmbedUrl(url: string): string {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : url;
}

function getVimeoEmbedUrl(url: string): string {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}` : url;
}

export default async function PortalLessonsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { user } = await requireStudentAuth();
  const t = await getTranslations("portal.lessons");
  const tLabels = await getTranslations("labels");

  const { upcoming, past } = await getStudentLessons(user.id);

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>{t("title")}</h1>

      {/* Upcoming */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("upcoming")}</h2>
        {upcoming.length === 0 ? (
          <p className={styles.emptyText}>{t("noUpcoming")}</p>
        ) : (
          <ul className={styles.lessonList}>
            {upcoming.map((lesson) => (
              <li key={lesson.id} className={styles.lessonCard}>
                <div className={styles.lessonHeader}>
                  <span className={styles.lessonTitle}>{lesson.title}</span>
                  <span className={styles.lessonType}>
                    {tLabels(lesson.lessonType as Parameters<typeof tLabels>[0])}
                  </span>
                </div>
                <div className={styles.lessonMeta}>
                  {lesson.scheduledAt.toLocaleDateString("fr-CH", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}{" "}
                  —{" "}
                  {lesson.scheduledAt.toLocaleTimeString("fr-CH", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  · {lesson.durationMin} min
                  {lesson.location ? ` · ${lesson.location}` : ""}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Past */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("past")}</h2>
        {past.length === 0 ? (
          <p className={styles.emptyText}>{t("noPast")}</p>
        ) : (
          <ul className={styles.lessonList}>
            {past.map((lesson) => (
              <li key={lesson.id} className={styles.lessonCard}>
                <div className={styles.lessonHeader}>
                  <span className={styles.lessonTitle}>{lesson.title}</span>
                  <span className={styles.lessonType}>
                    {tLabels(lesson.lessonType as Parameters<typeof tLabels>[0])}
                  </span>
                </div>
                <div className={styles.lessonMeta}>
                  {lesson.scheduledAt.toLocaleDateString("fr-CH", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  · {lesson.durationMin} min
                  {lesson.location ? ` · ${lesson.location}` : ""}
                </div>

                {lesson.feedback?.studentFeedback && (
                  <div className={styles.feedbackBlock}>
                    <span className={styles.feedbackLabel}>
                      {t("feedbackFromTeacher")}
                    </span>
                    <p className={styles.feedbackText}>
                      {lesson.feedback.studentFeedback}
                    </p>
                  </div>
                )}

                {lesson.feedback?.videoUrl && (() => {
                  const url = lesson.feedback.videoUrl;
                  const type = getVideoEmbedType(url);
                  if (type === "youtube") {
                    return (
                      <div className={styles.videoWrapper}>
                        <iframe
                          src={getYoutubeEmbedUrl(url)}
                          title={lesson.title}
                          allowFullScreen
                          className={styles.videoEmbed}
                        />
                      </div>
                    );
                  }
                  if (type === "vimeo") {
                    return (
                      <div className={styles.videoWrapper}>
                        <iframe
                          src={getVimeoEmbedUrl(url)}
                          title={lesson.title}
                          allowFullScreen
                          className={styles.videoEmbed}
                        />
                      </div>
                    );
                  }
                  return (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.videoLink}
                    >
                      {t("watchVideo")} →
                    </a>
                  );
                })()}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
