import { getLabel, getBadgeVariant } from "@/lib/labels";
import styles from "./StatusBadge.module.css";

type Props = {
  status: string;
};

export default function StatusBadge({ status }: Props) {
  const label = getLabel(status);
  const variant = getBadgeVariant(status);
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>{label}</span>
  );
}
