import styles from "./Input.module.css";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export default function Input({ invalid = false, className, ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`${styles.input} ${invalid ? styles.invalid : ""} ${className ?? ""}`}
    />
  );
}
