"use client";

import { useActionState } from "react";
import { updateStudentProfile, type ProfileFormState } from "@/features/portal/actions/updateStudentProfile";
import styles from "./PortalProfile.module.css";

const initial: ProfileFormState = { ok: false };

type Props = {
  defaultValues: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  labels: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    save: string;
    cancel: string;
    saving: string;
    saved: string;
  };
};

export default function ProfileForm({ defaultValues, labels }: Props) {
  const [state, action, isPending] = useActionState(updateStudentProfile, initial);

  return (
    <form action={action} className={styles.infoForm}>
      {state.ok && (
        <p className={styles.successMsg}>{labels.saved}</p>
      )}

      <div className={styles.fieldGrid}>
        <div className={styles.field}>
          <label className={styles.label}>{labels.firstName}</label>
          <input
            name="firstName"
            defaultValue={defaultValues.firstName}
            className={styles.input}
            required
          />
          {state.errors?.firstName && (
            <span className={styles.fieldError}>{state.errors.firstName[0]}</span>
          )}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{labels.lastName}</label>
          <input
            name="lastName"
            defaultValue={defaultValues.lastName}
            className={styles.input}
            required
          />
          {state.errors?.lastName && (
            <span className={styles.fieldError}>{state.errors.lastName[0]}</span>
          )}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>{labels.email}</label>
        <input
          name="email"
          type="email"
          defaultValue={defaultValues.email}
          className={styles.input}
          required
        />
        {state.errors?.email && (
          <span className={styles.fieldError}>{state.errors.email[0]}</span>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>{labels.phone}</label>
        <input
          name="phone"
          type="tel"
          defaultValue={defaultValues.phone}
          className={styles.input}
        />
      </div>

      <div className={styles.formActions}>
        <button type="submit" disabled={isPending} className={styles.saveBtn}>
          {isPending ? labels.saving : labels.save}
        </button>
      </div>
    </form>
  );
}
