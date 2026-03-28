import { prisma } from "@/lib/prisma";
import CalendarWeekHeader from "@/components/calendar/CalendarWeekHeader";
import CalendarWeekView from "@/components/calendar/CalendarWeekView";
import { getEndOfWeek, getStartOfWeek, parseCalendarDate } from "@/lib/calendar";
import { requireAuth } from "@/lib/auth/require-auth";


type CalendarPageProps = {
  searchParams: Promise<{
    date?: string;
  }>;
};

export default async function CalendarPage({
  searchParams,
}: CalendarPageProps) {
  const { user } = await requireAuth();
  const params = await searchParams;
  const currentDate = parseCalendarDate(params.date);

  const startOfWeek = getStartOfWeek(currentDate);
  const endOfWeek = getEndOfWeek(currentDate);

  const lessons = await prisma.lesson.findMany({
    where: {
      teacherId: user.id,
      scheduledAt: {
        gte: startOfWeek,
        lt: endOfWeek,
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
      <CalendarWeekHeader currentDate={currentDate} />
      <CalendarWeekView currentDate={currentDate} lessons={lessons} />
    </div>
  );
}