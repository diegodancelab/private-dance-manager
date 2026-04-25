"use client";

import { useTransition } from "react";
import {
  createSkillAxis,
  toggleSkillAxis,
  deleteSkillAxis,
  createDefaultAxes,
} from "@/features/skill-axes/actions";
import styles from "./SkillAxesManager.module.css";

type Axis = {
  id: string;
  label: string;
  order: number;
  isActive: boolean;
};

type Props = {
  axes: Axis[];
  studentId?: string;
  t: {
    addAxis: string;
    labelPlaceholder: string;
    add: string;
    remove: string;
    noAxes: string;
    createDefaults?: string;
    active: string;
    inactive: string;
  };
};

export default function SkillAxesManager({ axes, studentId, t }: Props) {
  const [isPending, startTransition] = useTransition();

  function submit(action: (fd: FormData) => Promise<void>, fd: FormData) {
    startTransition(() => action(fd));
  }

  function withStudentId(fd: FormData) {
    if (studentId) fd.append("studentId", studentId);
    return fd;
  }

  return (
    <div className={styles.container}>
      {/* Add new axis */}
      <form
        action={(fd) => {
          submit(createSkillAxis, withStudentId(fd));
        }}
        className={styles.addForm}
      >
        {studentId && <input type="hidden" name="studentId" value={studentId} />}
        <input
          type="text"
          name="label"
          placeholder={t.labelPlaceholder}
          className={styles.input}
          disabled={isPending}
        />
        <button type="submit" className={styles.addBtn} disabled={isPending}>
          {t.add}
        </button>
      </form>

      {/* Axis list */}
      {axes.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>{t.noAxes}</p>
          {!studentId && t.createDefaults && (
            <form action={createDefaultAxes}>
              <button type="submit" className={styles.defaultsBtn} disabled={isPending}>
                {t.createDefaults}
              </button>
            </form>
          )}
        </div>
      ) : (
        <ul className={styles.axisList}>
          {axes.map((axis) => (
            <li key={axis.id} className={`${styles.axisItem} ${!axis.isActive ? styles.axisItemInactive : ""}`}>
              <span className={styles.axisLabel}>{axis.label}</span>
              <div className={styles.axisActions}>
                <button
                  type="button"
                  role="switch"
                  aria-checked={axis.isActive}
                  aria-label={axis.isActive ? t.active : t.inactive}
                  className={`${styles.toggle} ${axis.isActive ? styles.toggleOn : ""}`}
                  disabled={isPending}
                  onClick={() => {
                    const fd = new FormData();
                    fd.append("axisId", axis.id);
                    if (studentId) fd.append("studentId", studentId);
                    submit(toggleSkillAxis, fd);
                  }}
                >
                  <span className={styles.toggleThumb} />
                </button>
                <form
                  action={(fd) => {
                    fd.append("axisId", axis.id);
                    if (studentId) fd.append("studentId", studentId);
                    submit(deleteSkillAxis, fd);
                  }}
                  style={{ display: "inline" }}
                >
                  <button type="submit" className={`${styles.actionBtn} ${styles.actionBtnDanger}`} disabled={isPending}>
                    {t.remove}
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
