import { prisma } from "@/lib/prisma";
import { TeacherStudentInvitationStatus } from "@/generated/prisma/client";

export type PendingInvitationItem = {
  id: string;
  email: string;
  createdAt: Date;
  expiresAt: Date;
};

export type CrossEnrolledStudent = {
  relationId: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  createdAt: Date;
};

export type TeacherForChooseRole = {
  id: string;
  firstName: string;
  lastName: string;
};

export async function getPendingInvitations(
  teacherId: string
): Promise<PendingInvitationItem[]> {
  const now = new Date();
  const invitations = await prisma.teacherStudentInvitation.findMany({
    where: {
      teacherId,
      status: TeacherStudentInvitationStatus.PENDING,
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, createdAt: true, expiresAt: true },
  });
  return invitations;
}

export async function getCrossEnrolledStudents(
  teacherId: string
): Promise<CrossEnrolledStudent[]> {
  const relations = await prisma.teacherStudentRelation.findMany({
    where: { teacherId, student: { role: "TEACHER" } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  return relations.map((r) => ({
    relationId: r.id,
    userId: r.student.id,
    firstName: r.student.firstName,
    lastName: r.student.lastName,
    email: r.student.email,
    phone: r.student.phone,
    createdAt: r.createdAt,
  }));
}

export async function getTeachersForChooseRole(
  studentUserId: string
): Promise<TeacherForChooseRole[]> {
  const relations = await prisma.teacherStudentRelation.findMany({
    where: { studentId: studentUserId },
    select: {
      teacher: { select: { id: true, firstName: true, lastName: true } },
    },
  });
  return relations.map((r) => r.teacher);
}

export async function isDualRoleUser(userId: string): Promise<boolean> {
  const count = await prisma.teacherStudentRelation.count({
    where: { studentId: userId },
  });
  return count > 0;
}
