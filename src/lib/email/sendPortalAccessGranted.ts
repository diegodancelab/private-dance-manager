import { sendEmailSafe } from "./emailEnv";

export async function sendPortalAccessGranted({
  studentEmail,
  studentFirstName,
  teacherFirstName,
  loginUrl,
}: {
  studentEmail: string;
  studentFirstName: string;
  teacherFirstName: string;
  loginUrl: string;
}): Promise<void> {
  await sendEmailSafe({
    to: studentEmail,
    subject: `${teacherFirstName} vous a donné accès à votre espace élève`,
    html: `
      <p>Bonjour ${studentFirstName},</p>
      <p>
        <strong>${teacherFirstName}</strong> vous a donné accès à votre espace élève
        sur <strong>Private Dance Manager</strong>.
      </p>
      <p>
        Vous avez déjà un compte — connectez-vous simplement avec vos identifiants habituels
        pour accéder à ce nouvel espace.
      </p>
      <p style="margin: 24px 0;">
        <a
          href="${loginUrl}"
          style="background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;"
        >
          Se connecter
        </a>
      </p>
      <p style="color:#6b7280;font-size:12px;">
        Private Dance Manager — notification automatique
      </p>
    `,
  });
}
