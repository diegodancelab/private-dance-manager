"use client";

import type { StudentProgrammeWithStatuses } from "@/features/programmes/queries";
import type { ProgrammeItemStatus } from "@/generated/prisma/client";
import styles from "./PortalProgrammeView.module.css";

const STATUS_ICONS: Record<ProgrammeItemStatus, string> = {
  NOT_STARTED: "⚪",
  INTRODUCED:  "🟡",
  IN_PROGRESS: "🔵",
  MASTERED:    "🟢",
};

type T = {
  portalTitle: string;
  portalSubtitle: string;
  portalNoProgram: string;
  progress: string;
  NOT_STARTED: string;
  INTRODUCED: string;
  IN_PROGRESS: string;
  MASTERED: string;
  optional: string;
};

type Props = {
  studentProgramme: StudentProgrammeWithStatuses | null;
  t: T;
};

export default function PortalProgrammeView({ studentProgramme, t }: Props) {
  if (!studentProgramme) {
    return (
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>{t.portalTitle}</h1>
        </div>
        <p className={styles.noProgram}>{t.portalNoProgram}</p>
      </div>
    );
  }

  const { programme, itemStatuses } = studentProgramme;
  const statusMap = new Map(itemStatuses.map((s) => [s.itemId, s.status]));

  const allItems = programme.sections.flatMap((s) => s.items);
  const masteredCount = allItems.filter((item) => statusMap.get(item.id) === "MASTERED").length;
  const totalCount = allItems.length;
  const progressPct = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;
  const progressLabel = t.progress.replace("{done}", String(masteredCount)).replace("{total}", String(totalCount));

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{programme.name}</h1>
          {t.portalSubtitle && <p className={styles.pageSubtitle}>{t.portalSubtitle}</p>}
        </div>
      </div>

      {/* Global progress bar */}
      <div className={styles.progressCard}>
        <div className={styles.progressTop}>
          <span className={styles.progressLabel}>{progressLabel}</span>
          <span className={styles.progressPct}>{progressPct}%</span>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Sections */}
      <div className={styles.sections}>
        {programme.sections.map((section) => {
          const sectionItems = section.items;
          const sectionMastered = sectionItems.filter((item) => statusMap.get(item.id) === "MASTERED").length;

          return (
            <details key={section.id} className={styles.section} open={sectionItems.some((item) => (statusMap.get(item.id) ?? "NOT_STARTED") !== "MASTERED")}>
              <summary className={styles.sectionSummary}>
                <span className={styles.sectionTitle}>{section.title}</span>
                {section.subtitle && <span className={styles.sectionSub}>{section.subtitle}</span>}
                <span className={styles.sectionCount}>{sectionMastered}/{sectionItems.length}</span>
              </summary>

              {section.description && (
                <p className={styles.sectionDesc}>{section.description}</p>
              )}

              <div className={styles.itemsList}>
                {sectionItems.map((item) => {
                  const status = statusMap.get(item.id) ?? "NOT_STARTED";
                  return (
                    <div key={item.id} className={styles.itemRow} data-status={status}>
                      <span className={styles.itemIcon}>{STATUS_ICONS[status]}</span>
                      <span className={styles.itemName}>{item.name}</span>
                      {item.nameAlt && <span className={styles.itemNameAlt}>{item.nameAlt}</span>}
                      {!item.isMandatory && <span className={styles.optionalTag}>{t.optional}</span>}
                      <span className={styles.statusLabel}>{t[status]}</span>
                    </div>
                  );
                })}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
