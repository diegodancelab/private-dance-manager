import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { NotificationChannel, NotificationType } from "@/generated/prisma/client";

export type SendNotificationOptions = {
  userId: string;
  type: NotificationType;
  channel?: NotificationChannel;
  /** Stable ID of the linked entity (lessonId, assessmentId…). Used as dedup key. */
  referenceId?: string;
  subject?: string;
  /** The actual send function. Throw to signal failure. */
  send: () => Promise<void>;
};

/**
 * Single entry point for all notification sends.
 *
 * Guarantees:
 *  - Idempotent: (userId, type, referenceId, channel) is unique — duplicate calls are no-ops.
 *  - Audit trail: every attempt is logged in NotificationLog.
 *  - Error isolation: failures are caught, logged, and stored for passive retry.
 *    The caller never throws — processing continues for other recipients.
 *  - Passive retry: the cron or any future job can query status=FAILED + attempts<3
 *    and re-call this function with the same arguments.
 */
export async function sendNotification({
  userId,
  type,
  channel = "EMAIL",
  referenceId = "",
  subject,
  send,
}: SendNotificationOptions): Promise<void> {
  const dedup = { userId, type, referenceId, channel } as const;

  // ── 1. Dédup : déjà envoyé avec succès ? ─────────────────────────────────
  const existing = await prisma.notificationLog.findUnique({
    where: { userId_type_referenceId_channel: dedup },
    select: { id: true, status: true, attempts: true },
  });

  if (existing?.status === "SENT") {
    logger.info("notification", "Skipped — already sent", { userId, type, referenceId });
    return;
  }

  // ── 2. Créer ou réactiver le log (PENDING) ────────────────────────────────
  const log = await prisma.notificationLog.upsert({
    where: { userId_type_referenceId_channel: dedup },
    create: { userId, type, channel, referenceId, subject, status: "PENDING", attempts: 1 },
    update: { status: "PENDING", subject, attempts: { increment: 1 }, errorMessage: null },
    select: { id: true, attempts: true },
  });

  // ── 3. Envoyer ────────────────────────────────────────────────────────────
  try {
    await send();

    await prisma.notificationLog.update({
      where: { id: log.id },
      data: { status: "SENT", sentAt: new Date(), errorMessage: null },
    });

    logger.info("notification", "Sent", { userId, type, referenceId, attempt: log.attempts });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);

    await prisma.notificationLog.update({
      where: { id: log.id },
      data: { status: "FAILED", errorMessage },
    });

    // Do not re-throw — caller continues processing other recipients.
    logger.error("notification", "Send failed", {
      userId,
      type,
      referenceId,
      attempt: log.attempts,
      error: errorMessage,
    });
  }
}

/**
 * Query helper for the passive retry mechanism used by cron jobs.
 * Returns logs that failed and haven't exceeded maxAttempts.
 */
export async function getFailedNotifications(
  type: NotificationType,
  { maxAttempts = 3, withinHours = 24 }: { maxAttempts?: number; withinHours?: number } = {}
) {
  return prisma.notificationLog.findMany({
    where: {
      type,
      status: "FAILED",
      attempts: { lt: maxAttempts },
      createdAt: { gte: new Date(Date.now() - withinHours * 60 * 60 * 1000) },
    },
    select: { id: true, userId: true, referenceId: true, attempts: true },
  });
}
