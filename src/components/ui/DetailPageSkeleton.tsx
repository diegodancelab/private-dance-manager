import styles from "./DetailPageSkeleton.module.css";
import bone from "./SkeletonBone.module.css";

export default function DetailPageSkeleton() {
  return (
    <div className={styles.page}>
      <span className={bone.bone} style={{ width: 140, height: 14 }} />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={bone.bone} style={{ width: 200, height: 24 }} />
          <span className={bone.bone} style={{ width: 100, height: 34, borderRadius: 8 }} />
        </div>
        <div className={styles.cardBody}>
          <div className={styles.infoGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.infoItem}>
                <span className={bone.bone} style={{ width: 80, height: 12 }} />
                <span className={bone.bone} style={{ width: i % 2 === 0 ? 160 : 120, height: 16, marginTop: 6 }} />
              </div>
            ))}
          </div>
        </div>
        <div className={styles.section}>
          <span className={bone.bone} style={{ width: 120, height: 18, marginBottom: 12 }} />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.sectionRow}>
              <span className={bone.bone} style={{ width: 140, height: 14 }} />
              <span className={bone.bone} style={{ width: 100, height: 14 }} />
              <span className={bone.bone} style={{ width: 80, height: 14 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
