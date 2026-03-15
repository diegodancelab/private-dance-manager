import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function StudentDetailPage({ params }: Props) {
  const { id } = await params;

  const student = await prisma.user.findFirst({
    where: {
      id,
      role: UserRole.STUDENT,
    },
  });

  if (!student) {
    notFound();
  }

  return (
    <div>
      <p>
        <Link href="/students">← Back to students</Link>
      </p>
      <h1>Student detail</h1>
      <p>
        <Link href={`/students/${student.id}/edit`}>Edit user</Link>
      </p>
      <p>
        <strong>Name:</strong> {student.firstName} {student.lastName}
      </p>

      <p>
        <strong>Email:</strong> {student.email}
      </p>

      <p>
        <strong>Phone:</strong> {student.phone ?? "—"}
      </p>

      <p>
        <strong>Role:</strong> {student.role}
      </p>

      <p>
        <strong>Created at:</strong> {student.createdAt.toString()}
      </p>
    
    </div>
  );
}