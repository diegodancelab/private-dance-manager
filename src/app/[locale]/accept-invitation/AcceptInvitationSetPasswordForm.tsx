"use client";

import { useActionState } from "react";
import { setPasswordAndAccept } from "@/features/cross-enrollment/accept-actions";
import type { AcceptFormState } from "@/features/cross-enrollment/accept-actions";
import styles from "@/app/[locale]/login/LoginForm.module.css";

const initialState: AcceptFormState = { success: false, errors: {} };

export default function AcceptInvitationSetPasswordForm({
  token,
  teacherFirstName,
  firstName,
}: {
  token: string;
  teacherFirstName: string;
  firstName: string;
}) {
  const [state, action, isPending] = useActionState(setPasswordAndAccept, initialState);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.title}>Bonjour {firstName} !</h1>
        <p className={styles.subtitle}>
          <strong>{teacherFirstName}</strong> vous invite à rejoindre son espace en tant
          qu&apos;élève. Créez votre mot de passe pour activer votre accès.
        </p>
      </div>

      <form action={action} className={styles.form}>
        <input type="hidden" name="token" value={token} />

        {state.errors.form && (
          <p className={styles.errorBanner}>{state.errors.form}</p>
        )}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            className={`${styles.input} ${state.errors.password ? styles.inputError : ""}`}
            disabled={isPending}
          />
          {state.errors.password && (
            <span className={styles.fieldError}>{state.errors.password}</span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="confirmPassword">
            Confirmer le mot de passe
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            className={`${styles.input} ${state.errors.confirmPassword ? styles.inputError : ""}`}
            disabled={isPending}
          />
          {state.errors.confirmPassword && (
            <span className={styles.fieldError}>{state.errors.confirmPassword}</span>
          )}
        </div>

        <button type="submit" className={styles.submit} disabled={isPending}>
          {isPending ? "Activation en cours…" : "Activer mon accès"}
        </button>
      </form>
    </div>
  );
}
