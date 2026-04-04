import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/client";
import { requireAuth } from "@/lib/auth/require-auth";
import PackageCreateForm from "./PackageCreateForm";

type Props = {
  searchParams: Promise<{
    userId?: string;
  }>;
};

export default async function NewPackagePage({ searchParams }: Props) {
  const { user } = await requireAuth();
  const { userId } = await searchParams;

  const students = await prisma.user.findMany({
    where: { role: UserRole.STUDENT, createdByTeacherId: user.id },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    },
  });

  return <PackageCreateForm students={students} defaultUserId={userId} />;
}
