import Link from "next/link";
import type { UpcomingLesson } from "@/features/students/queries/getStudentDetail";
import { getLabel } from "@/lib/labels";
import { formatDateTime } from "@/lib/format";
import styles from "./StudentDetail.module.css";

type Props = {
  lessons: UpcomingLesson[];
};

export default function StudentLessonsSection({ lessons }: Props) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Upcoming lessons</h2>

      {lessons.length === 0 ? (
        <p className={styles.emptyText}>No upcoming lessons.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeadCell}>Lesson</th>
                <th className={styles.tableHeadCell}>Date & time</th>
                <th className={styles.tableHeadCell}>Duration</th>
                <th className={styles.tableHeadCell}>Type</th>
                <th className={styles.tableHeadCell}>Location</th>
                <th className={styles.tableHeadCell}></th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((lesson) => (
                <tr key={lesson.id}>
                  <td className={styles.tableCell}>{lesson.title}</td>
                  <td className={styles.tableCell}>
                    {formatDateTime(lesson.scheduledAt)}
                  </td>
                  <td className={styles.tableCell}>
                    {lesson.durationMin} min
                  </td>
                  <td className={styles.tableCell}>
                    {getLabel(lesson.lessonType)}
                  </td>
                  <td className={styles.tableCell}>
                    {lesson.location ?? "—"}
                  </td>
                  <td className={styles.tableCell}>
                    <Link
                      href={`/lessons/${lesson.id}`}
                      className={styles.actionLink}
                    >
                      Open lesson
                    </Link>
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
