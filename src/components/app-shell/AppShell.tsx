"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import SidebarNav from "./SidebarNav";
import styles from "./AppShell.module.css";

type AppShellProps = {
  children: React.ReactNode;
  isDualRole?: boolean;
  userName?: string;
  userEmail?: string;
};

export default function AppShell({ children, isDualRole = false, userName, userEmail }: AppShellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("navigation");
  const pathname = usePathname();

  // Close sidebar on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Scroll lock while sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div className={styles.container}>
      <aside className={styles.desktopSidebar}>
        <SidebarNav isDualRole={isDualRole} userName={userName} userEmail={userEmail} />
      </aside>

      <div className={styles.mainArea}>
        <header className={styles.mobileHeader}>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className={styles.menuButton}
            aria-label={t("openMenu")}
            aria-expanded={isOpen}
            aria-controls="mobile-sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect y="3" width="20" height="2" rx="1" fill="currentColor" />
              <rect y="9" width="20" height="2" rx="1" fill="currentColor" />
              <rect y="15" width="20" height="2" rx="1" fill="currentColor" />
            </svg>
          </button>

          <div className={styles.mobileTitle}>{t("brand")}</div>
        </header>

        <main className={styles.content}>{children}</main>
      </div>

      {/* Overlay — always rendered for CSS transition */}
      <button
        type="button"
        className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ""}`}
        onClick={() => setIsOpen(false)}
        aria-label={t("closeMenu")}
        tabIndex={isOpen ? 0 : -1}
      />

      {/* Mobile sidebar — always rendered for CSS transition */}
      <aside
        id="mobile-sidebar"
        className={`${styles.mobileSidebar} ${isOpen ? styles.mobileSidebarOpen : ""}`}
        aria-label="Mobile navigation"
        aria-hidden={!isOpen}
      >
        <div className={styles.mobileSidebarHeader}>
          <span className={styles.mobileSidebarTitle}>{t("menu")}</span>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className={styles.closeButton}
            aria-label={t("closeMenu")}
            tabIndex={isOpen ? 0 : -1}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M1 1L15 15M15 1L1 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <SidebarNav isDualRole={isDualRole} userName={userName} userEmail={userEmail} />
      </aside>
    </div>
  );
}
