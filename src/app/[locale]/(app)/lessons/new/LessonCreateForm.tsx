"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("lessonsPage");
  const tLabels = useTranslations("labels");
  const tCommon = useTranslations("common");

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
      eyebrow={t("eyebrow")}
      title={t("createTitle")}
      subtitle={t("createSubtitle")}
    >
      <form action={formAction} className={styles.form}>
        <div className={styles.grid}>
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
              placeholder={t("titlePlaceholder")}
            />
          </FormField>

          <FormField label={t("fieldDescription")} htmlFor="description" fullWidth>
            <textarea
              id="description"
              name="description"
              defaultValue={safeState.fields.description}
              rows={4}
              placeholder={t("descPlaceholder")}
            />
          </FormField>

          <FormField label={t("fieldType")} htmlFor="lessonType">
            <select
              id="lessonType"
              name="lessonType"
              defaultValue={safeState.fields.lessonType}
            >
              {LESSON_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {tLabels(option.value)}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label={t("fieldScheduledAt")}
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
            label={t("fieldDuration")}
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
            label={t("fieldPrice")}
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

          <FormField label={t("fieldLocation")} htmlFor="location">
            <input
              id="location"
              name="location"
              type="text"
              defaultValue={safeState.fields.location}
              placeholder={t("locationPlaceholder")}
            />
          </FormField>

          <FormField
            label={t("fieldStudent")}
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
              <option value="">{t("unassignedLesson")}</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName}
                  {student.email ? ` - ${student.email}` : ""}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label={t("fieldBookingStatus")}
            htmlFor="bookingStatus"
            error={safeState.errors.bookingStatus}
          >
            <select
              id="bookingStatus"
              name="bookingStatus"
              defaultValue={safeState.fields.bookingStatus}
            >
              <option value="CONFIRMED">{tLabels("CONFIRMED")}</option>
              <option value="PENDING">{tLabels("PENDING")}</option>
              <option value="CANCELED">{tLabels("CANCELED")}</option>
            </select>
          </FormField>

          {selectedStudentId ? (
            <FormField
              label={t("fieldBilling")}
              htmlFor="billingMode"
              error={safeState.errors.billingMode}
            >
              <select
                id="billingMode"
                name="billingMode"
                value={billingMode}
                onChange={(e) => setBillingMode(e.target.value as typeof billingMode)}
              >
                <option value="FREE">{t("billingFree")}</option>
                <option value="UNIT">{t("billingUnit")}</option>
                <option value="PACKAGE" disabled={availablePackages.length === 0}>
                  {availablePackages.length === 0
                    ? t("billingPackageNoActive")
                    : t("billingPackage")}
                </option>
              </select>
            </FormField>
          ) : (
            <input type="hidden" name="billingMode" value="FREE" />
          )}

          {selectedStudentId && billingMode === "PACKAGE" && availablePackages.length > 0 ? (
            <FormField
              label={t("fieldPackage")}
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
                    {pkg.name} ({formatMinutes(pkg.remainingMinutes)} {tCommon("remaining")})
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
            pendingLabel="..."
          >
            {t("create")}
          </Button>
        </div>
      </form>
    </FormCard>
  );
}
