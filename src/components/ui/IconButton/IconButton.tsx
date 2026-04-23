import styles from "./IconButton.module.css";

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  dot?: boolean;
};

export default function IconButton({ dot = false, className, children, ...props }: IconButtonProps) {
  return (
    <button {...props} className={`${styles.btn} ${className ?? ""}`}>
      {children}
      {dot && <span className={styles.dot} />}
    </button>
  );
}
