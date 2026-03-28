import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import { getLabel } from "@/lib/labels";
import { formatDateTime } from "@/lib/format";
import styles from "./LessonDetail.module.css";

type Props = {
  params: Promise<{ id: string }>;
};


export default async function LessonDetailPage({ params }: Props) {
  const { id } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id },
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
    },
  });

  if (!lesson) notFound();

  return (
    <div className={styles.page}>
      <Link href="/lessons" className={styles.backLink}>
        ← Back to lessons
      </Link>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h1 className={styles.cardTitle}>{lesson.title}</h1>
          <div className={styles.cardActions}>
            <Link
              href={`/lessons/${lesson.id}/edit`}
              className={styles.secondaryLink}
            >
              Edit
            </Link>
          </div>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Type</span>
              <span className={styles.infoValue}>{getLabel(lesson.lessonType)}</span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Scheduled at</span>
              <span className={styles.infoValue}>
                {formatDateTime(lesson.scheduledAt)}
              </span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Duration</span>
              <span className={styles.infoValue}>{lesson.durationMin} min</span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Price</span>
              <span className={styles.infoValue}>
                {lesson.priceAmount ? `${lesson.priceAmount} CHF` : "—"}
              </span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Location</span>
              <span className={styles.infoValue}>{lesson.location ?? "—"}</span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Teacher</span>
              <span className={styles.infoValue}>
                {lesson.teacher.firstName} {lesson.teacher.lastName}
              </span>
            </div>

            {lesson.description ? (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Description</span>
                <span className={styles.infoValue}>{lesson.description}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Participants ({lesson.participants.length})
          </h2>

          {lesson.participants.length === 0 ? (
            <p className={styles.emptyText}>No students assigned.</p>
          ) : (
            <div className={styles.participantList}>
              {lesson.participants.map((participant) => (
                <div key={participant.id} className={styles.participantRow}>
                  <div className={styles.participantInfo}>
                    <span className={styles.participantName}>
                      {participant.user.firstName} {participant.user.lastName}
                    </span>
                    <span className={styles.participantStatus}>
                      <StatusBadge status={participant.status} />
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
      </div>
    </div>
  );
}
