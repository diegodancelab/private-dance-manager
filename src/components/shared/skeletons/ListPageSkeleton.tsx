import styles from "./ListPageSkeleton.module.css";
import bone from "./SkeletonBone.module.css";

export default function ListPageSkeleton() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headingGroup}>
          <span className={bone.bone} style={{ width: 160, height: 28 }} />
          <span className={bone.bone} style={{ width: 220, height: 18, marginTop: 6 }} />
        </div>
        <span className={bone.bone} style={{ width: 120, height: 34, borderRadius: 8 }} />
      </div>

      <div className={styles.tableWrapper}>
        <div className={styles.tableHead}>
          {[140, 100, 120, 80].map((w, i) => (
            <span key={i} className={bone.bone} style={{ width: w, height: 14 }} />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, row) => (
          <div key={row} className={styles.tableRow}>
            {[140, 100, 120, 40].map((w, i) => (
              <span key={i} className={bone.bone} style={{ width: w, height: 14 }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
