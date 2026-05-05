import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireStudentAuth } from "@/lib/auth/require-auth";
import { getStudentProgrammesForPortal } from "@/features/programmes/queries";
import PortalProgrammeView from "@/features/programmes/components/PortalProgrammeView";

type Props = { params: Promise<{ locale: string }> };

export default async function PortalProgrammePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { user } = await requireStudentAuth();
  const t = await getTranslations("programmes");

  const studentProgrammes = await getStudentProgrammesForPortal(user.id);

  return (
    <PortalProgrammeView
      studentProgrammes={studentProgrammes}
      t={{
        portalTitle: t("portalTitle"),
        portalSubtitle: t.raw("portalSubtitle") as string,
        portalNoProgram: t("portalNoProgram"),
        progress: t.raw("progress") as string,
        NOT_STARTED: t("NOT_STARTED"),
        INTRODUCED: t("INTRODUCED"),
        IN_PROGRESS: t("IN_PROGRESS"),
        MASTERED: t("MASTERED"),
        optional: t("optional"),
      }}
    />
  );
}
