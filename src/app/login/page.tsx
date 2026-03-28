import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";
import styles from "./LoginForm.module.css";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/");

  return (
    <div className={styles.loginPage}>
      <LoginForm />
    </div>
  );
}
