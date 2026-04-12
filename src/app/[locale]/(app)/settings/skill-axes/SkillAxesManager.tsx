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
  t: {
    addAxis: string;
    labelPlaceholder: string;
    add: string;
    remove: string;
    noAxes: string;
    createDefaults: string;
    active: string;
    inactive: string;
  };
};

export default function SkillAxesManager({ axes, t }: Props) {
  const [isPending, startTransition] = useTransition();

  function submit(action: (fd: FormData) => Promise<void>, fd: FormData) {
    startTransition(() => action(fd));
  }

  return (
    <div className={styles.container}>
      {/* Add new axis */}
      <form
        action={createSkillAxis}
        className={styles.addForm}
      >
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
          <form action={createDefaultAxes}>
            <button type="submit" className={styles.defaultsBtn} disabled={isPending}>
              {t.createDefaults}
            </button>
          </form>
        </div>
      ) : (
        <ul className={styles.axisList}>
          {axes.map((axis) => (
            <li key={axis.id} className={`${styles.axisItem} ${!axis.isActive ? styles.axisItemInactive : ""}`}>
              <span className={styles.axisLabel}>{axis.label}</span>
              <div className={styles.axisActions}>
                <span className={styles.statusTag}>
                  {axis.isActive ? t.active : t.inactive}
                </span>
                <form
                  action={(fd) => {
                    fd.append("axisId", axis.id);
                    submit(toggleSkillAxis, fd);
                  }}
                  style={{ display: "inline" }}
                >
                  <button type="submit" className={styles.actionBtn} disabled={isPending}>
                    {axis.isActive ? t.inactive : t.active}
                  </button>
                </form>
                <form
                  action={(fd) => {
                    fd.append("axisId", axis.id);
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
