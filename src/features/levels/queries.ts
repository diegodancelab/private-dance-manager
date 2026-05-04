import { prisma } from "@/lib/prisma";

export type TeacherLevelItem = {
  id: string;
  name: string;
  color: string;
  order: number;
};

export async function getTeacherLevels(teacherId: string): Promise<TeacherLevelItem[]> {
  return prisma.teacherLevel.findMany({
    where: { teacherId },
    orderBy: { order: "asc" },
    select: { id: true, name: true, color: true, order: true },
  });
}

export async function getStudentLevel(
  studentId: string,
  teacherId: string
): Promise<{ id: string; name: string; color: string } | null> {
  const assignment = await prisma.studentLevelAssignment.findUnique({
    where: { teacherId_studentId: { teacherId, studentId } },
    select: { level: { select: { id: true, name: true, color: true } } },
  });
  return assignment?.level ?? null;
}
