import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireStudentAuth } from "@/lib/auth/require-auth";
import { getStudentProgrammeForPortal } from "@/features/programmes/queries";
import PortalProgrammeView from "@/features/programmes/components/PortalProgrammeView";

type Props = { params: Promise<{ locale: string }> };

export default async function PortalProgrammePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { user } = await requireStudentAuth();
  const t = await getTranslations("programmes");

  const studentProgramme = await getStudentProgrammeForPortal(user.id);

  const subtitle = studentProgramme
    ? t("portalSubtitle", { teacher: studentProgramme.teacherName })
    : "";

  return (
    <PortalProgrammeView
      studentProgramme={studentProgramme}
      t={{
        portalTitle: t("portalTitle"),
        portalSubtitle: subtitle,
        portalNoProgram: t("portalNoProgram"),
        progress: t("progress"),
        NOT_STARTED: t("NOT_STARTED"),
        INTRODUCED: t("INTRODUCED"),
        IN_PROGRESS: t("IN_PROGRESS"),
        MASTERED: t("MASTERED"),
        optional: t("optional"),
      }}
    />
  );
}
