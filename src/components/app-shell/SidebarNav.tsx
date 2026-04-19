"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { logout } from "@/lib/auth/actions";
import { switchActiveRole } from "@/lib/auth/choose-role-actions";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher/LanguageSwitcher";
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  Users,
  Package,
  Receipt,
  Wallet,
  Settings,
  type LucideIcon,
} from "lucide-react";
import styles from "./SidebarNav.module.css";

const navItems: { href: string; labelKey: string; Icon: LucideIcon }[] = [
  { href: "/", labelKey: "dashboard", Icon: LayoutDashboard },
  { href: "/calendar", labelKey: "calendar", Icon: CalendarDays },
  { href: "/lessons", labelKey: "lessons", Icon: BookOpen },
  { href: "/students", labelKey: "students", Icon: Users },
  { href: "/packages", labelKey: "packages", Icon: Package },
  { href: "/charges", labelKey: "charges", Icon: Receipt },
  { href: "/payments", labelKey: "payments", Icon: Wallet },
  { href: "/settings/skill-axes", labelKey: "settings", Icon: Settings },
];

export default function SidebarNav({ isDualRole = false }: { isDualRole?: boolean }) {
  const pathname = usePathname();
  const t = useTranslations("navigation");

  return (
    <div className={styles.sidebar}>
      <div className={styles.brand}>
        <h1 className={styles.logo}>{t("brand")}</h1>
        <p className={styles.subtitle}>{t("subtitle")}</p>
      </div>

      <nav className={styles.nav} aria-label="Main navigation">
        {navItems.map(({ href, labelKey, Icon }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`${styles.link} ${isActive ? styles.active : ""}`}
            >
              <Icon size={18} strokeWidth={1.75} />
              {t(labelKey)}
            </Link>
          );
        })}
      </nav>

      <div className={styles.bottomSection}>
        {isDualRole && (
          <form action={switchActiveRole} className={styles.switchForm}>
            <input type="hidden" name="targetRole" value="STUDENT" />
            <button type="submit" className={styles.switchButton}>
              {t("switchToStudent")}
            </button>
          </form>
        )}
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
