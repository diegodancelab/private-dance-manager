import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getLabel } from "@/lib/labels";
import { requireAuth } from "@/lib/auth/require-auth";
import Button from "@/components/ui/Button";
import styles from "./LessonsPage.module.css";

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("fr-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default async function LessonsPage() {
  const { user } = await requireAuth();

  const lessons = await prisma.lesson.findMany({
    where: { teacherId: user.id },
    orderBy: {
      scheduledAt: "desc",
    },
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <h1 className={styles.title}>Lessons</h1>
          <p className={styles.subtitle}>All scheduled lessons across your students.</p>
        </div>

        <Button href="/lessons/new" size="sm">Add lesson</Button>
      </div>

      {lessons.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No lessons yet.</p>
          <p className={styles.emptySubtext}>Create your first lesson to get started.</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeadCell}>Title</th>
                <th className={styles.tableHeadCell}>Type</th>
                <th className={styles.tableHeadCell}>Scheduled at</th>
                <th className={styles.tableHeadCell}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {lessons.map((lesson) => (
                <tr key={lesson.id}>
                  <td className={styles.tableCell}>{lesson.title}</td>

                  <td className={styles.tableCell}>{getLabel(lesson.lessonType)}</td>

                  <td className={styles.tableCell}>
                    {formatDateTime(lesson.scheduledAt)}
                  </td>

                  <td className={styles.tableCell}>
                    <div className={styles.actions}>
                      <Link
                        href={`/lessons/${lesson.id}`}
                        className={styles.actionLink}
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
