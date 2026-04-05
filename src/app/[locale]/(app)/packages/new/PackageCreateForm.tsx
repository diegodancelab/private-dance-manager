"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { createPackage } from "../actions";
import { initialPackageFormState } from "../form-state";
import FormCard from "@/components/ui/FormCard";
import FormField from "@/components/ui/FormField";
import Button from "@/components/ui/Button";
import styles from "./PackageCreateForm.module.css";

type StudentOption = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
};

type PackageCreateFormProps = {
  students: StudentOption[];
  defaultUserId?: string;
};

export default function PackageCreateForm({
  students,
  defaultUserId = "",
}: PackageCreateFormProps) {
  const t = useTranslations("packagesPage");
  const tCommon = useTranslations("common");

  const [state, formAction, isPending] = useActionState(createPackage, {
    ...initialPackageFormState,
    fields: {
      ...initialPackageFormState.fields,
      userId: defaultUserId,
    },
  });

  const safeState = state ?? initialPackageFormState;

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
          </FormField>

          <FormField
            label={t("fieldName")}
            htmlFor="name"
            error={safeState.errors.name}
            fullWidth
          >
            <input
              id="name"
              name="name"
              type="text"
              placeholder={t("namePlaceholder")}
              defaultValue={safeState.fields.name}
            />
          </FormField>

          <FormField
            label={t("fieldTotalHours")}
            htmlFor="totalHours"
            error={safeState.errors.totalHours}
          >
            <input
              id="totalHours"
              name="totalHours"
              type="number"
              min="1"
              step="1"
              placeholder="10"
              defaultValue={safeState.fields.totalHours}
            />
          </FormField>

          <FormField
            label={t("fieldExpiresAt")}
            htmlFor="expiresAt"
            error={safeState.errors.expiresAt}
          >
            <input
              id="expiresAt"
              name="expiresAt"
              type="date"
              defaultValue={safeState.fields.expiresAt}
            />
          </FormField>

          <FormField
            label={t("fieldAmount")}
            htmlFor="amount"
            error={safeState.errors.amount}
          >
            <input
              id="amount"
              name="amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="200.00"
              defaultValue={safeState.fields.amount}
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
              defaultValue={safeState.fields.currency || "CHF"}
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
