import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireStudentAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import Avatar from "@/components/ui/Avatar/Avatar";
import ProfileForm from "./ProfileForm";
import PreferencesForm from "./PreferencesForm";
import PortalPasswordForm from "./PortalPasswordForm";
import styles from "./PortalProfile.module.css";

type Props = { params: Promise<{ locale: string }> };

export default async function PortalProfilePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { user } = await requireStudentAuth();
  const t = await getTranslations("portal.profile");

  const student = await prisma.user.findUnique({
    where: { id: user.id },
    select: { firstName: true, lastName: true, email: true, phone: true, createdAt: true, notifLessonReminder: true, notifAssessment: true },
  });

  if (!student) return null;

  const initials = `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();
  const memberSince = student.createdAt.toLocaleDateString("fr-CH", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t("title")}</h1>
          <p className={styles.pageSubtitle}>{t("subtitle")}</p>
        </div>
      </div>

      <div className={styles.profileGrid}>
        {/* ── Left: identity card ── */}
        <div className={`${styles.card} ${styles.profileSide}`}>
          <Avatar initials={initials} size="lg" gradient="warm" />
          <div className={styles.profileName}>{student.firstName} {student.lastName}</div>
          <div className={styles.profileEmail}>{student.email ?? ""}</div>
          <button className={styles.btnChangePhoto} disabled>{t("changePhoto")}</button>
          <div className={styles.memberSince}>
            <div className={styles.memberSinceLabel}>{t("memberSince")}</div>
            <div className={styles.memberSinceValue}>{memberSince}</div>
          </div>
        </div>

        {/* ── Right: forms ── */}
        <div className={styles.profileForms}>
          {/* Personal info */}
          <div className={styles.card}>
            <div className={styles.fieldsetTitle}>{t("personalInfo")}</div>
            <div className={styles.fieldsetDesc}>{t("personalInfoDesc")}</div>
            <ProfileForm
              defaultValues={{
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email ?? "",
                phone: student.phone ?? "",
              }}
              labels={{
                firstName: t("firstName"),
                lastName: t("lastName"),
                email: t("email"),
                phone: t("phone"),
                save: t("save"),
                cancel: t("cancel"),
                saving: t("saving"),
                saved: t("saved"),
              }}
            />
          </div>

          {/* Preferences */}
          <div className={styles.card}>
            <div className={styles.fieldsetTitle}>{t("preferences")}</div>
            <div className={styles.fieldsetDesc}>{t("preferencesDesc")}</div>
            <PreferencesForm
              defaultValues={{
                notifLessonReminder: student.notifLessonReminder,
                notifAssessment: student.notifAssessment,
              }}
              labels={{
                prefEmailReminders: t("prefEmailReminders"),
                prefEmailRemindersDesc: t("prefEmailRemindersDesc"),
                prefAssessmentNotif: t("prefAssessmentNotif"),
                prefAssessmentNotifDesc: t("prefAssessmentNotifDesc"),
                prefNewsletter: t("prefNewsletter"),
                prefNewsletterDesc: t("prefNewsletterDesc"),
              }}
            />
          </div>

          {/* Security */}
          <div className={styles.card}>
            <div className={styles.fieldsetTitle}>{t("security")}</div>
            <div className={styles.fieldsetDesc}>{t("securityDesc")}</div>
            <PortalPasswordForm
              labels={{
                currentPassword: t("currentPassword"),
                newPassword: t("newPassword"),
                confirmPassword: t("confirmPassword"),
                save: t("save"),
                passwordUpdated: t("passwordUpdated"),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
