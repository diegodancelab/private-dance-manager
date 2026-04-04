"use client";

import { useActionState } from "react";
import { updateCharge } from "../../actions";
import type { ChargeFormState } from "../../form-state";
import {
  CHARGE_STATUS_OPTIONS,
  CHARGE_TYPE_OPTIONS,
} from "@/lib/charge-options";
import { formatDateTime } from "@/lib/format";
import styles from "./ChargeEditForm.module.css";

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

type ChargeEditFormProps = {
  initialState: ChargeFormState;
  students: StudentOption[];
  lessons: LessonOption[];
};


export default function ChargeEditForm({
  initialState,
  students,
  lessons,
}: ChargeEditFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateCharge,
    initialState
  );

  const safeState = state ?? initialState;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Charges</p>
          <h1 className={styles.title}>Edit charge</h1>
          <p className={styles.subtitle}>
            Update the charge details, amount and payment status.
          </p>
        </div>

        <form action={formAction} className={styles.form}>
          <input type="hidden" name="id" value={safeState.fields.id} />

          <div className={styles.grid}>
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label htmlFor="userId">Student</label>
              <select
                id="userId"
                name="userId"
                defaultValue={safeState.fields.userId}
              >
                <option value="">Select a student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName}
                    {student.email ? ` - ${student.email}` : ""}
                    {!student.email && student.phone
                      ? ` - ${student.phone}`
                      : ""}
                  </option>
                ))}
              </select>
              {safeState.errors.userId ? (
                <p className={styles.error}>{safeState.errors.userId}</p>
              ) : null}
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label htmlFor="lessonId">Related lesson</label>
              <select
                id="lessonId"
                name="lessonId"
                defaultValue={safeState.fields.lessonId}
              >
                <option value="">No lesson linked</option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title} - {formatDateTime(lesson.scheduledAt)}
                  </option>
                ))}
              </select>
              {safeState.errors.lessonId ? (
                <p className={styles.error}>{safeState.errors.lessonId}</p>
              ) : null}
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
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

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={safeState.fields.description}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="type">Type</label>
              <select
                id="type"
                name="type"
                defaultValue={safeState.fields.type}
              >
                {CHARGE_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                defaultValue={safeState.fields.status}
              >
                {CHARGE_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
          </div>

          {safeState.errors.form ? (
            <div className={styles.formError}>{safeState.errors.form}</div>
          ) : null}

          <div className={styles.actions}>
            <button type="submit" className={styles.button} disabled={isPending}>
              {isPending ? "Updating..." : "Update charge"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
