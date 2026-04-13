import { Resend } from "resend";

// ---------------------------------------------------------------------------
// Environment detection
// ---------------------------------------------------------------------------

type EmailEnvironment = "production" | "preview" | "development";

export function getEmailEnvironment(): EmailEnvironment {
  switch (process.env.VERCEL_ENV) {
    case "production":
      return "production";
    case "preview":
      return "preview";
    default:
      return "development";
  }
}

export function shouldSendRealEmails(): boolean {
  return getEmailEnvironment() === "production";
}

// ---------------------------------------------------------------------------
// Recipient
// ---------------------------------------------------------------------------

/**
 * Returns the real recipient in production.
 * In dev/preview, always redirects to EMAIL_OVERRIDE_TO.
 * Warns loudly if EMAIL_OVERRIDE_TO is not configured in non-production.
 */
export function resolveRecipient(realEmail: string): string {
  const env = getEmailEnvironment();

  if (env === "production") return realEmail;

  const override = process.env.EMAIL_OVERRIDE_TO;

  if (!override) {
    console.warn(
      `[EMAIL] ⚠️  EMAIL_OVERRIDE_TO is not set in env "${env}". ` +
        `Falling back to real recipient: ${realEmail}. ` +
        `Set EMAIL_OVERRIDE_TO to prevent sending real emails.`
    );
    return realEmail;
  }

  if (env !== "production") {
    console.log("[EMAIL DEBUG]", {
      env,
      originalRecipient: realEmail,
      finalRecipient: override,
    });
  }

  return override;
}

// ---------------------------------------------------------------------------
// Sender (from)
// ---------------------------------------------------------------------------

/**
 * Returns the appropriate "from" address for the current environment.
 * Falls back to onboarding@resend.dev for local dev without configuration.
 */
export function resolveFrom(): string {
  const env = getEmailEnvironment();

  switch (env) {
    case "production":
      return process.env.EMAIL_FROM_PROD ?? "onboarding@resend.dev";
    case "preview":
      return process.env.EMAIL_FROM_PREVIEW ?? "onboarding@resend.dev";
    default:
      return process.env.EMAIL_FROM_DEV ?? "onboarding@resend.dev";
  }
}

// ---------------------------------------------------------------------------
// Subject prefix
// ---------------------------------------------------------------------------

/**
 * Prefixes the subject with the environment tag in non-production.
 * Production → unchanged
 * Preview    → "[PREVIEW] ..."
 * Dev        → "[DEV] ..."
 */
export function prefixSubject(subject: string): string {
  const env = getEmailEnvironment();

  switch (env) {
    case "preview":
      return `[PREVIEW] ${subject}`;
    case "development":
      return `[DEV] ${subject}`;
    default:
      return subject;
  }
}

// ---------------------------------------------------------------------------
// Safe send wrapper
// ---------------------------------------------------------------------------

type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
};

/**
 * Central email sender. Applies environment-aware routing, subject prefix,
 * and sender address automatically. All email sending in the app must go
 * through this function — never call resend.emails.send() directly.
 */
export async function sendEmailSafe({
  to,
  subject,
  html,
}: SendEmailOptions): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: resolveFrom(),
    to: resolveRecipient(to),
    subject: prefixSubject(subject),
    html,
  });
}
