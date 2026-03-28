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

type StudentOption = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
};

type LessonCreateFormProps = {
  teachers: TeacherOption[];
  students: StudentOption[];
  defaultScheduledAt: string;
  defaultTeacherId: string;
  defaultStudentId: string;
};

export default function LessonCreateForm({
  teachers,
  students,
  defaultScheduledAt,
  defaultTeacherId,
  defaultStudentId,
}: LessonCreateFormProps) {
  const [state, formAction, isPending] = useActionState(createLesson, {
    ...initialLessonFormState,
    fields: {
      ...initialLessonFormState.fields,
      scheduledAt: defaultScheduledAt,
      teacherId: defaultTeacherId,
      studentId: defaultStudentId,
      bookingStatus: "CONFIRMED",
    },
  });

  const safeState = state ?? initialLessonFormState;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Lessons</p>
          <h1 className={styles.title}>Create lesson</h1>
          <p className={styles.subtitle}>
            Schedule a new lesson, assign a teacher and a student.
          </p>
        </div>

        <form action={formAction} className={styles.form}>
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
                defaultValue={safeState.fields.description}
                rows={4}
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
                defaultValue={safeState.fields.durationMin || "60"}
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

            <div className={styles.field}>
              <label htmlFor="studentId">Student</label>
              <select
                id="studentId"
                name="studentId"
                defaultValue={safeState.fields.studentId}
              >
                <option value="">Unassigned lesson</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName}
                    {student.email ? ` - ${student.email}` : ""}
                  </option>
                ))}
              </select>
              {safeState.errors.studentId ? (
                <p className={styles.error}>{safeState.errors.studentId}</p>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="bookingStatus">Booking status</label>
              <select
                id="bookingStatus"
                name="bookingStatus"
                defaultValue={safeState.fields.bookingStatus}
              >
                <option value="CONFIRMED">Confirmed</option>
                <option value="PENDING">Pending</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              {safeState.errors.bookingStatus ? (
                <p className={styles.error}>{safeState.errors.bookingStatus}</p>
              ) : null}
            </div>
          </div>

          {safeState.errors.form ? (
            <div className={styles.formError}>{safeState.errors.form}</div>
          ) : null}

          <div className={styles.actions}>
            <button type="submit" className={styles.button} disabled={isPending}>
              {isPending ? "Creating..." : "Create lesson"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
