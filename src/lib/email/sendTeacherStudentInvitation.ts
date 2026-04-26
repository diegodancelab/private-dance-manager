import { sendEmailSafe } from "./emailEnv";

export async function sendTeacherStudentInvitation({
  recipientEmail,
  recipientFirstName,
  teacherFirstName,
  invitationUrl,
  isExistingUser,
}: {
  recipientEmail: string;
  recipientFirstName?: string;
  teacherFirstName: string;
  invitationUrl: string;
  isExistingUser: boolean;
}): Promise<void> {
  const greeting = recipientFirstName ? `Bonjour ${recipientFirstName},` : "Bonjour,";

  const bodyText = isExistingUser
    ? `<strong>${teacherFirstName}</strong> vous invite à rejoindre ses élèves sur <strong>DanceDesk</strong>. Vous pourrez accéder à un espace élève dédié tout en conservant votre compte existant.`
    : `<strong>${teacherFirstName}</strong> vous invite à rejoindre ses élèves sur <strong>DanceDesk</strong>. Cliquez sur le lien ci-dessous pour créer votre compte et accepter l'invitation.`;

  const ctaLabel = isExistingUser ? "Accepter l'invitation" : "Créer mon compte et accepter";

  await sendEmailSafe({
    to: recipientEmail,
    subject: `${teacherFirstName} vous invite à rejoindre ses élèves`,
    html: `
      <p>${greeting}</p>
      <p>${bodyText}</p>
      <p style="margin: 24px 0;">
        <a
          href="${invitationUrl}"
          style="background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;"
        >
          ${ctaLabel}
        </a>
      </p>
      <p style="color:#6b7280;font-size:13px;">
        Ce lien est valable <strong>48 heures</strong>. Si vous ne souhaitez pas accepter cette invitation, ignorez simplement cet email.
      </p>
      <p style="color:#6b7280;font-size:12px;">
        DanceDesk — invitation automatique
      </p>
    `,
  });
}
