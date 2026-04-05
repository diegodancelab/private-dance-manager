"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { createStudent } from "../actions";
import { initialStudentFormState } from "../form-state";
import styles from "./StudentCreateForm.module.css";

export default function StudentCreateForm() {
  const t = useTranslations("students");
  const [state, formAction, isPending] = useActionState(
    createStudent,
    initialStudentFormState
  );

  const safeState = state ?? initialStudentFormState;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>{t("eyebrow")}</p>
          <h1 className={styles.title}>{t("createTitle")}</h1>
          <p className={styles.subtitle}>{t("createSubtitle")}</p>
        </div>

        <form action={formAction} className={styles.form}>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label htmlFor="firstName">{t("firstName")}</label>
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
              <label htmlFor="lastName">{t("lastName")}</label>
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
              <label htmlFor="email">{t("email")}</label>
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
              <label htmlFor="phone">{t("phone")}</label>
              <input
                id="phone"
                name="phone"
                type="text"
                defaultValue={safeState.fields.phone}
              />
            </div>
          </div>

          <p className={styles.helper}>{t("contactHelper")}</p>

          {safeState.errors.form ? (
            <div className={styles.formError}>{safeState.errors.form}</div>
          ) : null}

          <div className={styles.actions}>
            <button type="submit" className={styles.button} disabled={isPending}>
              {isPending ? "..." : t("create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
