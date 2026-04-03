import Link from "next/link";
import styles from "./Button.module.css";

type BaseProps = {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md";
  className?: string;
  children: React.ReactNode;
};

type AsButton = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    href?: undefined;
    isPending?: boolean;
    pendingLabel?: string;
  };

type AsLink = BaseProps & {
  href: string;
};

type ButtonProps = AsButton | AsLink;

export default function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", className, children } = props;
  const cls = `${styles.button} ${styles[variant]} ${styles[size]} ${className ?? ""}`;

  if (props.href !== undefined) {
    return (
      <Link href={props.href} className={cls}>
        {children}
      </Link>
    );
  }

  const { isPending, pendingLabel, disabled, ...rest } = props as AsButton;
  return (
    <button {...rest} disabled={disabled ?? isPending} className={cls}>
      {isPending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
