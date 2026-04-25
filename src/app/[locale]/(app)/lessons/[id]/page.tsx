import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { formatDateTime } from "@/lib/format";
import styles from "./LessonDetail.module.css";
import { requireAuth } from "@/lib/auth/require-auth";
import { ensureStudentAxes } from "@/features/skill-axes/actions";
import CancelLessonButton from "@/features/lessons/components/CancelLessonButton";
import LessonFeedbackSection from "@/features/lessons/components/LessonFeedbackSection";

type Props = {
  params: Promise<{ id: string; locale: string }>;
};

export default async function LessonDetailPage({ params }: Props) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const { user } = await requireAuth();
  const tLabels = await getTranslations("labels");
  const t = await getTranslations("lessonDetail");
  const tCommon = await getTranslations("common");
  const tFeedback = await getTranslations("postLessonFeedback");

  const now = new Date();

  const [lesson] = await Promise.all([
    prisma.lesson.findFirst({
      where: { id, teacherId: user.id },
      include: {
        teacher: {
          select: { firstName: true, lastName: true },
        },
        participants: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
            packageUsage: {
              include: { package: { select: { name: true } } },
            },
          },
        },
        feedbacks: {
          select: {
            studentId: true,
            videoUrl: true,
            studentFeedback: true,
            internalNotes: true,
          },
        },
        assessments: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            studentId: true,
            notes: true,
            scores: { select: { axisId: true, score: true } },
          },
        },
      },
    }),
  ]);

  if (!lesson) notFound();

  const participantIds = lesson.participants.map((p) => p.user.id);
  await Promise.all(participantIds.map((sid) => ensureStudentAxes(sid, user.id)));

  const participantAxes = await prisma.skillAxis.findMany({
    where: { teacherId: user.id, studentId: { in: participantIds }, isActive: true },
    orderBy: { order: "asc" },
    select: { id: true, label: true, order: true, studentId: true },
  });

  const axesByStudentId: Record<string, { id: string; label: string; order: number }[]> = {};
  for (const axis of participantAxes) {
    const sid = axis.studentId!;
    if (!axesByStudentId[sid]) axesByStudentId[sid] = [];
    axesByStudentId[sid].push({ id: axis.id, label: axis.label, order: axis.order });
  }

  const isPastLesson = lesson.scheduledAt < now;

  return (
    <div className={styles.page}>
      <Link href="/lessons" className={styles.backLink}>
        {t("back")}
      </Link>

      <div className={styles.card}>
        {lesson.status === "CANCELED" && (
          <div className={styles.canceledBanner}>
            {t("canceledBanner")}
          </div>
        )}

        <div className={styles.cardHeader}>
          <h1 className={styles.cardTitle}>{lesson.title}</h1>
          <div className={styles.cardActions}>
            <Link
              href={`/lessons/${lesson.id}/edit`}
              className={styles.secondaryLink}
            >
              {tCommon("edit")}
            </Link>
            {lesson.status === "SCHEDULED" && (
              <CancelLessonButton
                lessonId={lesson.id}
                lessonTitle={lesson.title}
                lessonDate={new Intl.DateTimeFormat(
                  locale === "fr" ? "fr-CH" : locale === "es" ? "es-ES" : "en-GB",
                  { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich" }
                ).format(lesson.scheduledAt)}
                studentNames={lesson.participants.map(
                  (p) => `${p.user.firstName} ${p.user.lastName}`
                )}
              />
            )}
          </div>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t("labelType")}</span>
              <span className={styles.infoValue}>{tLabels(lesson.lessonType)}</span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t("labelScheduledAt")}</span>
              <span className={styles.infoValue}>
                {formatDateTime(lesson.scheduledAt)}
              </span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t("labelDuration")}</span>
              <span className={styles.infoValue}>{lesson.durationMin} min</span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t("labelPrice")}</span>
              <span className={styles.infoValue}>
                {lesson.priceAmount ? `${lesson.priceAmount} CHF` : "—"}
              </span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t("labelLocation")}</span>
              <span className={styles.infoValue}>{lesson.location ?? "—"}</span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t("labelTeacher")}</span>
              <span className={styles.infoValue}>
                {lesson.teacher.firstName} {lesson.teacher.lastName}
              </span>
            </div>

            {lesson.description ? (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t("labelDescription")}</span>
                <span className={styles.infoValue}>{lesson.description}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {t("sectionParticipants", { count: lesson.participants.length })}
          </h2>

          {lesson.participants.length === 0 ? (
            <p className={styles.emptyText}>{t("noStudentsAssigned")}</p>
          ) : (
            <div className={styles.participantList}>
              {lesson.participants.map((participant) => (
                <div key={participant.id} className={styles.participantRow}>
                  <div className={styles.participantInfo}>
                    <span className={styles.participantName}>
                      {participant.user.firstName} {participant.user.lastName}
                    </span>
                    <span className={styles.participantStatus}>
                      <StatusBadge status={participant.status} label={tLabels(participant.status)} />
                    </span>
                    {participant.packageUsage ? (
                      <span className={styles.packageTag}>
                        {participant.packageUsage.package.name}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isPastLesson && lesson.participants.length > 0 && (
          <LessonFeedbackSection
            lessonId={lesson.id}
            axesByStudentId={axesByStudentId}
            participants={lesson.participants.map((p) => {
              const existingFeedback =
                lesson.feedbacks.find((f) => f.studentId === p.user.id) ?? null;
              const existingAssessment =
                lesson.assessments.find((a) => a.studentId === p.user.id) ?? null;
              return {
                studentId: p.user.id,
                studentName: `${p.user.firstName} ${p.user.lastName}`,
                existingFeedback: existingFeedback
                  ? {
                      videoUrl: existingFeedback.videoUrl,
                      studentFeedback: existingFeedback.studentFeedback,
                      internalNotes: existingFeedback.internalNotes,
                    }
                  : null,
                existingAssessment: existingAssessment
                  ? {
                      id: existingAssessment.id,
                      notes: existingAssessment.notes,
                      scores: existingAssessment.scores,
                    }
                  : null,
              };
            })}
            t={{
              sectionTitle: tFeedback("sectionTitle"),
              participantTitle: tFeedback.raw("participantTitle") as string,
              videoUrl: tFeedback("videoUrl"),
              videoUrlPlaceholder: tFeedback("videoUrlPlaceholder"),
              studentFeedback: tFeedback("studentFeedback"),
              studentFeedbackPlaceholder: tFeedback("studentFeedbackPlaceholder"),
              internalNotes: tFeedback("internalNotes"),
              internalNotesPlaceholder: tFeedback("internalNotesPlaceholder"),
              skillAssessment: tFeedback("skillAssessment"),
              noAxesConfigured: tFeedback("noAxesConfigured"),
              save: tFeedback("save"),
              saving: tFeedback("saving"),
              saved: tFeedback("saved"),
            }}
          />
        )}
      </div>
    </div>
  );
}
