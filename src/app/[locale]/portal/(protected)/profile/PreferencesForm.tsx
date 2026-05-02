"use client";

import { useState, useTransition } from "react";
import Toggle from "@/components/ui/Toggle/Toggle";
import { updateNotificationPreferences } from "./profile-actions";
import styles from "./PortalProfile.module.css";

type Props = {
  defaultValues: {
    notifLessonReminder: boolean;
    notifAssessment: boolean;
  };
  labels: {
    prefEmailReminders: string;
    prefEmailRemindersDesc: string;
    prefAssessmentNotif: string;
    prefAssessmentNotifDesc: string;
    prefNewsletter: string;
    prefNewsletterDesc: string;
  };
};

export default function PreferencesForm({ defaultValues, labels }: Props) {
  const [notifLessonReminder, setNotifLessonReminder] = useState(defaultValues.notifLessonReminder);
  const [notifAssessment, setNotifAssessment] = useState(defaultValues.notifAssessment);
  const [, startTransition] = useTransition();

  function handleChange(field: "notifLessonReminder" | "notifAssessment", value: boolean) {
    if (field === "notifLessonReminder") setNotifLessonReminder(value);
    else setNotifAssessment(value);

    startTransition(() => {
      updateNotificationPreferences({
        notifLessonReminder: field === "notifLessonReminder" ? value : notifLessonReminder,
        notifAssessment: field === "notifAssessment" ? value : notifAssessment,
      });
    });
  }

  return (
    <div className={styles.toggleList}>
      <div className={styles.toggleRow}>
        <Toggle
          checked={notifLessonReminder}
          onChange={(v) => handleChange("notifLessonReminder", v)}
          label={labels.prefEmailReminders}
          description={labels.prefEmailRemindersDesc}
        />
      </div>
      <div className={styles.toggleRow}>
        <Toggle
          checked={notifAssessment}
          onChange={(v) => handleChange("notifAssessment", v)}
          label={labels.prefAssessmentNotif}
          description={labels.prefAssessmentNotifDesc}
        />
      </div>
      <div style={{ display: "none" }}>
        <Toggle
          checked={false}
          onChange={() => {}}
          label={labels.prefNewsletter}
          description={labels.prefNewsletterDesc}
        />
      </div>
    </div>
  );
}
