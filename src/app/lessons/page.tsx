import Link from "next/link";
import { prisma } from "@/lib/prisma";
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
  const lessons = await prisma.lesson.findMany({
    orderBy: {
      scheduledAt: "desc",
    },
    include: {
      teacher: true,
    },
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <h1 className={styles.title}>Lessons</h1>
          <p className={styles.subtitle}>All scheduled lessons across your students.</p>
        </div>

        <Link href="/lessons/new" className={styles.createLink}>
          Add lesson
        </Link>
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
                <th className={styles.tableHeadCell}>Teacher</th>
                <th className={styles.tableHeadCell}>Scheduled at</th>
                <th className={styles.tableHeadCell}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {lessons.map((lesson) => (
                <tr key={lesson.id}>
                  <td className={styles.tableCell}>{lesson.title}</td>

                  <td className={styles.tableCell}>{lesson.lessonType}</td>

                  <td className={styles.tableCell}>
                    {lesson.teacher.firstName} {lesson.teacher.lastName}
                  </td>

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
