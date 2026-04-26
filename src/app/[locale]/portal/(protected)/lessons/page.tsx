import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireStudentAuth } from "@/lib/auth/require-auth";
import { getStudentLessons } from "@/features/portal/queries/getStudentLessons";
import LessonsView from "./LessonsView";
import styles from "./PortalLessons.module.css";

type Props = { params: Promise<{ locale: string }> };

export default async function PortalLessonsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { user } = await requireStudentAuth();
  const t = await getTranslations("portal.lessons");
  const tLabels = await getTranslations("labels");

  const { upcoming, past, canceled } = await getStudentLessons(user.id);

  const lessonTypeLabels: Record<string, string> = {
    PRIVATE: tLabels("PRIVATE"),
    DUO: tLabels("DUO"),
    GROUP: tLabels("GROUP"),
    ONLINE: tLabels("ONLINE"),
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t("title")}</h1>
          <p className={styles.pageSubtitle}>{t("subtitle")}</p>
        </div>
        <button className={styles.btnBook} disabled>{t("bookLesson")}</button>
      </div>

      <LessonsView
        upcoming={upcoming}
        past={past}
        canceled={canceled}
        labels={{
          tabUpcoming: t("upcoming"),
          tabPast: t("past"),
          tabCanceled: t("canceled"),
          noUpcoming: t("noUpcoming"),
          noPast: t("noPast"),
          noCanceled: t("noCanceled"),
          seeAssessment: t("seeAssessment"),
          reschedule: t("reschedule"),
          feedbackFromTeacher: t("feedbackFromTeacher"),
        }}
        lessonTypeLabels={lessonTypeLabels}
      />
    </div>
  );
}
