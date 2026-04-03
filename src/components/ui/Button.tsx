import styles from "./Button.module.css";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
  isPending?: boolean;
  pendingLabel?: string;
};

export default function Button({
  variant = "primary",
  isPending,
  pendingLabel,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled ?? isPending}
      className={`${styles.button} ${styles[variant]} ${className ?? ""}`}
    >
      {isPending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
