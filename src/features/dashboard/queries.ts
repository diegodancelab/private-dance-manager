import { prisma } from "@/lib/prisma";
import { ChargeStatus, PackageStatus } from "@/generated/prisma/client";

// --- Types ---

export type TodayLesson = {
  id: string;
  title: string;
  lessonType: string;
  scheduledAt: Date;
  durationMin: number;
  location: string | null;
  participants: {
    id: string;
    firstName: string;
    lastName: string;
    hasPackage: boolean;
  }[];
};

export type PendingCharge = {
  id: string;
  studentFirstName: string;
  studentLastName: string;
  studentId: string;
  title: string;
  amount: number;
  alreadyPaid: number;
  currency: string;
  status: string;
};

export type DashboardAlert =
  | { type: "package_low"; packageId: string; studentName: string; remainingMinutes: number }
  | { type: "package_expiring"; packageId: string; studentName: string; expiresAt: Date; daysLeft: number }
  | { type: "lesson_no_participant"; lessonId: string; lessonTitle: string; scheduledAt: Date }
  | { type: "lesson_no_package"; lessonId: string; lessonTitle: string; scheduledAt: Date; studentName: string };

// --- Queries ---

export async function getTodayLessons(teacherId: string): Promise<TodayLesson[]> {
  const now = new Date();

  // Build start/end of today in Europe/Zurich — safe for server context
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Zurich",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(now).map(({ type, value }) => [type, value])
  );
  const todayStart = new Date(
    Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), 0, 0, 0) -
      getZurichOffsetMs(now)
  );
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const lessons = await prisma.lesson.findMany({
    where: {
      teacherId,
      scheduledAt: { gte: todayStart, lt: todayEnd },
    },
    orderBy: { scheduledAt: "asc" },
    select: {
      id: true,
      title: true,
      lessonType: true,
      scheduledAt: true,
      durationMin: true,
      location: true,
      participants: {
        select: {
          user: { select: { id: true, firstName: true, lastName: true } },
          packageUsage: { select: { id: true } },
        },
      },
    },
  });

  return lessons.map((l) => ({
    id: l.id,
    title: l.title,
    lessonType: l.lessonType,
    scheduledAt: l.scheduledAt,
    durationMin: l.durationMin,
    location: l.location,
    participants: l.participants.map((p) => ({
      id: p.user.id,
      firstName: p.user.firstName,
      lastName: p.user.lastName,
      hasPackage: p.packageUsage !== null,
    })),
  }));
}

export async function getPendingCharges(
  teacherId: string
): Promise<{ charges: PendingCharge[]; totalOwed: number; currency: string }> {
  const raw = await prisma.charge.findMany({
    where: {
      teacherId,
      status: { in: [ChargeStatus.PENDING, ChargeStatus.PARTIALLY_PAID] },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      amount: true,
      currency: true,
      status: true,
      user: { select: { id: true, firstName: true, lastName: true } },
      allocations: { select: { amount: true } },
    },
  });

  // Separate query for total (all pending, not just top 5)
  const allPending = await prisma.charge.findMany({
    where: {
      teacherId,
      status: { in: [ChargeStatus.PENDING, ChargeStatus.PARTIALLY_PAID] },
    },
    select: {
      amount: true,
      currency: true,
      allocations: { select: { amount: true } },
    },
  });

  const totalOwed = allPending.reduce((sum, c) => {
    const paid = c.allocations.reduce((s, a) => s + Number(a.amount), 0);
    return sum + (Number(c.amount) - paid);
  }, 0);

  const currency = allPending.length > 0 ? allPending[0].currency : "CHF";

  const charges: PendingCharge[] = raw.map((c) => {
    const alreadyPaid = c.allocations.reduce((s, a) => s + Number(a.amount), 0);
    return {
      id: c.id,
      studentId: c.user.id,
      studentFirstName: c.user.firstName,
      studentLastName: c.user.lastName,
      title: c.title,
      amount: Number(c.amount),
      alreadyPaid,
      currency: c.currency,
      status: c.status,
    };
  });

  return { charges, totalOwed, currency };
}

export async function getAlerts(teacherId: string): Promise<DashboardAlert[]> {
  const alerts: DashboardAlert[] = [];
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [lowPackages, expiringPackages, futureLessons] = await Promise.all([
    // Packages with < 2h remaining
    prisma.package.findMany({
      where: {
        teacherId,
        status: PackageStatus.ACTIVE,
        remainingMinutes: { lt: 120 },
      },
      select: {
        id: true,
        remainingMinutes: true,
        user: { select: { firstName: true, lastName: true } },
      },
    }),

    // Active packages expiring within 7 days
    prisma.package.findMany({
      where: {
        teacherId,
        status: PackageStatus.ACTIVE,
        expiresAt: { gte: now, lte: in7Days },
      },
      select: {
        id: true,
        expiresAt: true,
        user: { select: { firstName: true, lastName: true } },
      },
    }),

    // Future lessons
    prisma.lesson.findMany({
      where: {
        teacherId,
        scheduledAt: { gte: now },
      },
      orderBy: { scheduledAt: "asc" },
      take: 20,
      select: {
        id: true,
        title: true,
        scheduledAt: true,
        participants: {
          select: {
            user: { select: { firstName: true, lastName: true } },
            packageUsage: { select: { id: true } },
          },
        },
      },
    }),
  ]);

  for (const pkg of lowPackages) {
    alerts.push({
      type: "package_low",
      packageId: pkg.id,
      studentName: `${pkg.user.firstName} ${pkg.user.lastName}`,
      remainingMinutes: pkg.remainingMinutes,
    });
  }

  for (const pkg of expiringPackages) {
    const daysLeft = Math.ceil(
      (pkg.expiresAt!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    alerts.push({
      type: "package_expiring",
      packageId: pkg.id,
      studentName: `${pkg.user.firstName} ${pkg.user.lastName}`,
      expiresAt: pkg.expiresAt!,
      daysLeft,
    });
  }

  for (const lesson of futureLessons) {
    if (lesson.participants.length === 0) {
      alerts.push({
        type: "lesson_no_participant",
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        scheduledAt: lesson.scheduledAt,
      });
    } else {
      for (const p of lesson.participants) {
        if (!p.packageUsage) {
          alerts.push({
            type: "lesson_no_package",
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            scheduledAt: lesson.scheduledAt,
            studentName: `${p.user.firstName} ${p.user.lastName}`,
          });
        }
      }
    }
  }

  return alerts;
}

// Internal helper — mirrors the one in lib/dates.ts
function getZurichOffsetMs(date: Date): number {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Zurich",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const p = Object.fromEntries(
    fmt.formatToParts(date).map(({ type, value }) => [type, value])
  );
  const zurichMs = Date.UTC(
    Number(p.year),
    Number(p.month) - 1,
    Number(p.day),
    Number(p.hour) % 24,
    Number(p.minute)
  );
  const utcMs = date.getTime() - date.getMilliseconds() - date.getSeconds() * 1000;
  return zurichMs - utcMs;
}
