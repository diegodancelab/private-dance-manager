"use client";

import { useTranslations } from "next-intl";
import { useActionState, useState, useRef } from "react";
import { createPayment } from "../actions";
import { initialPaymentFormState } from "../form-state";
import {
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from "@/lib/payment-options";
import FormCard from "@/components/ui/FormCard";
import FormField from "@/components/ui/FormField";
import Button from "@/components/ui/Button";
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

type Preselect = {
  chargeId?: string;
  userId?: string;
  amount?: string;
};

type PaymentCreateFormProps = {
  students: StudentOption[];
  charges: ChargeOption[];
  preselect?: Preselect;
};

export default function PaymentCreateForm({
  students,
  charges,
  preselect,
}: PaymentCreateFormProps) {
  const t = useTranslations("paymentsPage");
  const tLabels = useTranslations("labels");
  const tCommon = useTranslations("common");

  const [state, formAction, isPending] = useActionState(
    createPayment,
    initialPaymentFormState
  );

  const safeState = state ?? initialPaymentFormState;

  const [selectedUserId, setSelectedUserId] = useState(
    preselect?.userId ?? safeState.fields.userId
  );
  const [selectedChargeId, setSelectedChargeId] = useState<string | null>(
    preselect?.chargeId ?? null
  );
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
    <FormCard
      eyebrow={t("eyebrow")}
      title={t("createTitle")}
      subtitle={t("createSubtitle")}
    >
      <form action={formAction} className={styles.form}>
        <div className={styles.grid}>
          <FormField
            label={t("fieldStudent")}
            htmlFor="userId"
            error={safeState.errors.userId}
            fullWidth
          >
            <select
              id="userId"
              name="userId"
              defaultValue={preselect?.userId ?? safeState.fields.userId}
              onChange={(e) => {
                setSelectedUserId(e.target.value);
                setSelectedChargeId(null);
              }}
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
          </FormField>

          {selectedUserId && studentCharges.length > 0 ? (
            <FormField label={t("fieldAllocate")} fullWidth>
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
                        {remaining.toFixed(2)} {charge.currency} {tCommon("remaining")}
                      </span>
                    </button>
                  );
                })}
              </div>
              {selectedChargeId ? (
                <input type="hidden" name="chargeId" value={selectedChargeId} />
              ) : null}
            </FormField>
          ) : null}

          <FormField
            label={t("fieldAmount")}
            htmlFor="amount"
            error={safeState.errors.amount}
          >
            <input
              ref={amountRef}
              id="amount"
              name="amount"
              type="number"
              min="0"
              step="0.01"
              defaultValue={preselect?.amount ?? safeState.fields.amount}
            />
          </FormField>

          <FormField
            label={t("fieldCurrency")}
            htmlFor="currency"
            error={safeState.errors.currency}
          >
            <input
              id="currency"
              name="currency"
              type="text"
              defaultValue={safeState.fields.currency}
            />
          </FormField>

          <FormField label={t("fieldMethod")} htmlFor="method">
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
          </FormField>

          <FormField label={t("fieldStatus")} htmlFor="status">
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
          </FormField>

          <FormField
            label={t("fieldPaidAt")}
            htmlFor="paidAt"
            error={safeState.errors.paidAt}
            fullWidth
          >
            <input
              id="paidAt"
              name="paidAt"
              type="datetime-local"
              defaultValue={safeState.fields.paidAt}
            />
          </FormField>

          <FormField label={t("fieldNote")} htmlFor="note" fullWidth>
            <textarea
              id="note"
              name="note"
              rows={4}
              defaultValue={safeState.fields.note}
            />
          </FormField>
        </div>

        {safeState.errors.form ? (
          <div className={styles.formError}>{safeState.errors.form}</div>
        ) : null}

        <div className={styles.actions}>
          <Button type="submit" isPending={isPending} pendingLabel="...">
            {t("create")}
          </Button>
        </div>
      </form>
    </FormCard>
  );
}
