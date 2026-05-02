import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendLessonReminder } from "@/lib/email/sendLessonReminder";
import { getAppUrl } from "@/lib/email/emailEnv";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  // Cron runs at 22h UTC (= midnight Swiss summer time).
  // Window +2h to +26h covers all lessons of the next calendar day (UTC).
  const windowStart = new Date(now.getTime() +  2 * 60 * 60 * 1000);
  const windowEnd   = new Date(now.getTime() + 26 * 60 * 60 * 1000);

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
            select: { email: true, firstName: true, notifLessonReminder: true },
          },
        },
      },
    },
  });

  const portalUrl = `${getAppUrl()}/fr/portal`;
  let sent = 0;

  for (const lesson of lessons) {
    for (const { user } of lesson.participants) {
      if (!user.email || !user.notifLessonReminder) continue;
      void sendLessonReminder({
        studentEmail: user.email,
        studentFirstName: user.firstName,
        teacherFirstName: lesson.teacher.firstName,
        lessonTitle: lesson.title,
        scheduledAt: lesson.scheduledAt,
        location: lesson.location,
        portalUrl,
      });
      sent++;
    }
  }

  return NextResponse.json({ ok: true, sent });
}
