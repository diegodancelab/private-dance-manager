import styles from "./FormField.module.css";

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  error?: string;
  fullWidth?: boolean;
  children: React.ReactNode;
};

export default function FormField({
  label,
  htmlFor,
  error,
  fullWidth,
  children,
}: FormFieldProps) {
  return (
    <div className={`${styles.field} ${fullWidth ? styles.fullWidth : ""}`}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
}
