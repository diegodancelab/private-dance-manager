"use client";

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
      eyebrow="Charges"
      title="Create charge"
      subtitle="Issue a charge to a student for a lesson or service."
    >
      <form action={formAction} className={styles.form}>
        <div className={styles.grid}>
          <FormField
            label="Student"
            htmlFor="userId"
            error={safeState.errors.userId}
            fullWidth
          >
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
          </FormField>

          <FormField
            label="Related lesson"
            htmlFor="lessonId"
            error={safeState.errors.lessonId}
            fullWidth
          >
            <select
              id="lessonId"
              name="lessonId"
              defaultValue={safeState.fields.lessonId}
            >
              <option value="">No lesson linked</option>
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.title} - {formatDateTime(lesson.scheduledAt)}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Title"
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

          <FormField label="Description" htmlFor="description" fullWidth>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={safeState.fields.description}
            />
          </FormField>

          <FormField label="Type" htmlFor="type">
            <select
              id="type"
              name="type"
              defaultValue={safeState.fields.type}
            >
              {CHARGE_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Status" htmlFor="status">
            <select
              id="status"
              name="status"
              defaultValue={safeState.fields.status}
            >
              {CHARGE_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Amount"
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
            label="Currency"
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
            label="Due date"
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
          <Button type="submit" isPending={isPending} pendingLabel="Creating...">
            Create charge
          </Button>
        </div>
      </form>
    </FormCard>
  );
}
