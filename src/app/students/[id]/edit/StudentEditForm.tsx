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
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="id" value={safeState.fields.id} />

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

      <p className={styles.helper}>
        At least one contact method is required: email or phone.
      </p>

      {safeState.errors.form ? (
        <p className={styles.error}>{safeState.errors.form}</p>
      ) : null}

      <button type="submit" className={styles.button} disabled={isPending}>
        {isPending ? "Updating..." : "Update student"}
      </button>
    </form>
  );
}