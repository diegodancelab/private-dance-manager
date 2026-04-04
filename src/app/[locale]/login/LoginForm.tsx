"use client";

import { useActionState } from "react";
import { login, type LoginFormState } from "@/lib/auth/actions";
import styles from "./LoginForm.module.css";

const initialState: LoginFormState = { success: false, errors: {} };

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, initialState);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.title}>Private Dance Manager</h1>
        <p className={styles.subtitle}>Sign in to your account</p>
      </div>

      <form action={action} className={styles.form}>
        {state.errors.form && (
          <p className={styles.errorBanner}>{state.errors.form}</p>
        )}

        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className={`${styles.input} ${state.errors.email ? styles.inputError : ""}`}
            disabled={pending}
          />
          {state.errors.email && (
            <span className={styles.fieldError}>{state.errors.email}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className={`${styles.input} ${state.errors.password ? styles.inputError : ""}`}
            disabled={pending}
          />
          {state.errors.password && (
            <span className={styles.fieldError}>{state.errors.password}</span>
          )}
        </div>

        <button type="submit" className={styles.submit} disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
