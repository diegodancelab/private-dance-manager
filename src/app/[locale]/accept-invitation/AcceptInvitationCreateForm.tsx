"use client";

import { useActionState } from "react";
import { createAccountAndAccept } from "@/features/cross-enrollment/accept-actions";
import type { AcceptFormState } from "@/features/cross-enrollment/accept-actions";
import styles from "@/app/[locale]/login/LoginForm.module.css";

const initialState: AcceptFormState = { success: false, errors: {} };

export default function AcceptInvitationCreateForm({
  token,
  teacherFirstName,
}: {
  token: string;
  teacherFirstName: string;
}) {
  const [state, action, isPending] = useActionState(createAccountAndAccept, initialState);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.title}>Créer mon compte</h1>
        <p className={styles.subtitle}>
          {teacherFirstName} vous a invité(e) comme élève. Créez votre compte pour accepter.
        </p>
      </div>

      <form action={action} className={styles.form}>
        <input type="hidden" name="token" value={token} />

        {state.errors.form && (
          <p className={styles.errorBanner}>{state.errors.form}</p>
        )}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="firstName">Prénom</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            className={`${styles.input} ${state.errors.firstName ? styles.inputError : ""}`}
            disabled={isPending}
          />
          {state.errors.firstName && (
            <span className={styles.fieldError}>{state.errors.firstName}</span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="lastName">Nom</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            className={`${styles.input} ${state.errors.lastName ? styles.inputError : ""}`}
            disabled={isPending}
          />
          {state.errors.lastName && (
            <span className={styles.fieldError}>{state.errors.lastName}</span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">Mot de passe</label>
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
          <label className={styles.label} htmlFor="confirmPassword">Confirmer le mot de passe</label>
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
          {isPending ? "Création en cours…" : "Créer mon compte et accepter"}
        </button>
      </form>
    </div>
  );
}
