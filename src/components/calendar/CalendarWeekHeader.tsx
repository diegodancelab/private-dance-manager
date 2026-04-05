import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button";
import styles from "./CalendarWeekHeader.module.css";
import { addDays, formatWindowLabel, CalendarViewMode } from "@/lib/calendar";

const LOCALE_MAP: Record<string, string> = {
  fr: "fr-CH",
  en: "en-GB",
  es: "es-ES",
};

type CalendarWeekHeaderProps = {
  currentDate: Date;
  viewMode: CalendarViewMode;
};

function toDateParam(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function CalendarWeekHeader({
  currentDate,
  viewMode,
}: CalendarWeekHeaderProps) {
  const t = await getTranslations("calendar");
  const locale = await getLocale();
  const dateLocale = LOCALE_MAP[locale] || "fr-CH";
  const previousWeek = addDays(currentDate, -7);
  const nextWeek = addDays(currentDate, 7);
  const dateParam = toDateParam(currentDate);

  return (
    <div className={styles.header}>
      <div>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.subtitle}>
          {formatWindowLabel(currentDate, viewMode, dateLocale)}
        </p>
      </div>

      <div className={styles.actions}>
        <div className={styles.viewToggle} role="group" aria-label={t("viewLabel")}>
          <Link
            href={`/calendar?date=${dateParam}&view=rolling`}
            className={`${styles.toggleOption} ${viewMode === "rolling" ? styles.toggleActive : ""}`}
          >
            {t("sevenDays")}
          </Link>
          <Link
            href={`/calendar?date=${dateParam}&view=week`}
            className={`${styles.toggleOption} ${viewMode === "week" ? styles.toggleActive : ""}`}
          >
            {t("week")}
          </Link>
        </div>

        <Button
          href={`/calendar?date=${toDateParam(previousWeek)}&view=${viewMode}`}
          variant="secondary"
          size="sm"
        >
          ←
        </Button>

        <Button
          href={`/calendar?view=${viewMode}`}
          variant="secondary"
          size="sm"
        >
          {t("today")}
        </Button>

        <Button
          href={`/calendar?date=${toDateParam(nextWeek)}&view=${viewMode}`}
          variant="secondary"
          size="sm"
        >
          →
        </Button>

        <Button href="/lessons/new" size="sm">
          {t("addLesson")}
        </Button>
      </div>
    </div>
  );
}
