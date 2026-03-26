"use client";

import { useActionState } from "react";
import { updateStudent } from "../../actions";
import type { StudentFormState } from "../../form-state";
import styles from "./StudentEditForm.module.css";

type StudentEditFormProps = {
  initialState: StudentFormState;
};

export default function StudentEditForm({
  initialState,
}: StudentEditFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateStudent,
    initialState
  );

  const safeState = state ?? initialState;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Students</p>
          <h1 className={styles.title}>Edit student</h1>
          <p className={styles.subtitle}>
            Update the student&apos;s profile and contact details.
          </p>
        </div>

        <form action={formAction} className={styles.form}>
          <input type="hidden" name="id" value={safeState.fields.id} />

          <div className={styles.grid}>
            <div className={styles.field}>
              <label htmlFor="firstName">First name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                defaultValue={safeState.fields.firstName}
              />
              {safeState.errors.firstName ? (
                <p className={styles.error}>{safeState.errors.firstName}</p>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="lastName">Last name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                defaultValue={safeState.fields.lastName}
              />
              {safeState.errors.lastName ? (
                <p className={styles.error}>{safeState.errors.lastName}</p>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={safeState.fields.email}
              />
              {safeState.errors.email ? (
                <p className={styles.error}>{safeState.errors.email}</p>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                name="phone"
                type="text"
                defaultValue={safeState.fields.phone}
              />
            </div>
          </div>

          <p className={styles.helper}>
            At least one contact method is required: email or phone.
          </p>

          {safeState.errors.form ? (
            <div className={styles.formError}>{safeState.errors.form}</div>
          ) : null}

          <div className={styles.actions}>
            <button type="submit" className={styles.button} disabled={isPending}>
              {isPending ? "Updating..." : "Update student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
