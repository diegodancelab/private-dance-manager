"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { cancelLesson } from "@/features/lessons/actions";
import styles from "./CancelLessonButton.module.css";

type Props = {
  lessonId: string;
  lessonTitle: string;
  lessonDate: string;
  studentNames: string[];
};

export default function CancelLessonButton({ lessonId, lessonTitle, lessonDate, studentNames }: Props) {
  const t = useTranslations("lessonDetail");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    const formData = new FormData();
    formData.set("lessonId", lessonId);
    startTransition(() => {
      cancelLesson(formData);
    });
  }

  return (
    <>
      <button type="button" className={styles.cancelButton} onClick={() => setOpen(true)}>
        {t("cancelLesson")}
      </button>

      {open && (
        <div className={styles.backdrop} onClick={() => !isPending && setOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h2 className={styles.modalTitle}>{t("confirmCancelTitle")}</h2>

            <div className={styles.details}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t("confirmCancelLesson")}</span>
                <span className={styles.detailValue}>{lessonTitle}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t("confirmCancelDate")}</span>
                <span className={styles.detailValue}>{lessonDate}</span>
              </div>
              {studentNames.length > 0 && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>{t("confirmCancelStudent")}</span>
                  <span className={styles.detailValue}>{studentNames.join(", ")}</span>
                </div>
              )}
            </div>

            <p className={styles.warning}>{t("confirmCancelWarning")}</p>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.backButton}
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                {t("confirmCancelBack")}
              </button>
              <button
                type="button"
                className={styles.confirmButton}
                onClick={handleConfirm}
                disabled={isPending}
              >
                {isPending ? "…" : t("confirmCancelConfirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
