"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createProgressionAssessment, AssessmentFormState } from "@/features/progression/actions";
import type { TeacherAxis } from "@/features/progression/queries";
import styles from "./AssessmentForm.module.css";

type Props = {
  studentId: string;
  axes: TeacherAxis[];
  onClose: () => void;
  t: {
    title: string;
    notes: string;
    notesPlaceholder: string;
    save: string;
    cancel: string;
    noAxes: string;
    configureAxes: string;
  };
};

const initial: AssessmentFormState = { success: false, error: null };

export default function AssessmentForm({ studentId, axes, onClose, t }: Props) {
  const router = useRouter();
  const [state, action, isPending] = useActionState(createProgressionAssessment, initial);
  const [scores, setScores] = useState<Record<string, number>>(() =>
    Object.fromEntries(axes.map((a) => [a.id, 5]))
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
      onClose();
    }
  }, [state.success, router, onClose]);

  if (axes.length === 0) {
    return (
      <div className={styles.form}>
        <p className={styles.noAxes}>{t.noAxes}</p>
        <Link href="/settings/skill-axes" className={styles.configLink}>
          {t.configureAxes}
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className={styles.form}>
      <input type="hidden" name="studentId" value={studentId} />

      <div className={styles.axesList}>
        {axes.map((axis) => (
          <div key={axis.id} className={styles.axisRow}>
            <span className={styles.axisLabel}>{axis.label}</span>
            <input type="hidden" name={`score_${axis.id}`} value={scores[axis.id] ?? 5} />
            <div className={styles.scoreButtons}>
              {Array.from({ length: 10 }, (_, idx) => {
                const val = idx + 1;
                const selected = scores[axis.id] === val;
                return (
                  <button
                    key={val}
                    type="button"
                    className={`${styles.scoreBtn} ${selected ? styles.scoreBtnActive : ""}`}
                    onClick={() => setScores((prev) => ({ ...prev, [axis.id]: val }))}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.notesRow}>
        <label className={styles.notesLabel} htmlFor="assessment-notes">
          {t.notes}
        </label>
        <textarea
          id="assessment-notes"
          name="notes"
          className={styles.notesInput}
          placeholder={t.notesPlaceholder}
          rows={3}
        />
      </div>

      {state.error && <p className={styles.error}>{state.error}</p>}

      <div className={styles.actions}>
        <button type="button" onClick={onClose} className={styles.cancelBtn} disabled={isPending}>
          {t.cancel}
        </button>
        <button type="submit" className={styles.saveBtn} disabled={isPending}>
          {t.save}
        </button>
      </div>
    </form>
  );
}
