"use client";

import { useActionState } from "react";
import { LESSON_TYPE_OPTIONS } from "@/lib/lesson-types";
import { createLesson } from "../actions";
import { initialLessonFormState } from "../form-state";
import styles from "./LessonCreateForm.module.css";

type TeacherOption = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
};

type LessonCreateFormProps = {
  teachers: TeacherOption[];
  defaultScheduledAt: string;
  defaultTeacherId: string;
};

export default function LessonCreateForm({
  teachers,
  defaultScheduledAt,
  defaultTeacherId,
}: LessonCreateFormProps) {
  const [state, formAction, isPending] = useActionState(
    createLesson,
    {
      ...initialLessonFormState,
      fields: {
        ...initialLessonFormState.fields,
        scheduledAt: defaultScheduledAt,
        teacherId: defaultTeacherId,
      },
    }
  );

  const safeState = state ?? initialLessonFormState;

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          defaultValue={safeState.fields.title}
        />
        {safeState.errors.title ? (
          <p className={styles.error}>{safeState.errors.title}</p>
        ) : null}
      </div>

      <div className={styles.field}>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          defaultValue={safeState.fields.description}
          rows={4}
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
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="teacherId">Teacher</label>
        <select
          id="teacherId"
          name="teacherId"
          defaultValue={safeState.fields.teacherId}
        >
          <option value="">Select a teacher</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.firstName} {teacher.lastName}
              {teacher.email ? ` - ${teacher.email}` : ""}
            </option>
          ))}
        </select>
        {safeState.errors.teacherId ? (
          <p className={styles.error}>{safeState.errors.teacherId}</p>
        ) : null}
      </div>

      {safeState.errors.form ? (
        <p className={styles.error}>{safeState.errors.form}</p>
      ) : null}

      <button type="submit" className={styles.button} disabled={isPending}>
        {isPending ? "Creating..." : "Create lesson"}
      </button>
    </form>
  );
}