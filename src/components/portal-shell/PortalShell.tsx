"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { logout } from "@/lib/auth/actions";
import { switchActiveRole } from "@/lib/auth/choose-role-actions";
import Avatar from "@/components/ui/Avatar/Avatar";
import IconButton from "@/components/ui/IconButton/IconButton";
import {
  LayoutDashboard,
  Calendar,
  TrendingUp,
  GraduationCap,
  User,
  Search,
  Bell,
  HelpCircle,
  Menu,
  ChevronDown,
  LogOut,
  ArrowLeftRight,
} from "lucide-react";
import styles from "./PortalShell.module.css";

type PortalShellProps = {
  children: React.ReactNode;
  studentName: string;
  studentEmail: string;
  isDualRole?: boolean;
};

export default function PortalShell({
  children,
  studentName,
  studentEmail,
  isDualRole = false,
}: PortalShellProps) {
  const t = useTranslations("portal.nav");
  const tTopbar = useTranslations("portal.topbar");
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems = [
    { href: "/portal", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/portal/lessons", label: t("lessons"), icon: Calendar },
    { href: "/portal/progression", label: t("progression"), icon: TrendingUp },
    { href: "/portal/programme", label: t("programme"), icon: GraduationCap },
    { href: "/portal/profile", label: t("profile"), icon: User },
  ];

  function isActive(href: string) {
    if (href === "/portal") return pathname === "/portal";
    return pathname.startsWith(href);
  }

  const initials = studentName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const activeLabel = navItems.find((item) => isActive(item.href))?.label ?? "";

  return (
    <div className={styles.app}>
      {/* Backdrop (mobile) */}
      {sidebarOpen && (
        <div className={styles.backdrop} onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.brand}>
          <div className={styles.brandLogo}>P</div>
          <div>
            <div className={styles.brandName}>DanceDesk</div>
            <div className={styles.brandSub}>{tTopbar("area")}</div>
          </div>
        </div>

        <div className={styles.navLabel}>Menu</div>
        <nav className={styles.nav}>
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`${styles.navItem} ${isActive(href) ? styles.navItemActive : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        {/* User card + menu */}
        <div className={styles.sidebarFooter}>
          <div className={styles.userCard} onClick={() => setUserMenuOpen((v) => !v)}>
            <Avatar initials={initials} size="md" gradient="warm" />
            <div className={styles.userInfo}>
              <div className={styles.userName}>{studentName}</div>
              <div className={styles.userEmail}>{studentEmail}</div>
            </div>
            <ChevronDown size={16} className={styles.chevron} />
          </div>

          {userMenuOpen && (
            <div className={styles.userMenu}>
              <Link href="/portal/profile" className={styles.userMenuItem} onClick={() => setUserMenuOpen(false)}>
                <User size={15} />
                {t("profile")}
              </Link>
              {isDualRole && (
                <form action={switchActiveRole}>
                  <input type="hidden" name="targetRole" value="TEACHER" />
                  <button type="submit" className={styles.userMenuItem}>
                    <ArrowLeftRight size={15} />
                    Espace professeur
                  </button>
                </form>
              )}
              <form action={logout}>
                <button type="submit" className={`${styles.userMenuItem} ${styles.userMenuItemDanger}`}>
                  <LogOut size={15} />
                  {t("logout")}
                </button>
              </form>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <div className={styles.main}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <button className={styles.burgerBtn} onClick={() => setSidebarOpen(true)} aria-label="Menu">
            <Menu size={18} />
          </button>
          <div>
            <div className={styles.topbarCrumb}>{tTopbar("area")}</div>
            <div className={styles.topbarTitle}>{activeLabel}</div>
          </div>
          <div className={styles.topbarSpacer} />
          <span style={{ display: "none" }}><IconButton title={tTopbar("search")}><Search size={18} /></IconButton></span>
          <IconButton title={tTopbar("notifications")} dot><Bell size={18} /></IconButton>
          <span style={{ display: "none" }}><IconButton title={tTopbar("help")}><HelpCircle size={18} /></IconButton></span>
        </header>

        {/* Content */}
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
