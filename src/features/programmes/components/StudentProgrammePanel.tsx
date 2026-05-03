"use client";

import { useState, useTransition } from "react";
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
  studentProgrammes: StudentProgrammeWithStatuses[];
  teacherProgrammes: ProgrammeListItem[];
  t: T;
};

export default function StudentProgrammePanel({ studentId, studentProgrammes, teacherProgrammes, t }: Props) {
  const [, startTransition] = useTransition();
  const [selectedProgrammeId, setSelectedProgrammeId] = useState("");

  const assignedIds = new Set(studentProgrammes.map((sp) => sp.programme.id));
  const alreadyAssigned = selectedProgrammeId !== "" && assignedIds.has(selectedProgrammeId);

  return (
    <div className={styles.root}>
      {/* Assign form */}
      {teacherProgrammes.length > 0 && (
        <form
          action={(fd) => {
            fd.append("studentId", studentId);
            startTransition(() => assignProgramme(fd));
            setSelectedProgrammeId("");
          }}
          className={styles.assignForm}
        >
          <select
            name="programmeId"
            className={styles.select}
            required
            value={selectedProgrammeId}
            onChange={(e) => setSelectedProgrammeId(e.target.value)}
          >
            <option value="">{t.selectProgramme}</option>
            {teacherProgrammes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}{p.level ? ` — ${p.level}` : ""}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={!selectedProgrammeId || alreadyAssigned}
            title={alreadyAssigned ? "Déjà assigné" : undefined}
          >
            {t.assign}
          </button>
        </form>
      )}

      {/* Assigned programmes list */}
      {studentProgrammes.length === 0 ? (
        <p className={styles.emptyText}>{t.noAssignedProgramme}</p>
      ) : (
        <div className={styles.programmesList}>
          {studentProgrammes.map((sp) => {
            const { programme, itemStatuses, id: spId } = sp;
            const statusMap = new Map(itemStatuses.map((s) => [s.itemId, s.status]));
            const allItems = programme.sections.flatMap((s) => s.items);
            const masteredCount = allItems.filter((item) => statusMap.get(item.id) === "MASTERED").length;
            const progress = t.progress
              .replace("{done}", String(masteredCount))
              .replace("{total}", String(allItems.length));

            return (
              <div key={spId} className={styles.programmeBlock}>
                <div className={styles.programmeHeader}>
                  <div className={styles.programmeHeaderLeft}>
                    <span className={styles.programmeName}>{programme.name}</span>
                    {programme.level && <span className={styles.programmeLevel}>{programme.level}</span>}
                    <span className={styles.progressBadge}>{progress}</span>
                  </div>
                  <form
                    action={(fd) => {
                      fd.append("studentProgrammeId", spId);
                      fd.append("studentId", studentId);
                      startTransition(() => unassignProgramme(fd));
                    }}
                  >
                    <button
                      type="submit"
                      className={styles.btnDanger}
                      onClick={(e) => { if (!confirm(`Retirer "${programme.name}" ?`)) e.preventDefault(); }}
                    >
                      {t.unassign}
                    </button>
                  </form>
                </div>

                <div className={styles.sections}>
                  {programme.sections.map((section) => {
                    const sectionItems = section.items;
                    const sectionMastered = sectionItems.filter((item) => statusMap.get(item.id) === "MASTERED").length;

                    return (
                      <details key={section.id} className={styles.section}>
                        <summary className={styles.sectionSummary}>
                          <span className={styles.sectionTitle}>{section.title}</span>
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
          })}
        </div>
      )}
    </div>
  );
}
