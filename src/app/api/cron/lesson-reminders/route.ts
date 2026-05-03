import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendLessonReminder } from "@/lib/email/sendLessonReminder";
import { getAppUrl } from "@/lib/email/emailEnv";
import { sendNotification, getFailedNotifications } from "@/lib/notifications/sendNotification";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  // Cron runs at 22h UTC (= midnight Swiss summer). Window +2h→+26h covers all
  // lessons of the next calendar day in UTC — i.e. the full Swiss tomorrow.
  const windowStart = new Date(now.getTime() +  2 * 60 * 60 * 1000);
  const windowEnd   = new Date(now.getTime() + 26 * 60 * 60 * 1000);

  // ── 1. Fetch lessons in window ──────────────────────────────────────────
  const lessons = await prisma.lesson.findMany({
    where: {
      scheduledAt: { gte: windowStart, lte: windowEnd },
      status: "SCHEDULED",
    },
    select: {
      id: true,
      title: true,
      scheduledAt: true,
      location: true,
      teacher: { select: { firstName: true } },
      participants: {
        where: { status: "CONFIRMED" },
        select: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              timezone: true,
              notifLessonReminder: true,
            },
          },
        },
      },
    },
  });

  // ── 2. Passive retry: failed reminders from last 24h ────────────────────
  const failed = await getFailedNotifications("LESSON_REMINDER");
  const failedKeys = new Set(failed.map((f) => `${f.userId}:${f.referenceId}`));

  // ── 3. Send new + retry failed ──────────────────────────────────────────
  const portalUrl = `${getAppUrl()}/fr/portal`;
  let sent = 0;
  let skipped = 0;
  let retried = 0;

  for (const lesson of lessons) {
    for (const { user } of lesson.participants) {
      if (!user.email || !user.notifLessonReminder) {
        skipped++;
        continue;
      }

      const isRetry = failedKeys.has(`${user.id}:${lesson.id}`);

      await sendNotification({
        userId: user.id,
        type: "LESSON_REMINDER",
        referenceId: lesson.id,
        subject: `Rappel : cours demain`,
        send: () =>
          sendLessonReminder({
            studentEmail: user.email!,
            studentFirstName: user.firstName,
            teacherFirstName: lesson.teacher.firstName,
            lessonTitle: lesson.title,
            scheduledAt: lesson.scheduledAt,
            location: lesson.location,
            portalUrl,
            timezone: user.timezone,
          }),
      });

      if (isRetry) retried++;
      else sent++;
    }
  }

  logger.info("cron", "lesson-reminders completed", {
    lessons: lessons.length,
    sent,
    skipped,
    retried,
  });

  return NextResponse.json({ ok: true, sent, skipped, retried });
}
