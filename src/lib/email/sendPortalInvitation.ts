import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPortalInvitation({
  studentEmail,
  studentFirstName,
  teacherFirstName,
  invitationUrl,
}: {
  studentEmail: string;
  studentFirstName: string;
  teacherFirstName: string;
  invitationUrl: string;
}): Promise<void> {
  const fromEmail = process.env.ALERT_FROM_EMAIL ?? "onboarding@resend.dev";

  await resend.emails.send({
    from: fromEmail,
    to: studentEmail,
    subject: `${teacherFirstName} vous invite à accéder à votre espace élève`,
    html: `
      <p>Bonjour ${studentFirstName},</p>
      <p>
        <strong>${teacherFirstName}</strong> vous invite à accéder à votre espace élève
        sur <strong>Private Dance Manager</strong>.
      </p>
      <p>
        Vous pourrez y consulter vos cours, vos feedbacks, votre progression
        et le suivi de votre forfait.
      </p>
      <p style="margin: 24px 0;">
        <a
          href="${invitationUrl}"
          style="background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;"
        >
          Activer mon espace élève
        </a>
      </p>
      <p style="color:#6b7280;font-size:13px;">
        Ce lien est valable <strong>48 heures</strong>. S'il a expiré, demandez à votre professeur
        de vous renvoyer une invitation.
      </p>
      <p style="color:#6b7280;font-size:12px;">
        Private Dance Manager — invitation automatique
      </p>
    `,
  });
}
