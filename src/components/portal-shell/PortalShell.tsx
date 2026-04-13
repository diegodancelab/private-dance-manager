"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { logout } from "@/lib/auth/actions";
import { switchActiveRole } from "@/lib/auth/choose-role-actions";
import styles from "./PortalShell.module.css";

type PortalShellProps = {
  children: React.ReactNode;
  studentName: string;
  isDualRole?: boolean;
};

export default function PortalShell({ children, studentName, isDualRole = false }: PortalShellProps) {
  const t = useTranslations("portal.nav");
  const pathname = usePathname();

  const navLinks = [
    { href: "/portal", label: t("dashboard") },
    { href: "/portal/lessons", label: t("lessons") },
    { href: "/portal/progression", label: t("progression") },
    { href: "/portal/profile", label: t("profile") },
  ];

  function isActive(href: string): boolean {
    if (href === "/portal") return pathname === "/portal";
    return pathname.startsWith(href);
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.brand}>Private Dance Manager</span>
          <span className={styles.studentName}>{studentName}</span>
        </div>

        <nav className={styles.nav} aria-label="Portal navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${isActive(link.href) ? styles.navLinkActive : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        {isDualRole && (
          <form action={switchActiveRole} className={styles.switchForm}>
            <input type="hidden" name="targetRole" value="TEACHER" />
            <button type="submit" className={styles.switchBtn}>
              Espace professeur
            </button>
          </form>
        )}
        <form action={logout}>
          <button type="submit" className={styles.logoutBtn}>
            {t("logout")}
          </button>
        </form>
      </footer>
    </div>
  );
}
