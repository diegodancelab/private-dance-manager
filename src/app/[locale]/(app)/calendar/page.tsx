import { prisma } from "@/lib/prisma";
import CalendarWeekHeader from "@/features/calendar/components/CalendarWeekHeader";
import CalendarWeekView from "@/features/calendar/components/CalendarWeekView";
import {
  getEndOfWindow,
  getStartOfWindow,
  parseCalendarDate,
  parseViewMode,
} from "@/lib/calendar";
import { requireAuth } from "@/lib/auth/require-auth";
import { setRequestLocale } from "next-intl/server";

type CalendarPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    date?: string;
    view?: string;
  }>;
};

export default async function CalendarPage({
  params,
  searchParams,
}: CalendarPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { user } = await requireAuth();
  const searchParamsResolved = await searchParams;
  const currentDate = parseCalendarDate(searchParamsResolved.date);
  const viewMode = parseViewMode(searchParamsResolved.view);

  const start = getStartOfWindow(currentDate, viewMode);
  const end = getEndOfWindow(currentDate, viewMode);

  const lessons = await prisma.lesson.findMany({
    where: {
      teacherId: user.id,
      scheduledAt: {
        gte: start,
        lt: end,
      },
    },
    orderBy: {
      scheduledAt: "asc",
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return (
    <div>
      <CalendarWeekHeader currentDate={currentDate} viewMode={viewMode} />
      <CalendarWeekView
        currentDate={currentDate}
        viewMode={viewMode}
        lessons={lessons}
      />
    </div>
  );
}
