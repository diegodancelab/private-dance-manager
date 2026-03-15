import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/client";
import CalendarWeekHeader from "@/components/calendar/CalendarWeekHeader";
import CalendarWeekView from "@/components/calendar/CalendarWeekView";
import { getEndOfWeek, getStartOfWeek, parseCalendarDate } from "@/lib/calendar";


type CalendarPageProps = {
  searchParams: Promise<{
    date?: string;
  }>;
};

export default async function CalendarPage({
  searchParams,
}: CalendarPageProps) {
  const params = await searchParams;
  const currentDate = parseCalendarDate(params.date);

  const startOfWeek = getStartOfWeek(currentDate);
  const endOfWeek = getEndOfWeek(currentDate);

  const teacher = await prisma.user.findFirst({
    where: {
      role: UserRole.TEACHER,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
    },
  });

  const lessons = teacher
    ? await prisma.lesson.findMany({
        where: {
          teacherId: teacher.id,
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
      })
    : [];

  return (
    <div>
      <CalendarWeekHeader currentDate={currentDate} />
      <CalendarWeekView currentDate={currentDate} lessons={lessons} />
    </div>
  );
}