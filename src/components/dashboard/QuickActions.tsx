import Link from "next/link";
import styles from "./QuickActions.module.css";

export default function QuickActions() {
  return (
    <div className={styles.container}>
      <Link href="/lessons/new" className={styles.action}>
        + Create lesson
      </Link>
      <Link href="/students/new" className={styles.action}>
        + Add student
      </Link>
      <Link href="/payments/new" className={styles.action}>
        + Add payment
      </Link>
    </div>
  );
}
