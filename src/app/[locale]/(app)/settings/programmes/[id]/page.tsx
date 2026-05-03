import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireTeacherAuth } from "@/lib/auth/require-auth";
import { getProgrammeDetail } from "@/features/programmes/queries";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import ProgrammeEditor from "@/features/programmes/components/ProgrammeEditor";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function ProgrammeDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const { user } = await requireTeacherAuth();
  const t = await getTranslations("programmes");

  const programme = await getProgrammeDetail(id, user.id);
  if (!programme) notFound();

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link
          href="/settings/programmes"
          style={{ display: "inline-block", fontSize: "0.85rem", color: "#6b7280", textDecoration: "none", marginBottom: "0.75rem" }}
        >
          {t("back")}
        </Link>
        <h1 style={{ margin: 0, fontSize: "1.375rem", fontWeight: 700, color: "#111827" }}>
          {programme.name}
        </h1>
        {(programme.danceStyle || programme.level) && (
          <p style={{ margin: "0.25rem 0 0", color: "#6b7280", fontSize: "0.875rem" }}>
            {[programme.danceStyle, programme.level].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>

      <ProgrammeEditor programme={programme} t={{
        name: t("name"),
        level: t("level"),
        danceStyle: t("danceStyle"),
        description: t("description"),
        namePlaceholder: t("namePlaceholder"),
        levelPlaceholder: t("levelPlaceholder"),
        danceStylePlaceholder: t("danceStylePlaceholder"),
        descriptionPlaceholder: t("descriptionPlaceholder"),
        save: t("save"),
        editProgramme: t("editProgramme"),
        deleteProgramme: t("deleteProgramme"),
        addSection: t("addSection"),
        sectionTitle: t("sectionTitle"),
        sectionTitlePlaceholder: t("sectionTitlePlaceholder"),
        sectionSubtitle: t("sectionSubtitle"),
        sectionSubtitlePlaceholder: t("sectionSubtitlePlaceholder"),
        sectionDescription: t("sectionDescription"),
        sectionDescriptionPlaceholder: t("sectionDescriptionPlaceholder"),
        deleteSection: t("deleteSection"),
        addItem: t("addItem"),
        itemName: t("itemName"),
        itemNameAlt: t("itemNameAlt"),
        itemNamePlaceholder: t("itemNamePlaceholder"),
        itemNameAltPlaceholder: t("itemNameAltPlaceholder"),
        itemDescription: t("itemDescription"),
        optional: t("optional"),
        mandatory: t("mandatory"),
        deleteItem: t("deleteItem"),
        noSections: t("noSections"),
      }} />
    </div>
  );
}
