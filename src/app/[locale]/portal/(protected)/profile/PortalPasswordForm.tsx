"use client";

import { useActionState } from "react";
import { changePortalPassword } from "@/features/portal/profile-actions";
import styles from "./PortalProfile.module.css";

const initialState = { success: false, error: null };

export default function PortalPasswordForm({
  labels,
}: {
  labels: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    save: string;
    passwordUpdated: string;
  };
}) {
  const [state, action, isPending] = useActionState(
    changePortalPassword,
    initialState
  );

  return (
    <form action={action} className={styles.passwordForm}>
      {state.success && (
        <p className={styles.successMsg}>{labels.passwordUpdated}</p>
      )}
      {state.error && <p className={styles.errorMsg}>{state.error}</p>}

      <div className={styles.field}>
        <label className={styles.label}>{labels.currentPassword}</label>
        <input
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          className={styles.input}
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>{labels.newPassword}</label>
        <input
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          className={styles.input}
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>{labels.confirmPassword}</label>
        <input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          className={styles.input}
          required
        />
      </div>

      <button type="submit" disabled={isPending} className={styles.saveBtn}>
        {labels.save}
      </button>
    </form>
  );
}
