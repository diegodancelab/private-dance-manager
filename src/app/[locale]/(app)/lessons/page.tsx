import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/require-auth";
import Button from "@/components/ui/Button/Button";
import { Eye } from "lucide-react";
import styles from "./LessonsPage.module.css";

const LOCALE_MAP: Record<string, string> = {
  fr: "fr-CH",
  en: "en-GB",
  es: "es-ES",
};

type Props = { params: Promise<{ locale: string }> };

export default async function LessonsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { user } = await requireAuth();
  const t = await getTranslations("lessonsPage");
  const tLabels = await getTranslations("labels");
  const tCommon = await getTranslations("common");
  const tLessons = await getTranslations("lessons");
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
                <tr
                  key={lesson.id}
                  className={`${styles.clickableRow} ${lesson.status === "CANCELED" ? styles.canceledRow : ""}`}
                >
                  <td className={styles.tableCell} data-label={t("colTitle")}>
                    <Link href={`/lessons/${lesson.id}`} className={styles.rowLink}>
                      {lesson.title}
                    </Link>
                    {lesson.status === "CANCELED" && (
                      <span className={styles.canceledBadge}>{tLessons("statusCanceled")}</span>
                    )}
                  </td>

                  <td className={styles.tableCell} data-label={t("colType")}>{tLabels(lesson.lessonType)}</td>

                  <td className={styles.tableCell} data-label={t("colScheduledAt")}>
                    {formatDateTime(lesson.scheduledAt)}
                  </td>

                  <td className={styles.tableCell}>
                    <div className={styles.actions}>
                      <Link
                        href={`/lessons/${lesson.id}`}
                        className={styles.actionIconLink}
                        title={tCommon("view")}
                      >
                        <Eye size={16} />
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
