"use client";

import { useState } from "react";
import { User, Clock, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import Badge from "@/components/ui/Badge/Badge";
import type { PortalLesson } from "@/features/portal/queries/getStudentLessons";
import styles from "./PortalLessons.module.css";

type Tab = "upcoming" | "past" | "canceled";

type Props = {
  upcoming: PortalLesson[];
  past: PortalLesson[];
  canceled: PortalLesson[];
  labels: {
    tabUpcoming: string;
    tabPast: string;
    tabCanceled: string;
    noUpcoming: string;
    noPast: string;
    noCanceled: string;
    seeAssessment: string;
    reschedule: string;
    feedbackFromTeacher: string;
    watchVideo: string;
  };
  lessonTypeLabels: Record<string, string>;
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

function LessonCard({
  lesson,
  tab,
  labels,
  lessonTypeLabels,
}: {
  lesson: PortalLesson;
  tab: Tab;
  labels: Props["labels"];
  lessonTypeLabels: Props["lessonTypeLabels"];
}) {
  const d = lesson.scheduledAt;
  const month = d.toLocaleDateString("fr-CH", { month: "short" }).replace(".", "").toUpperCase();
  const day = d.getDate();
  const time = d.toLocaleTimeString("fr-CH", { hour: "2-digit", minute: "2-digit" });
  const typeLabel = lessonTypeLabels[lesson.lessonType] ?? lesson.lessonType;

  return (
    <div className={`${styles.lessonCard} ${tab === "canceled" ? styles.lessonCardCanceled : ""}`}>
      <div className={styles.lessonDate}>
        <span className={styles.lessonMonth}>{month}</span>
        <span className={styles.lessonDay}>{day}</span>
        <span className={styles.lessonTime}>{time}</span>
      </div>

      <div className={styles.lessonBody}>
        <div className={styles.lessonTitle}>
          {lesson.title}
          <Badge variant={tab === "canceled" ? "neutral" : tab === "upcoming" ? "primary" : "neutral"} dot>
            {typeLabel}
          </Badge>
          {tab === "past" && lesson.feedback?.studentFeedback && (
            <Badge variant="success" dot>{labels.seeAssessment}</Badge>
          )}
        </div>
        <div className={styles.lessonMeta}>
          <span><User size={13} />{lesson.teacherName}</span>
          <span><Clock size={13} />{lesson.durationMin} min</span>
          {lesson.location && <span><MapPin size={13} />{lesson.location}</span>}
        </div>

        {lesson.feedback?.studentFeedback && tab === "past" && (
          <div className={styles.feedbackBlock}>
            <span className={styles.feedbackLabel}>{labels.feedbackFromTeacher}</span>
            <p className={styles.feedbackText}>{lesson.feedback.studentFeedback}</p>
          </div>
        )}

        {lesson.feedback?.videoUrl && tab === "past" && (() => {
          const url = lesson.feedback!.videoUrl!;
          const type = getVideoEmbedType(url);
          if (type === "youtube") return (
            <div className={styles.videoWrapper}>
              <iframe src={getYoutubeEmbedUrl(url)} title={lesson.title} allowFullScreen className={styles.videoEmbed} />
            </div>
          );
          if (type === "vimeo") return (
            <div className={styles.videoWrapper}>
              <iframe src={getVimeoEmbedUrl(url)} title={lesson.title} allowFullScreen className={styles.videoEmbed} />
            </div>
          );
          return <a href={url} target="_blank" rel="noopener noreferrer" className={styles.videoLink}>{labels.watchVideo} →</a>;
        })()}
      </div>

      {tab === "upcoming" && (
        <div className={styles.lessonActions}>
          <button className={styles.btnReschedule} disabled>{labels.reschedule}</button>
        </div>
      )}
      {tab === "past" && lesson.feedback?.studentFeedback && (
        <div className={styles.lessonActions}>
          <Link href="/portal/progression" className={styles.btnAssessment}>{labels.seeAssessment}</Link>
        </div>
      )}
    </div>
  );
}

export default function LessonsView({ upcoming, past, canceled, labels, lessonTypeLabels }: Props) {
  const [tab, setTab] = useState<Tab>("upcoming");

  const lessons = tab === "upcoming" ? upcoming : tab === "past" ? past : canceled;
  const emptyMsg = tab === "upcoming" ? labels.noUpcoming : tab === "past" ? labels.noPast : labels.noCanceled;

  return (
    <>
      <div className={styles.segmented}>
        <button className={`${styles.seg} ${tab === "upcoming" ? styles.segActive : ""}`} onClick={() => setTab("upcoming")}>
          {labels.tabUpcoming} ({upcoming.length})
        </button>
        <button className={`${styles.seg} ${tab === "past" ? styles.segActive : ""}`} onClick={() => setTab("past")}>
          {labels.tabPast} ({past.length})
        </button>
        <button className={`${styles.seg} ${tab === "canceled" ? styles.segActive : ""}`} onClick={() => setTab("canceled")}>
          {labels.tabCanceled}
        </button>
      </div>

      {lessons.length === 0 ? (
        <p className={styles.emptyText}>{emptyMsg}</p>
      ) : (
        <div className={styles.lessonList}>
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              tab={tab}
              labels={labels}
              lessonTypeLabels={lessonTypeLabels}
            />
          ))}
        </div>
      )}
    </>
  );
}
