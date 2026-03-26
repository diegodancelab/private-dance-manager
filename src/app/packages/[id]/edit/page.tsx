import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { PackageFormState } from "../../form-state";
import PackageEditForm from "./PackageEditForm";

type Props = {
  params: Promise<{ id: string }>;
};

function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function EditPackagePage({ params }: Props) {
  const { id } = await params;

  const pkg = await prisma.package.findUnique({
    where: { id },
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
      expiresAt: toDateInputValue(pkg.expiresAt),
    },
    errors: {},
  };

  return <PackageEditForm initialState={initialState} />;
}
