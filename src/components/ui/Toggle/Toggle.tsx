"use client";

import styles from "./Toggle.module.css";

type ToggleProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  description?: string;
};

export default function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <div className={styles.row}>
      {(label || description) && (
        <div className={styles.text}>
          {label && <span className={styles.label}>{label}</span>}
          {description && <span className={styles.desc}>{description}</span>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`${styles.toggle} ${checked ? styles.on : ""}`}
      />
    </div>
  );
}
