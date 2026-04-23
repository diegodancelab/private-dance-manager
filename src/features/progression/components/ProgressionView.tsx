"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { TeacherAssessment, TeacherAxis } from "@/features/progression/queries";
import { deleteProgressionAssessment } from "@/features/progression/actions";
import ComparisonRadar from "./ComparisonRadar";
import AssessmentForm from "./AssessmentForm";
import styles from "./ProgressionView.module.css";

type Props = {
  studentId: string;
  assessments: TeacherAssessment[];
  axes: TeacherAxis[];
  t: {
    newAssessment: string;
    noAssessments: string;
    assessmentOfTemplate: string;
    avgScore: string;
    referenceLabel: string;
    currentLabel: string;
    delete: string;
    confirmDelete: string;
    notes: string;
    formTitle: string;
    formNotes: string;
    formNotesPlaceholder: string;
    formSave: string;
    formCancel: string;
    noAxes: string;
    configureAxes: string;
  };
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-CH", { day: "numeric", month: "long", year: "numeric" });
}

export default function ProgressionView({ studentId, assessments, axes, t }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(
    assessments.length >= 2 ? assessments[1].id : null
  );

  const handleClose = useCallback(() => setShowForm(false), []);

  const latest = assessments[0] ?? null;
  const reference = referenceId ? assessments.find((a) => a.id === referenceId) ?? null : null;

  async function handleDelete(assessmentId: string) {
    if (!confirm(t.confirmDelete)) return;
    const fd = new FormData();
    fd.append("assessmentId", assessmentId);
    fd.append("studentId", studentId);
    await deleteProgressionAssessment(fd);
    router.refresh();
    if (referenceId === assessmentId) setReferenceId(null);
  }

  return (
    <div className={styles.root}>
      <div className={styles.topBar}>
        <button className={styles.newBtn} onClick={() => setShowForm((v) => !v)}>
          {showForm ? t.formCancel : `+ ${t.newAssessment}`}
        </button>
      </div>

      {showForm && (
        <AssessmentForm
          studentId={studentId}
          axes={axes}
          onClose={handleClose}
          t={{
            title: t.formTitle,
            notes: t.formNotes,
            notesPlaceholder: t.formNotesPlaceholder,
            save: t.formSave,
            cancel: t.formCancel,
            noAxes: t.noAxes,
            configureAxes: t.configureAxes,
          }}
        />
      )}

      {assessments.length === 0 ? (
        <p className={styles.empty}>{t.noAssessments}</p>
      ) : (
        <div className={styles.content}>
          {/* Radar card */}
          <div className={styles.radarCard}>
            {latest && latest.scores.length >= 3 && (
              <ComparisonRadar
                current={latest.scores.map((s) => ({ label: s.axisLabel, score: s.score }))}
                reference={
                  reference && reference.scores.length >= 3
                    ? reference.scores.map((s) => ({ label: s.axisLabel, score: s.score }))
                    : undefined
                }
                size={300}
              />
            )}
            {/* Legend */}
            <div className={styles.legend}>
              <span className={styles.legendCurrent} />
              <span className={styles.legendLabel}>{t.currentLabel}</span>
              {reference && (
                <>
                  <span className={styles.legendReference} />
                  <span className={styles.legendLabel}>{t.referenceLabel}</span>
                </>
              )}
            </div>
          </div>

          {/* Timeline */}
          <ul className={styles.timeline}>
            {assessments.map((a, idx) => {
              const isCurrent = idx === 0;
              const isReference = a.id === referenceId;
              return (
                <li
                  key={a.id}
                  className={`${styles.timelineItem} ${isCurrent ? styles.itemCurrent : ""} ${isReference ? styles.itemReference : ""}`}
                >
                  <div className={styles.itemHeader}>
                    <span className={styles.itemDate}>{t.assessmentOfTemplate.replace("{date}", formatDate(a.createdAt))}</span>
                    {isCurrent && (
                      <span className={styles.badge + " " + styles.badgeCurrent}>{t.currentLabel}</span>
                    )}
                    {isReference && !isCurrent && (
                      <span className={styles.badge + " " + styles.badgeRef}>{t.referenceLabel}</span>
                    )}
                  </div>

                  <div className={styles.itemMeta}>
                    <span className={styles.avgScore}>
                      {t.avgScore} : <strong>{a.avgScore}</strong>/10
                    </span>
                  </div>

                  {a.scores.map((s) => (
                    <div key={s.axisId} className={styles.scoreRow}>
                      <span className={styles.scoreLabel}>{s.axisLabel}</span>
                      <div className={styles.scoreBar}>
                        <div className={styles.scoreBarFill} style={{ width: `${s.score * 10}%` }} />
                      </div>
                      <span className={styles.scoreVal}>{s.score}</span>
                    </div>
                  ))}

                  {a.notes && <p className={styles.notes}>{a.notes}</p>}

                  <div className={styles.itemActions}>
                    {!isCurrent && (
                      <button
                        className={`${styles.refBtn} ${isReference ? styles.refBtnActive : ""}`}
                        onClick={() => setReferenceId(isReference ? null : a.id)}
                      >
                        {isReference ? "✓ " : ""}{t.referenceLabel}
                      </button>
                    )}
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(a.id)}
                    >
                      {t.delete}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
