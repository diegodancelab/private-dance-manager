import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireTeacherAuth } from "@/lib/auth/require-auth";
import { getTeacherLevels } from "@/features/levels/queries";
import LevelsManager from "@/features/levels/components/LevelsManager";
import styles from "./LevelsPage.module.css";

type Props = { params: Promise<{ locale: string }> };

export default async function LevelsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { user } = await requireTeacherAuth();
  const t = await getTranslations("levels");

  const levels = await getTeacherLevels(user.id);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>
        </div>
      </div>

      <div className={styles.card}>
        <LevelsManager
          levels={levels}
          t={{
            addLevel: t("addLevel"),
            namePlaceholder: t("namePlaceholder"),
            name: t("name"),
            color: t("color"),
            save: t("save"),
            delete: t("delete"),
            edit: t("edit"),
            noLevels: t("noLevels"),
            confirmDelete: t("confirmDelete"),
          }}
        />
      </div>
    </div>
  );
}
