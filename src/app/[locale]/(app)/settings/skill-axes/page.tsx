import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireTeacherAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import SkillAxesManager from "./SkillAxesManager";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function SkillAxesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { user } = await requireTeacherAuth();
  const t = await getTranslations("skillAxes");

  const axes = await prisma.skillAxis.findMany({
    where: { teacherId: user.id },
    orderBy: { order: "asc" },
    select: { id: true, label: true, order: true, isActive: true },
  });

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ margin: 0, fontSize: "1.375rem", fontWeight: 700, color: "#111827" }}>
          {t("title")}
        </h1>
        <p style={{ margin: "0.5rem 0 0", color: "#6b7280", fontSize: "0.9rem" }}>
          {t("subtitle")}
        </p>
      </div>

      <SkillAxesManager
        axes={axes}
        t={{
          addAxis: t("addAxis"),
          labelPlaceholder: t("labelPlaceholder"),
          add: t("add"),
          remove: t("remove"),
          noAxes: t("noAxes"),
          createDefaults: t("createDefaults"),
          active: t("active"),
          inactive: t("inactive"),
        }}
      />
    </div>
  );
}
