import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/lib/server-redirect";
import { getSession } from "@/lib/auth/session";
import { chooseRole } from "@/lib/auth/choose-role-actions";
import { getTeachersForChooseRole } from "@/features/cross-enrollment/queries";
import styles from "./ChooseRolePage.module.css";

type Props = { params: Promise<{ locale: string }> };

export default async function ChooseRolePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();

  // Only dual-role teachers land here (TEACHER + activeRole=null after login).
  if (!session || session.user.role !== "TEACHER") return redirect("/login");
  if (session.activeRole !== null) {
    return redirect(session.activeRole === "STUDENT" ? "/portal" : "/");
  }

  const teachers = await getTeachersForChooseRole(session.user.id);
  if (teachers.length === 0) {
    // No longer enrolled — send to teacher app.
    return redirect("/");
  }

  const teacherNames = teachers
    .map((t) => `${t.firstName} ${t.lastName}`)
    .join(", ");

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            Bonjour {session.user.firstName} !
          </h1>
          <p className={styles.subtitle}>
            Vous avez accès à deux espaces. Lequel souhaitez-vous utiliser ?
          </p>
        </div>

        <div className={styles.cards}>
          <form action={chooseRole} className={styles.card}>
            <input type="hidden" name="role" value="TEACHER" />
            <div className={styles.cardIcon}>🏫</div>
            <h2 className={styles.cardTitle}>Espace professeur</h2>
            <p className={styles.cardDesc}>
              Gérez vos élèves, cours, paiements et planning.
            </p>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
              Continuer en tant que professeur
            </button>
          </form>

          <form action={chooseRole} className={styles.card}>
            <input type="hidden" name="role" value="STUDENT" />
            <div className={styles.cardIcon}>🎓</div>
            <h2 className={styles.cardTitle}>Espace élève</h2>
            <p className={styles.cardDesc}>
              Consultez vos cours et votre progression.
              <br />
              <span className={styles.cardHint}>Inscrit chez : {teacherNames}</span>
            </p>
            <button type="submit" className={`${styles.btn} ${styles.btnSecondary}`}>
              Continuer en tant qu&apos;élève
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
