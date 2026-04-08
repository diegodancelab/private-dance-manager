import styles from "./CalendarSkeleton.module.css";
import bone from "@/components/shared/skeletons/SkeletonBone.module.css";

export default function CalendarLoading() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headingGroup}>
          <span className={bone.bone} style={{ width: 120, height: 28 }} />
          <span className={bone.bone} style={{ width: 180, height: 14, marginTop: 6 }} />
        </div>
        <div className={styles.controls}>
          <span className={bone.bone} style={{ width: 140, height: 34, borderRadius: 8 }} />
          <span className={bone.bone} style={{ width: 36, height: 34, borderRadius: 8 }} />
          <span className={bone.bone} style={{ width: 90, height: 34, borderRadius: 8 }} />
          <span className={bone.bone} style={{ width: 36, height: 34, borderRadius: 8 }} />
          <span className={bone.bone} style={{ width: 120, height: 34, borderRadius: 8 }} />
        </div>
      </div>

      <div className={styles.grid}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className={styles.dayColumn}>
            <div className={styles.dayHeader}>
              <span className={bone.bone} style={{ width: 70, height: 14 }} />
            </div>
            <div className={styles.dayBody}>
              {i === 0 && (
                <div className={styles.card}>
                  <span className={bone.bone} style={{ width: 80, height: 12 }} />
                  <span className={bone.bone} style={{ width: 100, height: 16, marginTop: 6 }} />
                  <span className={bone.bone} style={{ width: 70, height: 12, marginTop: 6 }} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
