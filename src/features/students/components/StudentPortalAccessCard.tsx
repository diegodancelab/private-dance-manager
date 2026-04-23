"use client";

import { useTransition, useActionState, useState } from "react";
import {
  activateStudentPortal,
  resendPortalInvitation,
  deactivateStudentPortal,
  addEmailAndActivatePortal,
} from "@/features/portal/activation-actions";
import type { AddEmailFormState } from "@/features/portal/activation-actions";
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
    addEmailAndActivate: string;
    emailLabel: string;
    emailPlaceholder: string;
    sendInvitation: string;
    cancel: string;
    confirmDeactivate: string;
    confirmDeactivateConfirm: string;
    confirmDeactivateBack: string;
  };
};

const initialEmailState: AddEmailFormState = { error: null };

export default function StudentPortalAccessCard({
  studentId,
  hasEmail,
  portalAccess,
  t,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [emailState, emailAction, isEmailPending] = useActionState(
    addEmailAndActivatePortal,
    initialEmailState
  );

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

  function handleDeactivateConfirm() {
    setShowDeactivateModal(false);
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

      {status === "inactive" && !hasEmail && !showEmailForm && (
        <p className={portalStyles.hint}>{t.emailRequired}</p>
      )}

      {status === "inactive" && !hasEmail && showEmailForm && (
        <form action={emailAction} className={portalStyles.emailForm}>
          <input type="hidden" name="studentId" value={studentId} />
          <label className={portalStyles.emailLabel} htmlFor="portal-email">
            {t.emailLabel}
          </label>
          <div className={portalStyles.emailRow}>
            <input
              id="portal-email"
              name="email"
              type="email"
              placeholder={t.emailPlaceholder}
              className={portalStyles.emailInput}
              autoComplete="email"
              disabled={isEmailPending}
            />
            <button
              type="submit"
              className={portalStyles.actionBtn}
              disabled={isEmailPending}
            >
              {isEmailPending ? "…" : t.sendInvitation}
            </button>
            <button
              type="button"
              className={portalStyles.cancelBtn}
              onClick={() => setShowEmailForm(false)}
              disabled={isEmailPending}
            >
              {t.cancel}
            </button>
          </div>
          {emailState.error && (
            <p className={portalStyles.emailError}>{emailState.error}</p>
          )}
        </form>
      )}

      <div className={portalStyles.actions}>
        {status === "inactive" && !hasEmail && !showEmailForm && (
          <button
            type="button"
            className={portalStyles.actionBtn}
            onClick={() => setShowEmailForm(true)}
          >
            {t.addEmailAndActivate}
          </button>
        )}

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
            onClick={() => setShowDeactivateModal(true)}
            disabled={isPending}
          >
            {isPending ? "…" : t.deactivate}
          </button>
        )}
      </div>

      {showDeactivateModal && (
        <div className={portalStyles.backdrop} onClick={() => !isPending && setShowDeactivateModal(false)}>
          <div className={portalStyles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <p className={portalStyles.modalTitle}>{t.confirmDeactivate}</p>
            <div className={portalStyles.modalActions}>
              <button
                type="button"
                className={portalStyles.modalBack}
                onClick={() => setShowDeactivateModal(false)}
                disabled={isPending}
              >
                {t.confirmDeactivateBack}
              </button>
              <button
                type="button"
                className={portalStyles.modalConfirm}
                onClick={handleDeactivateConfirm}
                disabled={isPending}
              >
                {isPending ? "…" : t.confirmDeactivateConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
