"use client";

import { useActionState } from "react";
import { setupPortalPassword, type SetupFormState } from "@/features/portal/setup-actions";
import loginStyles from "@/app/[locale]/login/LoginForm.module.css";

const initialState: SetupFormState = { success: false, errors: {} };

type Props = {
  token: string;
  title: string;
  subtitle: string;
  labelPassword: string;
  labelConfirm: string;
  submitLabel: string;
};

export default function PortalSetupForm({
  token,
  title,
  subtitle,
  labelPassword,
  labelConfirm,
  submitLabel,
}: Props) {
  const [state, action, pending] = useActionState(setupPortalPassword, initialState);

  return (
    <div className={loginStyles.card}>
      <div className={loginStyles.header}>
        <h1 className={loginStyles.title}>{title}</h1>
        <p className={loginStyles.subtitle}>{subtitle}</p>
      </div>

      <form action={action} className={loginStyles.form}>
        <input type="hidden" name="token" value={token} />

        {state.errors.form && (
          <p className={loginStyles.errorBanner}>{state.errors.form}</p>
        )}

        <div className={loginStyles.field}>
          <label htmlFor="password" className={loginStyles.label}>
            {labelPassword}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            className={`${loginStyles.input} ${state.errors.password ? loginStyles.inputError : ""}`}
            disabled={pending}
          />
          {state.errors.password && (
            <span className={loginStyles.fieldError}>{state.errors.password}</span>
          )}
        </div>

        <div className={loginStyles.field}>
          <label htmlFor="confirmPassword" className={loginStyles.label}>
            {labelConfirm}
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            className={`${loginStyles.input} ${state.errors.confirmPassword ? loginStyles.inputError : ""}`}
            disabled={pending}
          />
          {state.errors.confirmPassword && (
            <span className={loginStyles.fieldError}>{state.errors.confirmPassword}</span>
          )}
        </div>

        <button type="submit" className={loginStyles.submit} disabled={pending}>
          {pending ? "…" : submitLabel}
        </button>
      </form>
    </div>
  );
}
