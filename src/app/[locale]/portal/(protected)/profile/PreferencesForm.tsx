"use client";

import { useState } from "react";
import Toggle from "@/components/ui/Toggle/Toggle";
import styles from "./PortalProfile.module.css";

type Props = {
  labels: {
    prefEmailReminders: string;
    prefEmailRemindersDesc: string;
    prefAssessmentNotif: string;
    prefAssessmentNotifDesc: string;
    prefNewsletter: string;
    prefNewsletterDesc: string;
  };
};

export default function PreferencesForm({ labels }: Props) {
  const [emailReminders, setEmailReminders] = useState(true);
  const [assessmentNotif, setAssessmentNotif] = useState(true);
  const [newsletter, setNewsletter] = useState(false);

  return (
    <div className={styles.toggleList}>
      <div className={styles.toggleRow}>
        <Toggle
          checked={emailReminders}
          onChange={setEmailReminders}
          label={labels.prefEmailReminders}
          description={labels.prefEmailRemindersDesc}
        />
      </div>
      <div className={styles.toggleRow}>
        <Toggle
          checked={assessmentNotif}
          onChange={setAssessmentNotif}
          label={labels.prefAssessmentNotif}
          description={labels.prefAssessmentNotifDesc}
        />
      </div>
      <div style={{ display: "none" }}>
        <Toggle
          checked={newsletter}
          onChange={setNewsletter}
          label={labels.prefNewsletter}
          description={labels.prefNewsletterDesc}
        />
      </div>
    </div>
  );
}
