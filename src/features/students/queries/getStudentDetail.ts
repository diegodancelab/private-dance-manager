import { prisma } from "@/lib/prisma";
import { ChargeStatus, PackageStatus, UserRole } from "@/generated/prisma/client";

export type StudentSummary = {
  outstandingBalance: number;
  outstandingCurrency: string;
  activePackageRemainingMinutes: number;
  nextLessonDate: Date | null;
  upcomingLessonsCount: number;
  lastPaymentDate: Date | null;
  status: "healthy" | "warning" | "overdue";
};

export type UnpaidCharge = {
  id: string;
  title: string;
  amount: number;
  currency: string;
  status: string;
  dueAt: Date | null;
  alreadyPaid: number;
};

export type StudentPackageItem = {
  id: string;
  name: string;
  totalMinutes: number;
  remainingMinutes: number;
  status: string;
  expiresAt: Date | null;
};

export type UpcomingLesson = {
  id: string;
  title: string;
  scheduledAt: Date;
  durationMin: number;
  lessonType: string;
  location: string | null;
};

export type RecentPayment = {
  id: string;
  amount: number;
  currency: string;
  method: string | null;
  status: string;
  paidAt: Date | null;
};

export type PortalAccessStatus = "inactive" | "pending" | "active";

export type PortalAccessInfo = {
  status: PortalAccessStatus;
  activatedAt: Date | null;
  pendingInvitationEmail: string | null;
};

export type StudentDetailViewModel = {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    createdAt: Date;
  };
  summary: StudentSummary;
  unpaidCharges: UnpaidCharge[];
  packages: StudentPackageItem[];
  upcomingLessons: UpcomingLesson[];
  recentPayments: RecentPayment[];
  portalAccess: PortalAccessInfo;
};

export async function getStudentDetail(
  id: string,
  teacherId: string
): Promise<StudentDetailViewModel | null> {
  const student = await prisma.user.findFirst({
    where: { id, role: UserRole.STUDENT, createdByTeacherId: teacherId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      createdAt: true,
      portalActivatedAt: true,
    },
  });

  if (!student) return null;

  const now = new Date();

  const [rawCharges, rawPackages, participations, rawPayments, pendingInvitation] =
    await Promise.all([
      prisma.charge.findMany({
        where: {
          userId: id,
          teacherId,
          status: { in: [ChargeStatus.PENDING, ChargeStatus.PARTIALLY_PAID] },
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          amount: true,
          currency: true,
          status: true,
          dueAt: true,
          allocations: { select: { amount: true } },
        },
      }),

      prisma.package.findMany({
        where: { teacherId, participants: { some: { userId: id } } },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          totalMinutes: true,
          remainingMinutes: true,
          status: true,
          expiresAt: true,
        },
      }),

      prisma.lessonParticipant.findMany({
        where: {
          userId: id,
          lesson: { scheduledAt: { gte: now } },
        },
        orderBy: { lesson: { scheduledAt: "asc" } },
        take: 5,
        select: {
          lesson: {
            select: {
              id: true,
              title: true,
              scheduledAt: true,
              durationMin: true,
              lessonType: true,
              location: true,
            },
          },
        },
      }),

      prisma.payment.findMany({
        where: { userId: id, teacherId },
        orderBy: { paidAt: "desc" },
        take: 5,
        select: {
          id: true,
          amount: true,
          currency: true,
          method: true,
          status: true,
          paidAt: true,
        },
      }),

      prisma.portalInvitation.findFirst({
        where: { userId: id, usedAt: null, expiresAt: { gt: now } },
        select: { id: true },
      }),
    ]);

  const unpaidCharges: UnpaidCharge[] = rawCharges.map((c) => ({
    id: c.id,
    title: c.title,
    amount: Number(c.amount),
    currency: c.currency,
    status: c.status,
    dueAt: c.dueAt,
    alreadyPaid: c.allocations.reduce((sum, a) => sum + Number(a.amount), 0),
  }));

  const packages: StudentPackageItem[] = rawPackages.map((p) => ({
    id: p.id,
    name: p.name,
    totalMinutes: p.totalMinutes,
    remainingMinutes: p.remainingMinutes,
    status: p.status,
    expiresAt: p.expiresAt,
  }));

  const upcomingLessons: UpcomingLesson[] = participations.map(
    ({ lesson }) => ({
      id: lesson.id,
      title: lesson.title,
      scheduledAt: lesson.scheduledAt,
      durationMin: lesson.durationMin,
      lessonType: lesson.lessonType,
      location: lesson.location,
    })
  );

  const recentPayments: RecentPayment[] = rawPayments.map((p) => ({
    id: p.id,
    amount: Number(p.amount),
    currency: p.currency,
    method: p.method,
    status: p.status,
    paidAt: p.paidAt,
  }));

  const outstandingBalance = unpaidCharges.reduce(
    (sum, c) => sum + (c.amount - c.alreadyPaid),
    0
  );
  const outstandingCurrency =
    unpaidCharges.length > 0 ? unpaidCharges[0].currency : "CHF";

  const activePackage = packages.find(
    (p) => p.status === PackageStatus.ACTIVE
  );
  const activePackageRemainingMinutes = activePackage?.remainingMinutes ?? 0;

  const nextLessonDate =
    upcomingLessons.length > 0 ? upcomingLessons[0].scheduledAt : null;
  const lastPaymentDate =
    recentPayments.length > 0 ? recentPayments[0].paidAt : null;

  let status: "healthy" | "warning" | "overdue" = "healthy";
  if (unpaidCharges.length > 0) {
    const hasOverdue = unpaidCharges.some(
      (c) => c.dueAt !== null && c.dueAt < now
    );
    status = hasOverdue ? "overdue" : "warning";
  }

  let portalStatus: PortalAccessStatus = "inactive";
  if (student.portalActivatedAt) {
    portalStatus = "active";
  } else if (pendingInvitation) {
    portalStatus = "pending";
  }

  return {
    student: {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
      createdAt: student.createdAt,
    },
    summary: {
      outstandingBalance,
      outstandingCurrency,
      activePackageRemainingMinutes,
      nextLessonDate,
      upcomingLessonsCount: upcomingLessons.length,
      lastPaymentDate,
      status,
    },
    unpaidCharges,
    packages,
    upcomingLessons,
    recentPayments,
    portalAccess: {
      status: portalStatus,
      activatedAt: student.portalActivatedAt,
      pendingInvitationEmail: portalStatus === "pending" ? student.email : null,
    },
  };
}
