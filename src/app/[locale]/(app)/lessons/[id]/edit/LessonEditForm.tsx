"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { updateLesson } from "../../actions";
import type { LessonFormState } from "../../form-state";
import { LESSON_TYPE_OPTIONS } from "@/lib/lesson-types";
import styles from "./LessonEditForm.module.css";

type LessonEditFormProps = {
  initialState: LessonFormState;
};

export default function LessonEditForm({ initialState }: LessonEditFormProps) {
  const t = useTranslations("lessonsPage");
  const tLabels = useTranslations("labels");
  const [state, formAction, isPending] = useActionState(
    updateLesson,
    initialState
  );

  const safeState = state ?? initialState;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>{t("eyebrow")}</p>
          <h1 className={styles.title}>{t("editTitle")}</h1>
          <p className={styles.subtitle}>{t("editSubtitle")}</p>
        </div>

        <form action={formAction} className={styles.form}>
          <input type="hidden" name="id" value={safeState.fields.id} />

          <div className={styles.grid}>
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label htmlFor="title">{t("fieldTitle")}</label>
              <input
                id="title"
                name="title"
                type="text"
                defaultValue={safeState.fields.title}
                placeholder={t("titlePlaceholder")}
              />
              {safeState.errors.title ? (
                <p className={styles.error}>{safeState.errors.title}</p>
              ) : null}
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label htmlFor="description">{t("fieldDescription")}</label>
              <textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={safeState.fields.description}
                placeholder={t("descPlaceholder")}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="lessonType">{t("fieldType")}</label>
              <select
                id="lessonType"
                name="lessonType"
                defaultValue={safeState.fields.lessonType}
              >
                {LESSON_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {tLabels(option.value)}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="scheduledAt">{t("fieldScheduledAt")}</label>
              <input
                id="scheduledAt"
                name="scheduledAt"
                type="datetime-local"
                defaultValue={safeState.fields.scheduledAt}
              />
              {safeState.errors.scheduledAt ? (
                <p className={styles.error}>{safeState.errors.scheduledAt}</p>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="durationMin">{t("fieldDuration")}</label>
              <input
                id="durationMin"
                name="durationMin"
                type="number"
                min="1"
                defaultValue={safeState.fields.durationMin}
              />
              {safeState.errors.durationMin ? (
                <p className={styles.error}>{safeState.errors.durationMin}</p>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="priceAmount">{t("fieldPrice")}</label>
              <input
                id="priceAmount"
                name="priceAmount"
                type="number"
                min="0"
                step="0.01"
                defaultValue={safeState.fields.priceAmount}
                placeholder="80.00"
              />
              {safeState.errors.priceAmount ? (
                <p className={styles.error}>{safeState.errors.priceAmount}</p>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="location">{t("fieldLocation")}</label>
              <input
                id="location"
                name="location"
                type="text"
                defaultValue={safeState.fields.location}
                placeholder={t("locationPlaceholder")}
              />
            </div>
          </div>

          {safeState.errors.form ? (
            <div className={styles.formError}>{safeState.errors.form}</div>
          ) : null}

          <div className={styles.actions}>
            <button type="submit" className={styles.button} disabled={isPending}>
              {isPending ? "..." : t("update")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
