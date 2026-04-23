import bone from "@/components/shared/skeletons/SkeletonBone.module.css";
import styles from "./PortalDashboard.module.css";

export default function PortalDashboardLoading() {
  return (
    <div className={styles.page}>
      <span className={bone.bone} style={{ width: 200, height: 28 }} />

      <div className={styles.cards}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={styles.card}>
            <span className={bone.bone} style={{ width: 100, height: 12 }} />
            <span className={bone.bone} style={{ width: 180, height: 20, marginTop: 8 }} />
            <span className={bone.bone} style={{ width: 140, height: 13, marginTop: 6 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
