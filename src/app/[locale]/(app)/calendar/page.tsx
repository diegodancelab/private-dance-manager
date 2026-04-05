import { prisma } from "@/lib/prisma";
import CalendarWeekHeader from "@/components/calendar/CalendarWeekHeader";
import CalendarWeekView from "@/components/calendar/CalendarWeekView";
import {
  getEndOfWindow,
  getStartOfWindow,
  parseCalendarDate,
  parseViewMode,
} from "@/lib/calendar";
import { requireAuth } from "@/lib/auth/require-auth";

type CalendarPageProps = {
  searchParams: Promise<{
    date?: string;
    view?: string;
  }>;
};

export default async function CalendarPage({
  searchParams,
}: CalendarPageProps) {
  const { user } = await requireAuth();
  const params = await searchParams;
  const currentDate = parseCalendarDate(params.date);
  const viewMode = parseViewMode(params.view);

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
