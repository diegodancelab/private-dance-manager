"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./SidebarNav.module.css";

type SidebarNavProps = {
  onNavigate?: () => void;
};

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/calendar", label: "Calendar" },
  { href: "/lessons", label: "Lessons" },
  { href: "/students", label: "Students" },
  { href: "/packages", label: "Packages" },
  { href: "/charges", label: "Charges" },
  { href: "/payments", label: "Payments" },
];

export default function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <div className={styles.sidebar}>
      <div className={styles.brand}>
        <h1 className={styles.logo}>Private Dance Manager</h1>
        <p className={styles.subtitle}>Teacher dashboard</p>
      </div>

      <nav className={styles.nav} aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`${styles.link} ${isActive ? styles.active : ""}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}