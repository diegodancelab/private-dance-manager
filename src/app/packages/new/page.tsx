import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/client";
import PackageCreateForm from "./PackageCreateForm";

export default async function NewPackagePage() {
  const students = await prisma.user.findMany({
    where: { role: UserRole.STUDENT },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    },
  });

  return <PackageCreateForm students={students} />;
}
