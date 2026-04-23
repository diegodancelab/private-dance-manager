import bone from "@/components/shared/skeletons/SkeletonBone.module.css";
import styles from "./PortalProfile.module.css";

export default function PortalProfileLoading() {
  return (
    <div className={styles.page}>
      <span className={bone.bone} style={{ width: 140, height: 28 }} />

      <div className={styles.section}>
        <div className={styles.infoList}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.infoRow}>
              <span className={bone.bone} style={{ width: 60, height: 12 }} />
              <span className={bone.bone} style={{ width: 160, height: 14 }} />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <span className={bone.bone} style={{ width: 160, height: 12 }} />
        <div className={styles.passwordForm} style={{ gap: "1rem" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <span className={bone.bone} style={{ width: 120, height: 12 }} />
              <span className={bone.bone} style={{ width: "100%", height: 36, borderRadius: 6 }} />
            </div>
          ))}
          <span className={bone.bone} style={{ width: 100, height: 36, borderRadius: 6 }} />
        </div>
      </div>
    </div>
  );
}
