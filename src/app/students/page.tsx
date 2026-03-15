import { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function StudentsPage() {
  const students = await prisma.user.findMany({
    where: {
      role: UserRole.STUDENT,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div>
      <h1>Students</h1>

      <ul>
        {students.map((student) => (
          <li key={student.id}>
            <Link href={`/students/${student.id}`}>
              {student.firstName} {student.lastName} - {student.email}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}