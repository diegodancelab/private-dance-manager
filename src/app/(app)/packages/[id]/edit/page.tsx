import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { utcToZurichDate } from "@/lib/dates";
import { requireAuth } from "@/lib/auth/require-auth";
import type { PackageFormState } from "../../form-state";
import PackageEditForm from "./PackageEditForm";

type Props = {
  params: Promise<{ id: string }>;
};


export default async function EditPackagePage({ params }: Props) {
  const { id } = await params;
  const { user } = await requireAuth();

  const pkg = await prisma.package.findFirst({
    where: { id, teacherId: user.id },
    select: {
      id: true,
      name: true,
      totalMinutes: true,
      expiresAt: true,
    },
  });

  if (!pkg) notFound();

  const initialState: PackageFormState = {
    success: false,
    message: "",
    fields: {
      id: pkg.id,
      userId: "",
      name: pkg.name,
      totalHours: String(pkg.totalMinutes / 60),
      amount: "",
      currency: "CHF",
      expiresAt: pkg.expiresAt ? utcToZurichDate(pkg.expiresAt) : "",
    },
    errors: {},
  };

  return <PackageEditForm initialState={initialState} />;
}
