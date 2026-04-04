import { getBadgeVariant } from "@/lib/labels";
import styles from "./StatusBadge.module.css";

type Props = {
  status: string;
  label: string;
};

export default function StatusBadge({ status, label }: Props) {
  const variant = getBadgeVariant(status);
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>{label}</span>
  );
}
