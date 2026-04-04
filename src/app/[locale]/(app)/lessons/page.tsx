import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/require-auth";
import Button from "@/components/ui/Button";
import styles from "./LessonsPage.module.css";

const LOCALE_MAP: Record<string, string> = {
  fr: "fr-CH",
  en: "en-GB",
  es: "es-ES",
};

export default async function LessonsPage() {
  const { user } = await requireAuth();
  const t = await getTranslations("lessonsPage");
  const tLabels = await getTranslations("labels");
  const tCommon = await getTranslations("common");
  const locale = await getLocale();
  const dateLocale = LOCALE_MAP[locale] ?? "fr-CH";

  function formatDateTime(date: Date) {
    return new Intl.DateTimeFormat(dateLocale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  }

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
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>
        </div>

        <Button href="/lessons/new" size="sm">{t("addLesson")}</Button>
      </div>

      {lessons.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>{t("noLessonsTitle")}</p>
          <p className={styles.emptySubtext}>{t("noLessonsSubtitle")}</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeadCell}>{t("colTitle")}</th>
                <th className={styles.tableHeadCell}>{t("colType")}</th>
                <th className={styles.tableHeadCell}>{t("colScheduledAt")}</th>
                <th className={styles.tableHeadCell}></th>
              </tr>
            </thead>

            <tbody>
              {lessons.map((lesson) => (
                <tr key={lesson.id}>
                  <td className={styles.tableCell}>{lesson.title}</td>

                  <td className={styles.tableCell}>{tLabels(lesson.lessonType)}</td>

                  <td className={styles.tableCell}>
                    {formatDateTime(lesson.scheduledAt)}
                  </td>

                  <td className={styles.tableCell}>
                    <div className={styles.actions}>
                      <Link
                        href={`/lessons/${lesson.id}`}
                        className={styles.actionLink}
                      >
                        {tCommon("view")}
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
