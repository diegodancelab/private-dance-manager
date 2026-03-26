"use client";

import { useActionState } from "react";
import { updatePackage } from "../../actions";
import type { PackageFormState } from "../../form-state";
import styles from "./PackageEditForm.module.css";

type PackageEditFormProps = {
  initialState: PackageFormState;
};

export default function PackageEditForm({ initialState }: PackageEditFormProps) {
  const [state, formAction, isPending] = useActionState(
    updatePackage,
    initialState
  );

  const safeState = state ?? initialState;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Packages</p>
          <h1 className={styles.title}>Edit package</h1>
          <p className={styles.subtitle}>
            Update the package name, total hours, or expiry date.
          </p>
        </div>

        <form action={formAction} className={styles.form}>
          <input type="hidden" name="id" value={safeState.fields.id} />

          <div className={styles.grid}>
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label htmlFor="name">Package name</label>
              <input
                id="name"
                name="name"
                type="text"
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
          </div>

          {safeState.errors.form ? (
            <div className={styles.formError}>{safeState.errors.form}</div>
          ) : null}

          <div className={styles.actions}>
            <button type="submit" className={styles.button} disabled={isPending}>
              {isPending ? "Updating..." : "Update package"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
