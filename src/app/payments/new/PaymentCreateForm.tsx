"use client";

import { useActionState, useState, useRef } from "react";
import { createPayment } from "../actions";
import { initialPaymentFormState } from "../form-state";
import {
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from "@/lib/payment-options";
import styles from "./PaymentCreateForm.module.css";

type StudentOption = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
};

type ChargeOption = {
  id: string;
  userId: string;
  title: string;
  amount: number;
  currency: string;
  alreadyPaid: number;
};

type PaymentCreateFormProps = {
  students: StudentOption[];
  charges: ChargeOption[];
};

export default function PaymentCreateForm({
  students,
  charges,
}: PaymentCreateFormProps) {
  const [state, formAction, isPending] = useActionState(
    createPayment,
    initialPaymentFormState
  );

  const safeState = state ?? initialPaymentFormState;

  const [selectedUserId, setSelectedUserId] = useState(safeState.fields.userId);
  const [selectedChargeId, setSelectedChargeId] = useState<string | null>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  const studentCharges = charges.filter((c) => c.userId === selectedUserId);

  function handleChargeClick(charge: ChargeOption) {
    if (selectedChargeId === charge.id) {
      setSelectedChargeId(null);
    } else {
      setSelectedChargeId(charge.id);
      const remaining = charge.amount - charge.alreadyPaid;
      if (amountRef.current) {
        amountRef.current.value = remaining.toFixed(2);
      }
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Payments</p>
          <h1 className={styles.title}>Create payment</h1>
          <p className={styles.subtitle}>
            Record a payment received from a student.
          </p>
        </div>

        <form action={formAction} className={styles.form}>
          <div className={styles.grid}>
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label htmlFor="userId">Student</label>
              <select
                id="userId"
                name="userId"
                defaultValue={safeState.fields.userId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  setSelectedChargeId(null);
                }}
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

            {selectedUserId && studentCharges.length > 0 ? (
              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label>Allocate to charge (optional)</label>
                <div className={styles.chargeList}>
                  {studentCharges.map((charge) => {
                    const pct =
                      charge.amount > 0
                        ? Math.round(
                            (charge.alreadyPaid / charge.amount) * 100
                          )
                        : 0;
                    const remaining = charge.amount - charge.alreadyPaid;
                    const isSelected = selectedChargeId === charge.id;

                    return (
                      <button
                        key={charge.id}
                        type="button"
                        onClick={() => handleChargeClick(charge)}
                        className={`${styles.chargeCard} ${isSelected ? styles.chargeCardSelected : ""}`}
                      >
                        <div className={styles.chargeCardTop}>
                          <span className={styles.chargeName}>
                            {charge.title}
                          </span>
                          <span className={styles.chargeAmounts}>
                            {charge.alreadyPaid.toFixed(2)} /{" "}
                            {charge.amount.toFixed(2)} {charge.currency}
                          </span>
                        </div>
                        <div className={styles.chargeBar}>
                          <div
                            className={styles.chargeFill}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className={styles.chargeRemaining}>
                          {remaining.toFixed(2)} {charge.currency} remaining
                        </span>
                      </button>
                    );
                  })}
                </div>
                {selectedChargeId ? (
                  <input type="hidden" name="chargeId" value={selectedChargeId} />
                ) : null}
              </div>
            ) : null}

            <div className={styles.field}>
              <label htmlFor="amount">Amount</label>
              <input
                ref={amountRef}
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
              {isPending ? "Creating..." : "Create payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
