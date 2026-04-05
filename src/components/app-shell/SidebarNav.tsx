"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { logout } from "@/lib/auth/actions";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import styles from "./SidebarNav.module.css";

type SidebarNavProps = {
  onNavigate?: () => void;
};

const navItems = [
  { href: "/", labelKey: "dashboard" },
  { href: "/calendar", labelKey: "calendar" },
  { href: "/lessons", labelKey: "lessons" },
  { href: "/students", labelKey: "students" },
  { href: "/packages", labelKey: "packages" },
  { href: "/charges", labelKey: "charges" },
  { href: "/payments", labelKey: "payments" },
] as const;

export default function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const t = useTranslations("navigation");

  return (
    <div className={styles.sidebar}>
      <div className={styles.brand}>
        <h1 className={styles.logo}>{t("brand")}</h1>
        <p className={styles.subtitle}>{t("subtitle")}</p>
      </div>

      <nav className={styles.nav} aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`${styles.link} ${isActive ? styles.active : ""}`}
            >
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      <div className={styles.bottomSection}>
        <LanguageSwitcher />
        <form action={logout} className={styles.logoutForm}>
          <button type="submit" className={styles.logoutButton}>
            {t("logout")}
          </button>
        </form>
      </div>
    </div>
  );
}
