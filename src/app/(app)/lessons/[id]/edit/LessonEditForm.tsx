"use client";

import { useActionState } from "react";
import { updateLesson } from "../../actions";
import type { LessonFormState } from "../../form-state";
import { LESSON_TYPE_OPTIONS } from "@/lib/lesson-types";
import styles from "./LessonEditForm.module.css";

type LessonEditFormProps = {
  initialState: LessonFormState;
};

export default function LessonEditForm({ initialState }: LessonEditFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateLesson,
    initialState
  );

  const safeState = state ?? initialState;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Lessons</p>
          <h1 className={styles.title}>Edit lesson</h1>
          <p className={styles.subtitle}>
            Update the lesson information, schedule and pricing.
          </p>
        </div>

        <form action={formAction} className={styles.form}>
          <input type="hidden" name="id" value={safeState.fields.id} />

          <div className={styles.grid}>
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label htmlFor="title">Title</label>
              <input
                id="title"
                name="title"
                type="text"
                defaultValue={safeState.fields.title}
                placeholder="Private lesson"
              />
              {safeState.errors.title ? (
                <p className={styles.error}>{safeState.errors.title}</p>
              ) : null}
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={safeState.fields.description}
                placeholder="Add lesson notes or description"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="lessonType">Lesson type</label>
              <select
                id="lessonType"
                name="lessonType"
                defaultValue={safeState.fields.lessonType}
              >
                {LESSON_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="scheduledAt">Scheduled at</label>
              <input
                id="scheduledAt"
                name="scheduledAt"
                type="datetime-local"
                defaultValue={safeState.fields.scheduledAt}
              />
              {safeState.errors.scheduledAt ? (
                <p className={styles.error}>{safeState.errors.scheduledAt}</p>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="durationMin">Duration (minutes)</label>
              <input
                id="durationMin"
                name="durationMin"
                type="number"
                min="1"
                defaultValue={safeState.fields.durationMin}
              />
              {safeState.errors.durationMin ? (
                <p className={styles.error}>{safeState.errors.durationMin}</p>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="priceAmount">Price amount</label>
              <input
                id="priceAmount"
                name="priceAmount"
                type="number"
                min="0"
                step="0.01"
                defaultValue={safeState.fields.priceAmount}
                placeholder="80.00"
              />
              {safeState.errors.priceAmount ? (
                <p className={styles.error}>{safeState.errors.priceAmount}</p>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="location">Location</label>
              <input
                id="location"
                name="location"
                type="text"
                defaultValue={safeState.fields.location}
                placeholder="Geneva"
              />
            </div>

          </div>

          {safeState.errors.form ? (
            <div className={styles.formError}>{safeState.errors.form}</div>
          ) : null}

          <div className={styles.actions}>
            <button type="submit" className={styles.button} disabled={isPending}>
              {isPending ? "Updating..." : "Update lesson"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}