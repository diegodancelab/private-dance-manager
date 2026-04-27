import { Resend } from "resend";

// ---------------------------------------------------------------------------
// FROM address constants
// Resolved from environment variables with sensible defaults.
// In dev, Mailpit intercepts everything — the real addresses are shown as-is
// in the UI, which makes testing realistic.
// ---------------------------------------------------------------------------

export const FROM_NOREPLY       = process.env.EMAIL_FROM_NOREPLY       ?? "noreply@dancedesk.ch";
export const FROM_HELLO         = process.env.EMAIL_FROM_HELLO         ?? "hello@dancedesk.ch";
export const FROM_SECURITY      = process.env.EMAIL_FROM_SECURITY      ?? "security@dancedesk.ch";
export const FROM_NOTIFICATIONS = process.env.EMAIL_FROM_NOTIFICATIONS ?? "notifications@dancedesk.ch";

// ---------------------------------------------------------------------------
// Environment detection
// NODE_ENV=development → local dev with Mailpit
// VERCEL_ENV=preview   → staging on Vercel (Resend, redirected recipient)
// VERCEL_ENV=production → production on Vercel (Resend, real recipient)
// ---------------------------------------------------------------------------

type EmailEnvironment = "production" | "preview" | "development";

export function getEmailEnvironment(): EmailEnvironment {
  if (process.env.NODE_ENV === "development") return "development";
  switch (process.env.VERCEL_ENV) {
    case "production": return "production";
    case "preview":    return "preview";
    default:           return "development";
  }
}

// ---------------------------------------------------------------------------
// Recipient routing
// Dev     → real address (Mailpit intercepts, nothing escapes)
// Staging → redirected to EMAIL_OVERRIDE_TO
// Prod    → real address
// ---------------------------------------------------------------------------

export function resolveRecipient(realEmail: string): string {
  const env = getEmailEnvironment();

  if (env === "production" || env === "development") return realEmail;

  const override = process.env.EMAIL_OVERRIDE_TO;
  if (!override) {
    console.warn(
      `[EMAIL] ⚠️  EMAIL_OVERRIDE_TO not set in "${env}". ` +
      `Sending to real recipient: ${realEmail}.`
    );
    return realEmail;
  }

  console.log("[EMAIL]", { env, to: realEmail, redirected: override });
  return override;
}

// ---------------------------------------------------------------------------
// Subject prefix
// ---------------------------------------------------------------------------

export function prefixSubject(subject: string): string {
  const env = getEmailEnvironment();
  if (env === "preview")     return `[STAGING] ${subject}`;
  if (env === "development") return `[DEV] ${subject}`;
  return subject;
}

// ---------------------------------------------------------------------------
// Central send function
// ---------------------------------------------------------------------------

type SendEmailOptions = {
  /** Defaults to FROM_NOREPLY if omitted. */
  from?: string;
  to: string;
  subject: string;
  html: string;
};

/**
 * Single entry point for all email sending.
 *
 * - development → Mailpit via SMTP (localhost:1025). Nothing ever leaves the
 *   machine. Open http://localhost:8025 to inspect sent emails.
 * - preview/staging → Resend, recipient redirected to EMAIL_OVERRIDE_TO.
 * - production → Resend, real recipient.
 */
export async function sendEmailSafe({
  from = FROM_NOREPLY,
  to,
  subject,
  html,
}: SendEmailOptions): Promise<void> {
  const finalTo      = resolveRecipient(to);
  const finalSubject = prefixSubject(subject);

  if (getEmailEnvironment() === "development") {
    // Dynamic import keeps nodemailer out of the production bundle.
    const nodemailer = (await import("nodemailer")).default;
    const transporter = nodemailer.createTransport({
      host: process.env.MAILPIT_HOST ?? "localhost",
      port: Number(process.env.MAILPIT_SMTP_PORT ?? 1025),
      secure: false,
    });
    await transporter.sendMail({ from, to: finalTo, subject: finalSubject, html });
    console.log(`[EMAIL DEV → Mailpit] from=${from} to=${finalTo} subject="${finalSubject}"`);
    return;
  }

  // Resend — staging + production
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from,
    to: finalTo,
    subject: finalSubject,
    html,
  });
  if (error) throw new Error(`[EMAIL] Resend error: ${error.message}`);
}

// Convenience alias
export const sendEmail = sendEmailSafe;
