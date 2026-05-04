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
  GraduationCap,
  Layers,
  type LucideIcon,
} from "lucide-react";
import styles from "./SidebarNav.module.css";

const navItems: { href: string; labelKey: string; Icon: LucideIcon; matchPrefix?: string }[] = [
  { href: "/", labelKey: "dashboard", Icon: LayoutDashboard },
  { href: "/calendar", labelKey: "calendar", Icon: CalendarDays },
  { href: "/lessons", labelKey: "lessons", Icon: BookOpen },
  { href: "/students", labelKey: "students", Icon: Users },
  { href: "/packages", labelKey: "packages", Icon: Package },
  { href: "/charges", labelKey: "charges", Icon: Receipt },
  { href: "/payments", labelKey: "payments", Icon: Wallet },
  { href: "/settings/programmes", labelKey: "programmes", Icon: GraduationCap, matchPrefix: "/settings/programmes" },
  { href: "/settings/levels", labelKey: "levels", Icon: Layers, matchPrefix: "/settings/levels" },
  { href: "/settings/skill-axes", labelKey: "settings", Icon: Settings, matchPrefix: "/settings/skill-axes" },
];

type SidebarNavProps = {
  isDualRole?: boolean;
  userName?: string;
  userEmail?: string;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default function SidebarNav({ isDualRole = false, userName, userEmail }: SidebarNavProps) {
  const pathname = usePathname();
  const t = useTranslations("navigation");
  const initials = userName ? getInitials(userName) : "?";

  return (
    <div className={styles.sidebar}>
      <div className={styles.brand}>
        <h1 className={styles.logo}>{t("brand")}</h1>
      </div>

      {userName && (
        <div className={styles.userBlock}>
          <div className={styles.userAvatar}>{initials}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{userName}</span>
            {userEmail && <span className={styles.userEmail}>{userEmail}</span>}
          </div>
        </div>
      )}

      <nav className={styles.nav} aria-label="Main navigation">
        {navItems.map(({ href, labelKey, Icon, matchPrefix }) => {
          const prefix = matchPrefix ?? href;
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(prefix);

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
