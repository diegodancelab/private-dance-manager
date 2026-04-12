import { getSession } from "@/lib/auth/session";
import { redirect } from "@/lib/server-redirect";
import LoginForm from "./LoginForm";
import styles from "./LoginForm.module.css";

export default async function LoginPage() {
  const session = await getSession();
  if (session?.user.role === "TEACHER") return redirect("/");
  if (session?.user.role === "STUDENT") return redirect("/portal");

  return (
    <div className={styles.loginPage}>
      <LoginForm />
    </div>
  );
}
