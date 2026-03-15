"use client";

import { useActionState } from "react";
import { createCharge } from "../actions";
import { initialChargeFormState } from "../form-state";
import {
  CHARGE_STATUS_OPTIONS,
  CHARGE_TYPE_OPTIONS,
} from "@/lib/charge-options";
import styles from "./ChargeCreateForm.module.css";

type StudentOption = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
};

type LessonOption = {
  id: string;
  title: string;
  scheduledAt: Date;
};

type ChargeCreateFormProps = {
  students: StudentOption[];
  lessons: LessonOption[];
};

function formatLessonOption(date: Date): string {
  return new Intl.DateTimeFormat("fr-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default function ChargeCreateForm({
  students,
  lessons,
}: ChargeCreateFormProps) {
  const [state, formAction, isPending] = useActionState(
    createCharge,
    initialChargeFormState
  );

  const safeState = state ?? initialChargeFormState;

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="userId">Student</label>
        <select id="userId" name="userId" defaultValue={safeState.fields.userId}>
          <option value="">Select a student</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.firstName} {student.lastName}
              {student.email ? ` - ${student.email}` : ""}
              {!student.email && student.phone ? ` - ${student.phone}` : ""}
            </option>
          ))}
        </select>
        {safeState.errors.userId ? (
          <p className={styles.error}>{safeState.errors.userId}</p>
        ) : null}
      </div>

      <div className={styles.field}>
        <label htmlFor="lessonId">Related lesson</label>
        <select
          id="lessonId"
          name="lessonId"
          defaultValue={safeState.fields.lessonId}
        >
          <option value="">No lesson linked</option>
          {lessons.map((lesson) => (
            <option key={lesson.id} value={lesson.id}>
              {lesson.title} - {formatLessonOption(lesson.scheduledAt)}
            </option>
          ))}
        </select>
        {safeState.errors.lessonId ? (
          <p className={styles.error}>{safeState.errors.lessonId}</p>
        ) : null}
      </div>

      <div className={styles.field}>
        <label htmlFor="type">Type</label>
        <select id="type" name="type" defaultValue={safeState.fields.type}>
          {CHARGE_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

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
          rows={4}
          defaultValue={safeState.fields.description}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="amount">Amount</label>
        <input
          id="amount"
          name="amount"
          type="number"
          min="0"
          step="0.01"
          defaultValue={safeState.fields.amount}
        />
        {safeState.errors.amount ? (
          <p className={styles.error}>{safeState.errors.amount}</p>
        ) : null}
      </div>

      <div className={styles.field}>
        <label htmlFor="currency">Currency</label>
        <input
          id="currency"
          name="currency"
          type="text"
          defaultValue={safeState.fields.currency}
        />
        {safeState.errors.currency ? (
          <p className={styles.error}>{safeState.errors.currency}</p>
        ) : null}
      </div>

      <div className={styles.field}>
        <label htmlFor="status">Status</label>
        <select id="status" name="status" defaultValue={safeState.fields.status}>
          {CHARGE_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="dueAt">Due date</label>
        <input
          id="dueAt"
          name="dueAt"
          type="date"
          defaultValue={safeState.fields.dueAt}
        />
        {safeState.errors.dueAt ? (
          <p className={styles.error}>{safeState.errors.dueAt}</p>
        ) : null}
      </div>

      {safeState.errors.form ? (
        <p className={styles.error}>{safeState.errors.form}</p>
      ) : null}

      <button type="submit" className={styles.button} disabled={isPending}>
        {isPending ? "Creating..." : "Create charge"}
      </button>
    </form>
  );
}