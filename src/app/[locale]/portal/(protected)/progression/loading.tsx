import bone from "@/components/shared/skeletons/SkeletonBone.module.css";
import styles from "./PortalProgression.module.css";

export default function PortalProgressionLoading() {
  return (
    <div className={styles.page}>
      <span className={bone.bone} style={{ width: 180, height: 28 }} />

      <div className={styles.section}>
        <span className={bone.bone} style={{ width: 110, height: 12 }} />
        <div className={styles.radarCard}>
          <span className={bone.bone} style={{ width: 280, height: 280, borderRadius: "50%" }} />
          <span className={bone.bone} style={{ width: 140, height: 13 }} />
        </div>
      </div>
    </div>
  );
}
