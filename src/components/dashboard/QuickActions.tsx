import Button from "@/components/ui/Button";
import styles from "./QuickActions.module.css";

export default function QuickActions() {
  return (
    <div className={styles.container}>
      <Button href="/lessons/new" size="sm">+ Create lesson</Button>
      <Button href="/students/new" size="sm">+ Add student</Button>
      <Button href="/payments/new" size="sm">+ Add payment</Button>
    </div>
  );
}
