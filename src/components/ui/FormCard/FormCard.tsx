import styles from "./FormCard.module.css";

type FormCardProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  maxWidth?: string;
  children: React.ReactNode;
};

export default function FormCard({
  eyebrow,
  title,
  subtitle,
  maxWidth = "980px",
  children,
}: FormCardProps) {
  return (
    <div className={styles.page} style={{ maxWidth }}>
      <div className={styles.card}>
        <div className={styles.header}>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <h1 className={styles.title}>{title}</h1>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>
        {children}
      </div>
    </div>
  );
}
