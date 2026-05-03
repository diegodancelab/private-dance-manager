import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireTeacherAuth } from "@/lib/auth/require-auth";
import { createProgramme } from "@/features/programmes/actions";
import { Link } from "@/i18n/navigation";
import styles from "./NewProgrammePage.module.css";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NewProgrammePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requireTeacherAuth();
  const t = await getTranslations("programmes");

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/settings/programmes" className={styles.back}>{t("back")}</Link>
        <h1 className={styles.title}>{t("newProgramme")}</h1>
      </div>

      <form action={createProgramme} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>{t("name")} *</label>
          <input name="name" required placeholder={t("namePlaceholder")} className={styles.input} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t("danceStyle")}</label>
          <input name="danceStyle" placeholder={t("danceStylePlaceholder")} className={styles.input} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t("level")}</label>
          <input name="level" placeholder={t("levelPlaceholder")} className={styles.input} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t("description")}</label>
          <textarea name="description" placeholder={t("descriptionPlaceholder")} rows={3} className={styles.textarea} />
        </div>
        <button type="submit" className={styles.submit}>{t("save")}</button>
      </form>
    </div>
  );
}
