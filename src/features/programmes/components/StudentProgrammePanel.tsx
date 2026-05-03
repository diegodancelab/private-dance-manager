"use client";

import { useTransition } from "react";
import {
  assignProgramme,
  unassignProgramme,
  updateItemStatus,
} from "@/features/programmes/student-progress-actions";
import type { StudentProgrammeWithStatuses, ProgrammeListItem } from "@/features/programmes/queries";
import type { ProgrammeItemStatus } from "@/generated/prisma/client";
import styles from "./StudentProgrammePanel.module.css";

const STATUS_CYCLE: ProgrammeItemStatus[] = ["NOT_STARTED", "INTRODUCED", "IN_PROGRESS", "MASTERED"];

const STATUS_ICONS: Record<ProgrammeItemStatus, string> = {
  NOT_STARTED: "⚪",
  INTRODUCED:  "🟡",
  IN_PROGRESS: "🔵",
  MASTERED:    "🟢",
};

type T = {
  studentProgramme: string;
  assignProgramme: string;
  selectProgramme: string;
  assign: string;
  unassign: string;
  progress: string;
  NOT_STARTED: string;
  INTRODUCED: string;
  IN_PROGRESS: string;
  MASTERED: string;
  noAssignedProgramme: string;
  optional: string;
};

type Props = {
  studentId: string;
  studentProgramme: StudentProgrammeWithStatuses | null;
  teacherProgrammes: ProgrammeListItem[];
  t: T;
};

export default function StudentProgrammePanel({ studentId, studentProgramme, teacherProgrammes, t }: Props) {
  const [, startTransition] = useTransition();

  if (!studentProgramme) {
    return (
      <div className={styles.emptyBlock}>
        <p className={styles.emptyText}>{t.noAssignedProgramme}</p>
        {teacherProgrammes.length > 0 && (
          <form
            action={(fd) => { fd.append("studentId", studentId); startTransition(() => assignProgramme(fd)); }}
            className={styles.assignForm}
          >
            <select name="programmeId" className={styles.select} required>
              <option value="">{t.selectProgramme}</option>
              {teacherProgrammes.map((p) => (
                <option key={p.id} value={p.id}>{p.name}{p.level ? ` — ${p.level}` : ""}</option>
              ))}
            </select>
            <button type="submit" className={styles.btnPrimary}>{t.assign}</button>
          </form>
        )}
      </div>
    );
  }

  const { programme, itemStatuses, id: spId } = studentProgramme;
  const statusMap = new Map(itemStatuses.map((s) => [s.itemId, s.status]));

  const allItems = programme.sections.flatMap((s) => s.items);
  const masteredCount = allItems.filter((item) => statusMap.get(item.id) === "MASTERED").length;
  const progress = t.progress
    .replace("{done}", String(masteredCount))
    .replace("{total}", String(allItems.length));

  return (
    <div className={styles.root}>
      <div className={styles.programmeHeader}>
        <div>
          <span className={styles.programmeName}>{programme.name}</span>
          {programme.level && <span className={styles.programmeLevel}>{programme.level}</span>}
          <span className={styles.progressBadge}>{progress}</span>
        </div>
        <div className={styles.headerActions}>
          {teacherProgrammes.length > 0 && (
            <form
              action={(fd) => { fd.append("studentId", studentId); startTransition(() => assignProgramme(fd)); }}
              className={styles.reassignForm}
            >
              <select name="programmeId" className={styles.selectSm} defaultValue="">
                <option value="" disabled>{t.selectProgramme}</option>
                {teacherProgrammes.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <button type="submit" className={styles.btnSm}>{t.assignProgramme}</button>
            </form>
          )}
          <form action={(fd) => { fd.append("studentProgrammeId", spId); fd.append("studentId", studentId); startTransition(() => unassignProgramme(fd)); }}>
            <button type="submit" className={styles.btnDanger}
              onClick={(e) => { if (!confirm(`Retirer ce programme ?`)) e.preventDefault(); }}>
              {t.unassign}
            </button>
          </form>
        </div>
      </div>

      <div className={styles.sections}>
        {programme.sections.map((section) => {
          const sectionItems = section.items;
          const sectionMastered = sectionItems.filter((item) => statusMap.get(item.id) === "MASTERED").length;

          return (
            <details key={section.id} className={styles.section}>
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
                  const currentStatus = statusMap.get(item.id) ?? "NOT_STARTED";
                  const nextStatus = STATUS_CYCLE[(STATUS_CYCLE.indexOf(currentStatus) + 1) % STATUS_CYCLE.length];

                  return (
                    <form
                      key={item.id}
                      action={(fd) => {
                        fd.append("studentProgrammeId", spId);
                        fd.append("itemId", item.id);
                        fd.append("studentId", studentId);
                        fd.append("status", nextStatus);
                        startTransition(() => updateItemStatus(fd));
                      }}
                      className={styles.itemForm}
                    >
                      <button type="submit" className={styles.itemBtn} title={t[nextStatus]}>
                        <span className={styles.itemIcon}>{STATUS_ICONS[currentStatus]}</span>
                        <span className={styles.itemName}>{item.name}</span>
                        {item.nameAlt && <span className={styles.itemNameAlt}>{item.nameAlt}</span>}
                        {!item.isMandatory && <span className={styles.optionalTag}>{t.optional}</span>}
                        <span className={styles.statusLabel}>{t[currentStatus]}</span>
                      </button>
                    </form>
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
