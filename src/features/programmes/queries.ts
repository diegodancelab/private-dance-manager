import { prisma } from "@/lib/prisma";
import type { ProgrammeItemStatus } from "@/generated/prisma/client";

export type ProgrammeListItem = {
  id: string;
  name: string;
  level: string | null;
  danceStyle: string | null;
  _count: { sections: number; assignments: number };
};

export type ProgrammeDetail = {
  id: string;
  name: string;
  description: string | null;
  level: string | null;
  danceStyle: string | null;
  sections: {
    id: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    order: number;
    items: {
      id: string;
      name: string;
      nameAlt: string | null;
      description: string | null;
      isMandatory: boolean;
      order: number;
    }[];
  }[];
};

export type StudentProgrammeWithStatuses = {
  id: string;
  assignedAt: Date;
  teacherName: string;
  programme: ProgrammeDetail;
  itemStatuses: { itemId: string; status: ProgrammeItemStatus; notes: string | null }[];
};

export async function getTeacherProgrammes(teacherId: string): Promise<ProgrammeListItem[]> {
  return prisma.programme.findMany({
    where: { teacherId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      level: true,
      danceStyle: true,
      _count: { select: { sections: true, assignments: true } },
    },
  });
}

export async function getProgrammeDetail(
  programmeId: string,
  teacherId: string
): Promise<ProgrammeDetail | null> {
  return prisma.programme.findFirst({
    where: { id: programmeId, teacherId },
    select: {
      id: true,
      name: true,
      description: true,
      level: true,
      danceStyle: true,
      sections: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          subtitle: true,
          description: true,
          order: true,
          items: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              name: true,
              nameAlt: true,
              description: true,
              isMandatory: true,
              order: true,
            },
          },
        },
      },
    },
  });
}

export async function getStudentProgrammes(
  studentId: string,
  teacherId: string
): Promise<StudentProgrammeWithStatuses[]> {
  const rows = await prisma.studentProgramme.findMany({
    where: { studentId, teacherId },
    orderBy: { assignedAt: "asc" },
    select: {
      id: true,
      assignedAt: true,
      teacher: { select: { firstName: true, lastName: true } },
      itemStatuses: { select: { itemId: true, status: true, notes: true } },
      programme: {
        select: {
          id: true, name: true, description: true, level: true, danceStyle: true,
          sections: {
            orderBy: { order: "asc" },
            select: {
              id: true, title: true, subtitle: true, description: true, order: true,
              items: {
                orderBy: { order: "asc" },
                select: { id: true, name: true, nameAlt: true, description: true, isMandatory: true, order: true },
              },
            },
          },
        },
      },
    },
  });

  return rows.map((sp) => ({ ...sp, teacherName: `${sp.teacher.firstName} ${sp.teacher.lastName}` }));
}

export async function getStudentProgramme(
  studentId: string,
  teacherId: string
): Promise<StudentProgrammeWithStatuses | null> {
  const sp = await prisma.studentProgramme.findFirst({
    where: { studentId, teacherId },
    select: {
      id: true,
      assignedAt: true,
      teacher: { select: { firstName: true, lastName: true } },
      itemStatuses: {
        select: { itemId: true, status: true, notes: true },
      },
      programme: {
        select: {
          id: true,
          name: true,
          description: true,
          level: true,
          danceStyle: true,
          sections: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              subtitle: true,
              description: true,
              order: true,
              items: {
                orderBy: { order: "asc" },
                select: {
                  id: true,
                  name: true,
                  nameAlt: true,
                  description: true,
                  isMandatory: true,
                  order: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!sp) return null;
  return { ...sp, teacherName: `${sp.teacher.firstName} ${sp.teacher.lastName}` };
}

export async function getStudentProgrammesForPortal(
  studentId: string
): Promise<StudentProgrammeWithStatuses[]> {
  const rows = await prisma.studentProgramme.findMany({
    where: { studentId },
    orderBy: { assignedAt: "asc" },
    select: {
      id: true,
      assignedAt: true,
      teacher: { select: { firstName: true, lastName: true } },
      itemStatuses: {
        select: { itemId: true, status: true, notes: true },
      },
      programme: {
        select: {
          id: true,
          name: true,
          description: true,
          level: true,
          danceStyle: true,
          sections: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              subtitle: true,
              description: true,
              order: true,
              items: {
                orderBy: { order: "asc" },
                select: {
                  id: true,
                  name: true,
                  nameAlt: true,
                  description: true,
                  isMandatory: true,
                  order: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return rows.map((sp) => ({ ...sp, teacherName: `${sp.teacher.firstName} ${sp.teacher.lastName}` }));
}
