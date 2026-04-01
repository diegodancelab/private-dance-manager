import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendLoginAlert(
  targetEmail: string
): Promise<void> {
  const fromEmail = process.env.ALERT_FROM_EMAIL ?? "onboarding@resend.dev";
  const now = new Date().toLocaleString("fr-CH", { timeZone: "Europe/Zurich" });

  await resend.emails.send({
    from: fromEmail,
    to: targetEmail,
    subject: "⚠️ Trop de tentatives de connexion sur ton compte",
    html: `
      <p>Bonjour,</p>
      <p>
        Nous avons détecté <strong>5 tentatives de connexion échouées</strong>
        sur le compte associé à cette adresse e-mail.
      </p>
      <p>
        Le compte est temporairement bloqué pendant <strong>15 minutes</strong>
        (depuis ${now}).
      </p>
      <p>
        Si c'est toi qui as oublié ton mot de passe, attends 15 minutes
        et réessaie. Sinon, quelqu'un tente peut-être d'accéder à ton compte —
        considère de changer ton mot de passe dès que possible.
      </p>
      <p style="color:#6b7280;font-size:12px;">
        Private Dance Manager — notification de sécurité automatique
      </p>
    `,
  });
}
