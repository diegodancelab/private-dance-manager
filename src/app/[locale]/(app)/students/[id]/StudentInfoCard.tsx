import { getTranslations } from "next-intl/server";
import type { StudentDetailViewModel } from "@/features/students/queries/getStudentDetail";
import styles from "./StudentDetail.module.css";

type Props = {
  student: StudentDetailViewModel["student"];
};

export default async function StudentInfoCard({ student }: Props) {
  const t = await getTranslations("studentDetail");

  return (
    <div className={styles.cardBody}>
      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>{t("firstName")}</span>
          <span className={styles.infoValue}>{student.firstName}</span>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>{t("lastName")}</span>
          <span className={styles.infoValue}>{student.lastName}</span>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>{t("email")}</span>
          <span className={styles.infoValue}>{student.email ?? "—"}</span>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>{t("phone")}</span>
          <span className={styles.infoValue}>{student.phone ?? "—"}</span>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>{t("memberSince")}</span>
          <span className={styles.infoValue}>
            {student.createdAt.toLocaleDateString("fr-CH")}
          </span>
        </div>
      </div>
    </div>
  );
}
