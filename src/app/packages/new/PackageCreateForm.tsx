"use client";

import { useActionState } from "react";
import { createPackage } from "../actions";
import { initialPackageFormState } from "../form-state";
import styles from "./PackageCreateForm.module.css";

type StudentOption = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
};

type PackageCreateFormProps = {
  students: StudentOption[];
};

export default function PackageCreateForm({
  students,
}: PackageCreateFormProps) {
  const [state, formAction, isPending] = useActionState(
    createPackage,
    initialPackageFormState
  );

  const safeState = state ?? initialPackageFormState;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Packages</p>
          <h1 className={styles.title}>Create package</h1>
          <p className={styles.subtitle}>
            Create a prepaid hour package for a student.
          </p>
        </div>

        <form action={formAction} className={styles.form}>
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
              <label htmlFor="name">Package name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. 10-hour pack"
                defaultValue={safeState.fields.name}
              />
              {safeState.errors.name ? (
                <p className={styles.error}>{safeState.errors.name}</p>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="totalHours">Total hours</label>
              <input
                id="totalHours"
                name="totalHours"
                type="number"
                min="1"
                step="1"
                placeholder="10"
                defaultValue={safeState.fields.totalHours}
              />
              {safeState.errors.totalHours ? (
                <p className={styles.error}>{safeState.errors.totalHours}</p>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="expiresAt">Expires at (optional)</label>
              <input
                id="expiresAt"
                name="expiresAt"
                type="date"
                defaultValue={safeState.fields.expiresAt}
              />
              {safeState.errors.expiresAt ? (
                <p className={styles.error}>{safeState.errors.expiresAt}</p>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="amount">Amount</label>
              <input
                id="amount"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="200.00"
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
                defaultValue={safeState.fields.currency || "CHF"}
              />
              {safeState.errors.currency ? (
                <p className={styles.error}>{safeState.errors.currency}</p>
              ) : null}
            </div>
          </div>

          {safeState.errors.form ? (
            <div className={styles.formError}>{safeState.errors.form}</div>
          ) : null}

          <div className={styles.actions}>
            <button type="submit" className={styles.button} disabled={isPending}>
              {isPending ? "Creating..." : "Create package"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
