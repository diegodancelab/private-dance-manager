import styles from "./Badge.module.css";

type BadgeProps = {
  variant?: "neutral" | "primary" | "success" | "warning" | "info";
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
};

export default function Badge({ variant = "neutral", dot = false, children, className }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${className ?? ""}`}>
      {dot && <span className={styles.dot} />}
      {children}
    </span>
  );
}
