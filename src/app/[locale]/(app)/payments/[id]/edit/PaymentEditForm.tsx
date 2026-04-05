"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { updatePayment } from "../../actions";
import type { PaymentFormState } from "../../form-state";
import {
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from "@/lib/payment-options";
import styles from "./PaymentEditForm.module.css";

type StudentOption = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
};

type PaymentEditFormProps = {
  initialState: PaymentFormState;
  students: StudentOption[];
};

export default function PaymentEditForm({
  initialState,
  students,
}: PaymentEditFormProps) {
  const t = useTranslations("paymentsPage");
  const tLabels = useTranslations("labels");
  const tCommon = useTranslations("common");

  const [state, formAction, isPending] = useActionState(
    updatePayment,
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
              <label htmlFor="userId">{t("fieldStudent")}</label>
              <select
                id="userId"
                name="userId"
                defaultValue={safeState.fields.userId}
              >
                <option value="">{tCommon("selectStudent")}</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName}
                    {student.email ? ` - ${student.email}` : ""}
                    {!student.email && student.phone
                      ? ` - ${student.phone}`
                      : ""}
                  </option>
                ))}
              </select>
              {safeState.errors.userId ? (
                <p className={styles.error}>{safeState.errors.userId}</p>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="amount">{t("fieldAmount")}</label>
              <input
                id="amount"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                defaultValue={safeState.fields.amount}
              />
              {safeState.errors.amount ? (
                <p className={styles.error}>{safeState.errors.amount}</p>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="currency">{t("fieldCurrency")}</label>
              <input
                id="currency"
                name="currency"
                type="text"
                defaultValue={safeState.fields.currency}
              />
              {safeState.errors.currency ? (
                <p className={styles.error}>{safeState.errors.currency}</p>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="method">{t("fieldMethod")}</label>
              <select
                id="method"
                name="method"
                defaultValue={safeState.fields.method}
              >
                <option value="">{tCommon("noMethodSpecified")}</option>
                {PAYMENT_METHOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {tLabels(option.value)}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="status">{t("fieldStatus")}</label>
              <select
                id="status"
                name="status"
                defaultValue={safeState.fields.status}
              >
                {PAYMENT_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {tLabels(option.value)}
                  </option>
                ))}
              </select>
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label htmlFor="paidAt">{t("fieldPaidAt")}</label>
              <input
                id="paidAt"
                name="paidAt"
                type="datetime-local"
                defaultValue={safeState.fields.paidAt}
              />
              {safeState.errors.paidAt ? (
                <p className={styles.error}>{safeState.errors.paidAt}</p>
              ) : null}
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label htmlFor="note">{t("fieldNote")}</label>
              <textarea
                id="note"
                name="note"
                rows={4}
                defaultValue={safeState.fields.note}
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
