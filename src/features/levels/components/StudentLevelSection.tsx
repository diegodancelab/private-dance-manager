"use client";

import { useTransition } from "react";
import { assignStudentLevel, removeStudentLevel } from "@/features/levels/actions";
import styles from "./StudentLevelSection.module.css";

type Level = { id: string; name: string; color: string };

type T = {
  studentLevel: string;
  noLevel: string;
  assignLevel: string;
  removeLevel: string;
  selectLevel: string;
};

type Props = {
  studentId: string;
  currentLevel: Level | null;
  teacherLevels: Level[];
  t: T;
};

export default function StudentLevelSection({ studentId, currentLevel, teacherLevels, t }: Props) {
  const [, startTransition] = useTransition();

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        {currentLevel ? (
          <span
            className={styles.badge}
            style={{
              background: currentLevel.color + "22",
              color: currentLevel.color,
              borderColor: currentLevel.color + "55",
            }}
          >
            {currentLevel.name}
          </span>
        ) : (
          <span className={styles.noLevel}>{t.noLevel}</span>
        )}

        {teacherLevels.length > 0 && (
          <form
            action={(fd) => { fd.append("studentId", studentId); startTransition(() => assignStudentLevel(fd)); }}
            className={styles.assignForm}
          >
            <select name="levelId" className={styles.select} defaultValue="" required>
              <option value="" disabled>{t.selectLevel}</option>
              {teacherLevels.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
            <button type="submit" className={styles.btnAssign}>{t.assignLevel}</button>
          </form>
        )}

        {currentLevel && (
          <form action={(fd) => { fd.append("studentId", studentId); startTransition(() => removeStudentLevel(fd)); }}>
            <button
              type="submit"
              className={styles.btnDanger}
              onClick={(e) => { if (!confirm("Retirer le niveau ?")) e.preventDefault(); }}
            >
              {t.removeLevel}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
