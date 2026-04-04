import { getTranslations } from "next-intl/server";
import Button from "@/components/ui/Button";
import styles from "./QuickActions.module.css";

export default async function QuickActions() {
  const t = await getTranslations("dashboard");

  return (
    <div className={styles.container}>
      <Button href="/lessons/new" size="sm">{t("createLesson")}</Button>
      <Button href="/students/new" size="sm">{t("addStudent")}</Button>
      <Button href="/payments/new" size="sm">{t("addPayment")}</Button>
    </div>
  );
}
