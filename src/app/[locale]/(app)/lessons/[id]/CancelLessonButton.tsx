"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { cancelLesson } from "../actions";
import styles from "./CancelLessonButton.module.css";

type Props = {
  lessonId: string;
};

export default function CancelLessonButton({ lessonId }: Props) {
  const t = useTranslations("lessonDetail");
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    const formData = new FormData();
    formData.set("lessonId", lessonId);
    startTransition(() => {
      cancelLesson(formData);
    });
  }

  if (!confirming) {
    return (
      <button
        type="button"
        className={styles.cancelButton}
        onClick={() => setConfirming(true)}
      >
        {t("cancelLesson")}
      </button>
    );
  }

  return (
    <div className={styles.confirmBox}>
      <p className={styles.confirmTitle}>{t("confirmCancelTitle")}</p>
      <p className={styles.confirmWarning}>{t("confirmCancelWarning")}</p>
      <div className={styles.confirmActions}>
        <button
          type="button"
          className={styles.confirmButton}
          onClick={handleConfirm}
          disabled={isPending}
        >
          {isPending ? "…" : t("confirmCancelConfirm")}
        </button>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => setConfirming(false)}
          disabled={isPending}
        >
          {t("confirmCancelBack")}
        </button>
      </div>
    </div>
  );
}
