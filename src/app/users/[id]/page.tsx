import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function UserDetailPage({ params }: Props) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div>
      <h1>User detail</h1>
      <p>
  <Link href={`/users/${user.id}/edit`}>Edit user</Link>
</p>

      <p>
        <strong>Name:</strong> {user.firstName} {user.lastName}
      </p>

      <p>
        <strong>Email:</strong> {user.email}
      </p>

      <p>
        <strong>Phone:</strong> {user.phone ?? "—"}
      </p>

      <p>
        <strong>Role:</strong> {user.role}
      </p>

      <p>
        <strong>Created at:</strong> {user.createdAt.toString()}
      </p>
    </div>
  );
}