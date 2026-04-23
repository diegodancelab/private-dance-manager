"use client";

import { useActionState, useState } from "react";
import { inviteStudent } from "@/features/cross-enrollment/invitation-actions";
import type { InviteFormState } from "@/features/cross-enrollment/invitation-actions";
import styles from "./InviteStudentForm.module.css";

const initialState: InviteFormState = { success: false, message: "", errors: {} };

export default function InviteStudentForm() {
  const [open, setOpen] = useState(false);
  const [state, action, isPending] = useActionState(inviteStudent, initialState);

  // Close form on success after a short delay (let user see the success message).
  if (state.success && open) {
    setTimeout(() => setOpen(false), 1500);
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Annuler" : "+ Inviter un élève"}
      </button>

      {open && (
        <div className={styles.formCard}>
          <p className={styles.formTitle}>Inviter un élève par email</p>
          <p className={styles.formDesc}>
            Un email d&apos;invitation sera envoyé. La relation ne deviendra active
            qu&apos;après acceptation.
          </p>

          <form action={action} className={styles.form}>
            {state.errors.form && (
              <p className={styles.error}>{state.errors.form}</p>
            )}
            {state.success && (
              <p className={styles.success}>{state.message}</p>
            )}

            <div className={styles.row}>
              <input
                name="email"
                type="email"
                placeholder="Email de l'élève"
                className={`${styles.input} ${state.errors.email ? styles.inputError : ""}`}
                disabled={isPending || state.success}
                autoComplete="email"
              />
              {state.errors.email && (
                <span className={styles.fieldError}>{state.errors.email}</span>
              )}
              <button
                type="submit"
                className={styles.submit}
                disabled={isPending || state.success}
              >
                {isPending ? "Envoi…" : "Envoyer l'invitation"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
