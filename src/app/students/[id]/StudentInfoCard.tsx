import type { StudentDetailViewModel } from "@/features/students/queries/getStudentDetail";
import styles from "./StudentDetail.module.css";

type Props = {
  student: StudentDetailViewModel["student"];
};

export default function StudentInfoCard({ student }: Props) {
  return (
    <div className={styles.cardBody}>
      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>First name</span>
          <span className={styles.infoValue}>{student.firstName}</span>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Last name</span>
          <span className={styles.infoValue}>{student.lastName}</span>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Email</span>
          <span className={styles.infoValue}>{student.email ?? "—"}</span>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Phone</span>
          <span className={styles.infoValue}>{student.phone ?? "—"}</span>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Member since</span>
          <span className={styles.infoValue}>
            {student.createdAt.toLocaleDateString("fr-CH")}
          </span>
        </div>
      </div>
    </div>
  );
}
