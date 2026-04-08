import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Eye } from "lucide-react";
import type { UpcomingLesson } from "@/features/students/queries/getStudentDetail";
import { formatDateTime } from "@/lib/format";
import styles from "./StudentDetail.module.css";

type Props = {
  lessons: UpcomingLesson[];
};

export default async function StudentLessonsSection({ lessons }: Props) {
  const t = await getTranslations("studentDetail");
  const tLabels = await getTranslations("labels");

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>{t("sectionUpcomingLessons")}</h2>

      {lessons.length === 0 ? (
        <p className={styles.emptyText}>{t("noUpcomingLessons")}</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeadCell}>{t("colLesson")}</th>
                <th className={styles.tableHeadCell}>{t("colDateTime")}</th>
                <th className={styles.tableHeadCell}>{t("colDuration")}</th>
                <th className={styles.tableHeadCell}>{t("colType")}</th>
                <th className={styles.tableHeadCell}>{t("colLocation")}</th>
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
                    {tLabels(lesson.lessonType)}
                  </td>
                  <td className={styles.tableCell}>
                    {lesson.location ?? "—"}
                  </td>
                  <td className={styles.tableCell}>
                    <Link
                      href={`/lessons/${lesson.id}`}
                      className={styles.actionIconLink}
                      title={t("openLesson")}
                    >
                      <Eye size={16} />
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
