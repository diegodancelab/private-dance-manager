import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireTeacherAuth } from "@/lib/auth/require-auth";
import { getTeacherProgrammes } from "@/features/programmes/queries";
import { Link } from "@/i18n/navigation";
import styles from "./ProgrammesPage.module.css";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ProgrammesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { user } = await requireTeacherAuth();
  const t = await getTranslations("programmes");

  const programmes = await getTeacherProgrammes(user.id);

  return (
    <div style={{ maxWidth: 700 }}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>
        </div>
        <Link href="/settings/programmes/new" className={styles.newButton}>
          {t("newProgramme")}
        </Link>
      </div>

      {programmes.length === 0 ? (
        <p className={styles.empty}>{t("noProgrammes")}</p>
      ) : (
        <div className={styles.list}>
          {programmes.map((p) => (
            <Link key={p.id} href={`/settings/programmes/${p.id}`} className={styles.card}>
              <div className={styles.cardMain}>
                <span className={styles.cardName}>{p.name}</span>
                {(p.level || p.danceStyle) && (
                  <span className={styles.cardMeta}>
                    {[p.danceStyle, p.level].filter(Boolean).join(" · ")}
                  </span>
                )}
              </div>
              <div className={styles.cardStats}>
                <span>{p._count.sections} {t("sections")}</span>
                <span>{p._count.assignments} {t("students")}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
