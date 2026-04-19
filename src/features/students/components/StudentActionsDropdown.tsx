"use client";

import { useState, useRef, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { ChevronDown, BookOpen, CreditCard, Receipt, Package } from "lucide-react";
import styles from "./StudentActionsDropdown.module.css";

type Action = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

type Props = {
  studentId: string;
  labels: {
    trigger: string;
    addLesson: string;
    addPayment: string;
    addCharge: string;
    addPackage: string;
  };
};

export default function StudentActionsDropdown({ studentId, labels }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const actions: Action[] = [
    { label: labels.addLesson, href: `/lessons/new?studentId=${studentId}`, icon: <BookOpen size={15} /> },
    { label: labels.addPayment, href: `/payments/new?userId=${studentId}`, icon: <CreditCard size={15} /> },
    { label: labels.addCharge, href: `/charges/new?userId=${studentId}`, icon: <Receipt size={15} /> },
    { label: labels.addPackage, href: `/packages/new?userId=${studentId}`, icon: <Package size={15} /> },
  ];

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {labels.trigger}
        <ChevronDown size={14} className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} />
      </button>

      {open && (
        <div className={styles.menu} role="menu">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={styles.menuItem}
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              {action.icon}
              {action.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
