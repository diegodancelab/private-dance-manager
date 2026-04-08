import styles from "./DashboardSkeleton.module.css";
import bone from "@/components/ui/SkeletonBone.module.css";

export default function DashboardLoading() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headingGroup}>
          <span className={bone.bone} style={{ width: 180, height: 32 }} />
          <span className={bone.bone} style={{ width: 140, height: 16, marginTop: 8 }} />
        </div>
        <div className={styles.quickActions}>
          <span className={bone.bone} style={{ width: 130, height: 34, borderRadius: 8 }} />
          <span className={bone.bone} style={{ width: 130, height: 34, borderRadius: 8 }} />
          <span className={bone.bone} style={{ width: 150, height: 34, borderRadius: 8 }} />
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.main}>
          <div className={styles.section}>
            <span className={bone.bone} style={{ width: 140, height: 14 }} />
            <div className={styles.cardList}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={styles.card}>
                  <span className={bone.bone} style={{ width: 100, height: 12 }} />
                  <span className={bone.bone} style={{ width: 160, height: 18, marginTop: 6 }} />
                  <span className={bone.bone} style={{ width: 120, height: 12, marginTop: 6 }} />
                </div>
              ))}
            </div>
          </div>
          <div className={styles.section}>
            <span className={bone.bone} style={{ width: 80, height: 14 }} />
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className={styles.alertRow}>
                <span className={bone.bone} style={{ width: "100%", height: 52, borderRadius: 8 }} />
              </div>
            ))}
          </div>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.moneyCard}>
            <span className={bone.bone} style={{ width: 100, height: 14 }} />
            <span className={bone.bone} style={{ width: 140, height: 36, marginTop: 10 }} />
            <div className={styles.chargeList}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={styles.chargeRow}>
                  <span className={bone.bone} style={{ width: 100, height: 14 }} />
                  <span className={bone.bone} style={{ width: 70, height: 14 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
