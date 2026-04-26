import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import PortalSetupForm from "./PortalSetupForm";
import styles from "@/app/[locale]/login/LoginForm.module.css";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function PortalSetupPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { token } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations("portal.setup");

  // Validate token existence early to show a clear error page without a form.
  const isTokenValid =
    !!token &&
    !!(await prisma.portalInvitation.findUnique({
      where: { token },
      select: { usedAt: true, expiresAt: true },
    }).then((inv) => inv && !inv.usedAt && inv.expiresAt > new Date()));

  if (!token || !isTokenValid) {
    return (
      <div className={styles.loginPage}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>DanceDesk</h1>
            <p className={styles.subtitle}>{t("tokenExpired")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.loginPage}>
      <PortalSetupForm
        token={token}
        title={t("title")}
        subtitle={t("subtitle")}
        labelPassword={t("password")}
        labelConfirm={t("confirmPassword")}
        submitLabel={t("submit")}
      />
    </div>
  );
}
