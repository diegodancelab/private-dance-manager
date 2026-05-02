import { sendEmailSafe, FROM_NOTIFICATIONS } from "./emailEnv";

export async function sendAssessmentNotification({
  studentEmail,
  studentFirstName,
  teacherFirstName,
  progressionUrl,
}: {
  studentEmail: string;
  studentFirstName: string;
  teacherFirstName: string;
  progressionUrl: string;
}): Promise<void> {
  const greeting = `Bonjour ${studentFirstName},`;

  await sendEmailSafe({
    from: FROM_NOTIFICATIONS,
    to: studentEmail,
    subject: `${teacherFirstName} a publié un nouveau bilan`,
    html: `
      <p>${greeting}</p>
      <p>
        <strong>${teacherFirstName}</strong> vient de publier un nouveau bilan de progression
        sur <strong>DanceDesk</strong>. Tu peux le consulter dès maintenant sur ton portail.
      </p>
      <p style="margin: 24px 0;">
        <a
          href="${progressionUrl}"
          style="background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;"
        >
          Voir mon bilan
        </a>
      </p>
      <p style="color:#6b7280;font-size:12px;">
        DanceDesk — notification automatique · Tu peux désactiver ces emails depuis ton profil.
      </p>
    `,
  });
}
