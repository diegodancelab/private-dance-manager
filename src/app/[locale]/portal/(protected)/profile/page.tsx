import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireStudentAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import PortalPasswordForm from "./PortalPasswordForm";
import styles from "./PortalProfile.module.css";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PortalProfilePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { user } = await requireStudentAuth();
  const t = await getTranslations("portal.profile");

  const student = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    },
  });

  if (!student) return null;

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>{t("title")}</h1>

      {/* Read-only profile */}
      <section className={styles.section}>
        <dl className={styles.infoList}>
          <div className={styles.infoRow}>
            <dt className={styles.infoLabel}>{t("firstName")}</dt>
            <dd className={styles.infoValue}>{student.firstName}</dd>
          </div>
          <div className={styles.infoRow}>
            <dt className={styles.infoLabel}>{t("lastName")}</dt>
            <dd className={styles.infoValue}>{student.lastName}</dd>
          </div>
          {student.email && (
            <div className={styles.infoRow}>
              <dt className={styles.infoLabel}>{t("email")}</dt>
              <dd className={styles.infoValue}>{student.email}</dd>
            </div>
          )}
          {student.phone && (
            <div className={styles.infoRow}>
              <dt className={styles.infoLabel}>{t("phone")}</dt>
              <dd className={styles.infoValue}>{student.phone}</dd>
            </div>
          )}
        </dl>
      </section>

      {/* Change password */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("changePassword")}</h2>
        <PortalPasswordForm
          labels={{
            currentPassword: t("currentPassword"),
            newPassword: t("newPassword"),
            confirmPassword: t("confirmPassword"),
            save: t("save"),
            passwordUpdated: t("passwordUpdated"),
          }}
        />
      </section>
    </div>
  );
}
