"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import SidebarNav from "./SidebarNav";
import styles from "./AppShell.module.css";

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useTranslations("navigation");

  function openMobileMenu() {
    setIsMobileMenuOpen(true);
  }

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  return (
    <div className={styles.container}>
      <aside className={styles.desktopSidebar}>
        <SidebarNav />
      </aside>

      <div className={styles.mainArea}>
        <header className={styles.mobileHeader}>
          <button
            type="button"
            onClick={openMobileMenu}
            className={styles.menuButton}
            aria-label={t("openMenu")}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-sidebar"
          >
            ☰
          </button>

          <div className={styles.mobileTitle}>{t("brand")}</div>
        </header>

        <main className={styles.content}>{children}</main>
      </div>

      {isMobileMenuOpen && (
        <>
          <button
            type="button"
            className={styles.overlay}
            onClick={closeMobileMenu}
            aria-label={t("closeMenu")}
          />

          <aside
            id="mobile-sidebar"
            className={styles.mobileSidebar}
            aria-label="Mobile navigation"
          >
            <div className={styles.mobileSidebarHeader}>
              <span className={styles.mobileSidebarTitle}>{t("menu")}</span>
              <button
                type="button"
                onClick={closeMobileMenu}
                className={styles.closeButton}
                aria-label={t("closeMenu")}
              >
                ✕
              </button>
            </div>

            <SidebarNav onNavigate={closeMobileMenu} />
          </aside>
        </>
      )}
    </div>
  );
}
