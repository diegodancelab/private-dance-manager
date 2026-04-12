"use client";

import { useTransition } from "react";
import {
  activateStudentPortal,
  resendPortalInvitation,
  deactivateStudentPortal,
} from "@/features/portal/activation-actions";
import type { PortalAccessInfo } from "@/features/students/queries/getStudentDetail";
import styles from "./StudentDetail.module.css";
import portalStyles from "./StudentPortalAccessCard.module.css";

type Props = {
  studentId: string;
  hasEmail: boolean;
  portalAccess: PortalAccessInfo;
  t: {
    cardTitle: string;
    statusInactive: string;
    statusPending: string;
    statusActive: string;
    activatedOn: string;
    activate: string;
    resend: string;
    deactivate: string;
    emailRequired: string;
    confirmDeactivate: string;
    confirmDeactivateConfirm: string;
    confirmDeactivateBack: string;
  };
};

export default function StudentPortalAccessCard({
  studentId,
  hasEmail,
  portalAccess,
  t,
}: Props) {
  const [isPending, startTransition] = useTransition();

  function submitWithStudentId(
    action: (formData: FormData) => Promise<void>
  ): () => void {
    return () => {
      startTransition(async () => {
        const fd = new FormData();
        fd.append("studentId", studentId);
        await action(fd);
      });
    };
  }

  function handleDeactivate() {
    if (!confirm(t.confirmDeactivate)) return;
    submitWithStudentId(deactivateStudentPortal)();
  }

  const { status } = portalAccess;

  const statusLabel =
    status === "active"
      ? t.statusActive
      : status === "pending"
        ? t.statusPending
        : t.statusInactive;

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t.cardTitle}</h2>
        <span className={portalStyles.statusBadge} data-status={status}>
          {statusLabel}
        </span>
      </div>

      {status === "active" && t.activatedOn && (
        <p className={portalStyles.hint}>{t.activatedOn}</p>
      )}

      {status === "inactive" && !hasEmail && (
        <p className={portalStyles.hint}>{t.emailRequired}</p>
      )}

      <div className={portalStyles.actions}>
        {status === "inactive" && hasEmail && (
          <button
            type="button"
            className={portalStyles.actionBtn}
            onClick={submitWithStudentId(activateStudentPortal)}
            disabled={isPending}
          >
            {isPending ? "…" : t.activate}
          </button>
        )}

        {status === "pending" && (
          <button
            type="button"
            className={portalStyles.actionBtn}
            onClick={submitWithStudentId(resendPortalInvitation)}
            disabled={isPending}
          >
            {isPending ? "…" : t.resend}
          </button>
        )}

        {status === "active" && (
          <button
            type="button"
            className={portalStyles.actionBtnDanger}
            onClick={handleDeactivate}
            disabled={isPending}
          >
            {isPending ? "…" : t.deactivate}
          </button>
        )}
      </div>
    </div>
  );
}
