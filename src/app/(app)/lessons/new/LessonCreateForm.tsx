"use client";

import { useActionState, useState } from "react";
import { LESSON_TYPE_OPTIONS } from "@/lib/lesson-types";
import { createLesson } from "../actions";
import { initialLessonFormState } from "../form-state";
import FormCard from "@/components/ui/FormCard";
import FormField from "@/components/ui/FormField";
import Button from "@/components/ui/Button";
import styles from "./LessonCreateForm.module.css";

type StudentOption = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
};

type PackageOption = {
  id: string;
  name: string;
  remainingMinutes: number;
};

type LessonCreateFormProps = {
  students: StudentOption[];
  packagesByStudent: Record<string, PackageOption[]>;
  defaultScheduledAt: string;
  defaultStudentId: string;
};

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function LessonCreateForm({
  students,
  packagesByStudent,
  defaultScheduledAt,
  defaultStudentId,
}: LessonCreateFormProps) {
  const [state, formAction, isPending] = useActionState(createLesson, {
    ...initialLessonFormState,
    fields: {
      ...initialLessonFormState.fields,
      scheduledAt: defaultScheduledAt,
      studentId: defaultStudentId,
      bookingStatus: "CONFIRMED",
    },
  });

  const safeState = state ?? initialLessonFormState;

  const [selectedStudentId, setSelectedStudentId] = useState(defaultStudentId);
  const [billingMode, setBillingMode] = useState(safeState.fields.billingMode);

  const availablePackages = selectedStudentId
    ? (packagesByStudent[selectedStudentId] ?? [])
    : [];

  return (
    <FormCard
      eyebrow="Lessons"
      title="Create lesson"
      subtitle="Schedule a new lesson and optionally assign a student."
    >
      <form action={formAction} className={styles.form}>
        <div className={styles.grid}>
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
              placeholder="Private lesson"
            />
          </FormField>

          <FormField label="Description" htmlFor="description" fullWidth>
            <textarea
              id="description"
              name="description"
              defaultValue={safeState.fields.description}
              rows={4}
              placeholder="Add lesson notes or description"
            />
          </FormField>

          <FormField label="Lesson type" htmlFor="lessonType">
            <select
              id="lessonType"
              name="lessonType"
              defaultValue={safeState.fields.lessonType}
            >
              {LESSON_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Scheduled at"
            htmlFor="scheduledAt"
            error={safeState.errors.scheduledAt}
          >
            <input
              id="scheduledAt"
              name="scheduledAt"
              type="datetime-local"
              defaultValue={safeState.fields.scheduledAt}
            />
          </FormField>

          <FormField
            label="Duration (minutes)"
            htmlFor="durationMin"
            error={safeState.errors.durationMin}
          >
            <input
              id="durationMin"
              name="durationMin"
              type="number"
              min="1"
              defaultValue={safeState.fields.durationMin || "60"}
            />
          </FormField>

          <FormField
            label="Price amount"
            htmlFor="priceAmount"
            error={safeState.errors.priceAmount}
          >
            <input
              id="priceAmount"
              name="priceAmount"
              type="number"
              min="0"
              step="0.01"
              defaultValue={safeState.fields.priceAmount}
              placeholder="80.00"
            />
          </FormField>

          <FormField label="Location" htmlFor="location">
            <input
              id="location"
              name="location"
              type="text"
              defaultValue={safeState.fields.location}
              placeholder="Geneva"
            />
          </FormField>

          <FormField
            label="Student"
            htmlFor="studentId"
            error={safeState.errors.studentId}
          >
            <select
              id="studentId"
              name="studentId"
              value={selectedStudentId}
              onChange={(e) => {
                setSelectedStudentId(e.target.value);
                if (!e.target.value) setBillingMode("FREE");
              }}
            >
              <option value="">Unassigned lesson</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName}
                  {student.email ? ` - ${student.email}` : ""}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Booking status"
            htmlFor="bookingStatus"
            error={safeState.errors.bookingStatus}
          >
            <select
              id="bookingStatus"
              name="bookingStatus"
              defaultValue={safeState.fields.bookingStatus}
            >
              <option value="CONFIRMED">Confirmed</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELED">Canceled</option>
            </select>
          </FormField>

          {selectedStudentId ? (
            <FormField
              label="Billing"
              htmlFor="billingMode"
              error={safeState.errors.billingMode}
            >
              <select
                id="billingMode"
                name="billingMode"
                value={billingMode}
                onChange={(e) => setBillingMode(e.target.value as typeof billingMode)}
              >
                <option value="FREE">Free / assign later</option>
                <option value="UNIT">Unit charge (create invoice)</option>
                <option value="PACKAGE">
                  Deduct from package
                  {availablePackages.length === 0 ? " (no active package)" : ""}
                </option>
              </select>
            </FormField>
          ) : (
            <input type="hidden" name="billingMode" value="FREE" />
          )}

          {selectedStudentId && billingMode === "PACKAGE" && availablePackages.length > 0 ? (
            <FormField
              label="Package"
              htmlFor="packageId"
              error={safeState.errors.packageId}
            >
              <select
                id="packageId"
                name="packageId"
                defaultValue={safeState.fields.packageId}
              >
                {availablePackages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} ({formatMinutes(pkg.remainingMinutes)} left)
                  </option>
                ))}
              </select>
            </FormField>
          ) : null}
        </div>

        {safeState.errors.form ? (
          <div className={styles.formError}>{safeState.errors.form}</div>
        ) : null}

        <div className={styles.actions}>
          <Button
            type="submit"
            isPending={isPending}
            pendingLabel="Creating..."
          >
            Create lesson
          </Button>
        </div>
      </form>
    </FormCard>
  );
}
