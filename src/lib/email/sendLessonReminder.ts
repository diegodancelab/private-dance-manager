import { sendEmailSafe, FROM_NOTIFICATIONS } from "./emailEnv";

export async function sendLessonReminder({
  studentEmail,
  studentFirstName,
  teacherFirstName,
  lessonTitle,
  scheduledAt,
  location,
  portalUrl,
  timezone = "Europe/Zurich",
}: {
  studentEmail: string;
  studentFirstName: string;
  teacherFirstName: string;
  lessonTitle: string;
  scheduledAt: Date;
  location?: string | null;
  portalUrl: string;
  timezone?: string;
}): Promise<void> {
  const dateStr = scheduledAt.toLocaleDateString("fr-CH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: timezone,
  });
  const timeStr = scheduledAt.toLocaleTimeString("fr-CH", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  });

  const locationLine = location
    ? `<p>📍 <strong>Lieu :</strong> ${location}</p>`
    : "";

  await sendEmailSafe({
    from: FROM_NOTIFICATIONS,
    to: studentEmail,
    subject: `Rappel : cours demain à ${timeStr}`,
    html: `
      <p>Bonjour ${studentFirstName},</p>
      <p>
        Voici un rappel pour ton cours avec <strong>${teacherFirstName}</strong> demain.
      </p>
      <p>📅 <strong>${dateStr}</strong> à <strong>${timeStr}</strong></p>
      <p>🎵 <strong>${lessonTitle}</strong></p>
      ${locationLine}
      <p style="margin: 24px 0;">
        <a
          href="${portalUrl}"
          style="background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;"
        >
          Voir mon portail
        </a>
      </p>
      <p style="color:#6b7280;font-size:12px;">
        DanceDesk — rappel automatique · Tu peux désactiver ces emails depuis ton profil.
      </p>
    `,
  });
}
