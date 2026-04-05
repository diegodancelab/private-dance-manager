"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { createCharge } from "../actions";
import { initialChargeFormState } from "../form-state";
import {
  CHARGE_STATUS_OPTIONS,
  CHARGE_TYPE_OPTIONS,
} from "@/lib/charge-options";
import { formatDateTime } from "@/lib/format";
import FormCard from "@/components/ui/FormCard";
import FormField from "@/components/ui/FormField";
import Button from "@/components/ui/Button";
import styles from "./ChargeCreateForm.module.css";

type StudentOption = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
};

type LessonOption = {
  id: string;
  title: string;
  scheduledAt: Date;
};

type ChargeCreateFormProps = {
  students: StudentOption[];
  lessons: LessonOption[];
  defaultUserId?: string;
};

export default function ChargeCreateForm({
  students,
  lessons,
  defaultUserId = "",
}: ChargeCreateFormProps) {
  const t = useTranslations("chargesPage");
  const tLabels = useTranslations("labels");
  const tCommon = useTranslations("common");

  const [state, formAction, isPending] = useActionState(createCharge, {
    ...initialChargeFormState,
    fields: {
      ...initialChargeFormState.fields,
      userId: defaultUserId,
    },
  });

  const safeState = state ?? initialChargeFormState;

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
            label={t("fieldRelatedLesson")}
            htmlFor="lessonId"
            error={safeState.errors.lessonId}
            fullWidth
          >
            <select
              id="lessonId"
              name="lessonId"
              defaultValue={safeState.fields.lessonId}
            >
              <option value="">{t("noLessonLinked")}</option>
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.title} - {formatDateTime(lesson.scheduledAt)}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label={t("fieldTitle")}
            htmlFor="title"
            error={safeState.errors.title}
            fullWidth
          >
            <input
              id="title"
              name="title"
              type="text"
              defaultValue={safeState.fields.title}
            />
          </FormField>

          <FormField label={t("fieldDescription")} htmlFor="description" fullWidth>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={safeState.fields.description}
            />
          </FormField>

          <FormField label={t("fieldType")} htmlFor="type">
            <select
              id="type"
              name="type"
              defaultValue={safeState.fields.type}
            >
              {CHARGE_TYPE_OPTIONS.map((option) => (
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
              {CHARGE_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {tLabels(option.value)}
                </option>
              ))}
            </select>
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
              defaultValue={safeState.fields.currency}
            />
          </FormField>

          <FormField
            label={t("fieldDueDate")}
            htmlFor="dueAt"
            error={safeState.errors.dueAt}
          >
            <input
              id="dueAt"
              name="dueAt"
              type="date"
              defaultValue={safeState.fields.dueAt}
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
