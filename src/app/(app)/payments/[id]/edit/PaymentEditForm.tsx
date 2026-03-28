"use client";

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
  const [state, formAction, isPending] = useActionState(
    updatePayment,
    initialState
  );

  const safeState = state ?? initialState;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Payments</p>
          <h1 className={styles.title}>Edit payment</h1>
          <p className={styles.subtitle}>
            Update the payment details and status.
          </p>
        </div>

        <form action={formAction} className={styles.form}>
          <input type="hidden" name="id" value={safeState.fields.id} />

          <div className={styles.grid}>
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label htmlFor="userId">Student</label>
              <select
                id="userId"
                name="userId"
                defaultValue={safeState.fields.userId}
              >
                <option value="">Select a student</option>
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
              <label htmlFor="amount">Amount</label>
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
              <label htmlFor="currency">Currency</label>
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
              <label htmlFor="method">Method</label>
              <select
                id="method"
                name="method"
                defaultValue={safeState.fields.method}
              >
                <option value="">No method specified</option>
                {PAYMENT_METHOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                defaultValue={safeState.fields.status}
              >
                {PAYMENT_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label htmlFor="paidAt">Paid at</label>
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
              <label htmlFor="note">Note</label>
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
              {isPending ? "Updating..." : "Update payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
