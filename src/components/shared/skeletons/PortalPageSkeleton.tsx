import bone from "./SkeletonBone.module.css";
import styles from "./PortalPageSkeleton.module.css";

type Props = {
  cards?: number;
};

export default function PortalPageSkeleton({ cards = 3 }: Props) {
  return (
    <div className={styles.page}>
      {/* Page title */}
      <span className={bone.bone} style={{ width: 180, height: 28 }} />

      {/* Section */}
      <div className={styles.section}>
        <span className={bone.bone} style={{ width: 100, height: 12 }} />
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={bone.bone} style={{ width: 160, height: 16 }} />
              <span className={bone.bone} style={{ width: 60, height: 20, borderRadius: 4 }} />
            </div>
            <span className={bone.bone} style={{ width: 220, height: 13, marginTop: 4 }} />
          </div>
        ))}
      </div>

      {/* Second section */}
      <div className={styles.section}>
        <span className={bone.bone} style={{ width: 80, height: 12 }} />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={bone.bone} style={{ width: 140 + i * 20, height: 16 }} />
              <span className={bone.bone} style={{ width: 60, height: 20, borderRadius: 4 }} />
            </div>
            <span className={bone.bone} style={{ width: 180, height: 13, marginTop: 4 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
