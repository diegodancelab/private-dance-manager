"use client";

import { useState } from "react";
import SidebarNav from "./SidebarNav";
import styles from "./AppShell.module.css";

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            aria-label="Open navigation menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-sidebar"
          >
            ☰
          </button>

          <div className={styles.mobileTitle}>Private Dance Manager</div>
        </header>

        <main className={styles.content}>{children}</main>
      </div>

      {isMobileMenuOpen && (
        <>
          <button
            type="button"
            className={styles.overlay}
            onClick={closeMobileMenu}
            aria-label="Close navigation menu"
          />

          <aside
            id="mobile-sidebar"
            className={styles.mobileSidebar}
            aria-label="Mobile navigation"
          >
            <div className={styles.mobileSidebarHeader}>
              <span className={styles.mobileSidebarTitle}>Menu</span>
              <button
                type="button"
                onClick={closeMobileMenu}
                className={styles.closeButton}
                aria-label="Close navigation menu"
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