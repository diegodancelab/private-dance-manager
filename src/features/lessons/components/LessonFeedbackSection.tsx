"use client";

import { useActionState, useState } from "react";
import {
  saveLessonFeedback,
  saveSkillAssessment,
  type LessonFeedbackFormState,
  type SkillAssessmentFormState,
} from "@/features/lessons/feedback-actions";
import styles from "./LessonFeedbackSection.module.css";

type Axis = { id: string; label: string; order: number };

type ExistingFeedback = {
  videoUrl: string | null;
  studentFeedback: string | null;
  internalNotes: string | null;
};

type ExistingAssessment = {
  id: string;
  scores: { axisId: string; score: number }[];
  notes: string | null;
};

type ParticipantFeedbackFormProps = {
  lessonId: string;
  studentId: string;
  studentName: string;
  axes: Axis[];
  existingFeedback: ExistingFeedback | null;
  existingAssessment: ExistingAssessment | null;
  t: Record<string, string>;
};

function ParticipantFeedbackForm({
  lessonId,
  studentId,
  studentName,
  axes,
  existingFeedback,
  existingAssessment,
  t,
}: ParticipantFeedbackFormProps) {
  const feedbackInit: LessonFeedbackFormState = { success: false, errors: {} };
  const assessmentInit: SkillAssessmentFormState = { success: false, errors: {} };

  const [feedbackState, feedbackAction, feedbackPending] = useActionState(
    saveLessonFeedback,
    feedbackInit
  );
  const [assessmentState, assessmentAction, assessmentPending] = useActionState(
    saveSkillAssessment,
    assessmentInit
  );

  const [scores, setScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    existingAssessment?.scores.forEach(({ axisId, score }) => {
      initial[axisId] = score;
    });
    return initial;
  });

  return (
    <div className={styles.participantBlock}>
      <h3 className={styles.participantTitle}>
        {t.participantTitle.replace("{name}", studentName)}
      </h3>

      {/* Feedback form */}
      <form action={feedbackAction} className={styles.form}>
        <input type="hidden" name="lessonId" value={lessonId} />
        <input type="hidden" name="studentId" value={studentId} />

        {feedbackState.errors.form && (
          <p className={styles.errorBanner}>{feedbackState.errors.form}</p>
        )}

        <div className={styles.field}>
          <label className={styles.label}>{t.videoUrl}</label>
          <input
            type="url"
            name="videoUrl"
            defaultValue={existingFeedback?.videoUrl ?? ""}
            placeholder={t.videoUrlPlaceholder}
            className={styles.input}
            disabled={feedbackPending}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>{t.studentFeedback}</label>
          <textarea
            name="studentFeedback"
            defaultValue={existingFeedback?.studentFeedback ?? ""}
            placeholder={t.studentFeedbackPlaceholder}
            className={styles.textarea}
            rows={3}
            disabled={feedbackPending}
          />
        </div>

        <div className={styles.field}>
          <label className={`${styles.label} ${styles.labelInternal}`}>
            {t.internalNotes}
          </label>
          <textarea
            name="internalNotes"
            defaultValue={existingFeedback?.internalNotes ?? ""}
            placeholder={t.internalNotesPlaceholder}
            className={`${styles.textarea} ${styles.textareaInternal}`}
            rows={2}
            disabled={feedbackPending}
          />
        </div>

        <button
          type="submit"
          className={styles.saveBtn}
          disabled={feedbackPending}
        >
          {feedbackPending
            ? t.saving
            : feedbackState.success
              ? `✓ ${t.saved}`
              : t.save}
        </button>
      </form>

      {/* Skill assessment form */}
      <div className={styles.assessmentBlock}>
        <h4 className={styles.assessmentTitle}>{t.skillAssessment}</h4>

        {axes.length === 0 ? (
          <p className={styles.emptyText}>{t.noAxesConfigured}</p>
        ) : (
          <form action={assessmentAction} className={styles.form}>
            <input type="hidden" name="lessonId" value={lessonId} />
            <input type="hidden" name="studentId" value={studentId} />
            {existingAssessment && (
              <input
                type="hidden"
                name="assessmentId"
                value={existingAssessment.id}
              />
            )}

            {assessmentState.errors.form && (
              <p className={styles.errorBanner}>{assessmentState.errors.form}</p>
            )}

            <div className={styles.axesGrid}>
              {axes.map((axis) => (
                <div key={axis.id} className={styles.axisRow}>
                  <label className={styles.axisLabel}>{axis.label}</label>
                  <input
                    type="hidden"
                    name={`score_${axis.id}`}
                    value={scores[axis.id] ?? ""}
                  />
                  <div className={styles.scoreButtons}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={`${styles.scoreBtn} ${scores[axis.id] === n ? styles.scoreBtnActive : ""}`}
                        onClick={() =>
                          setScores((prev) => ({ ...prev, [axis.id]: n }))
                        }
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              className={styles.saveBtn}
              disabled={assessmentPending}
            >
              {assessmentPending
                ? t.saving
                : assessmentState.success
                  ? `✓ ${t.saved}`
                  : t.save}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

type Props = {
  lessonId: string;
  participants: Array<{
    studentId: string;
    studentName: string;
    existingFeedback: ExistingFeedback | null;
    existingAssessment: ExistingAssessment | null;
  }>;
  axes: Axis[];
  t: Record<string, string>;
};

export default function LessonFeedbackSection({
  lessonId,
  participants,
  axes,
  t,
}: Props) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>{t.sectionTitle}</h2>
      {participants.map((p) => (
        <ParticipantFeedbackForm
          key={p.studentId}
          lessonId={lessonId}
          studentId={p.studentId}
          studentName={p.studentName}
          axes={axes}
          existingFeedback={p.existingFeedback}
          existingAssessment={p.existingAssessment}
          t={t}
        />
      ))}
    </div>
  );
}
