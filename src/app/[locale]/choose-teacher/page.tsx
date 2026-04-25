import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/lib/server-redirect";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { selectTeacherSpace } from "@/lib/auth/choose-teacher-actions";
import styles from "@/app/[locale]/choose-role/ChooseRolePage.module.css";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ids?: string }>;
};

export default async function ChooseTeacherPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { ids } = await searchParams;
  setRequestLocale(locale);

  // Already logged in → skip.
  const session = await getSession();
  if (session?.user.role === "STUDENT") return redirect("/portal");
  if (session?.user.role === "TEACHER") return redirect("/");

  const userIds = ids ? ids.split(",").filter(Boolean) : [];
  if (userIds.length < 2) return redirect("/login");

  const students = await prisma.user.findMany({
    where: {
      id: { in: userIds },
      role: "STUDENT",
      isActive: true,
      portalActivatedAt: { not: null },
    },
    select: {
      id: true,
      firstName: true,
      createdByTeacher: { select: { firstName: true, lastName: true } },
    },
  });

  if (students.length < 2) return redirect("/login");

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Bonjour {students[0].firstName} !</h1>
          <p className={styles.subtitle}>
            Plusieurs professeurs vous ont donné accès au portail. Quel espace souhaitez-vous consulter ?
          </p>
        </div>

        <div className={styles.cards}>
          {students.map((student) => {
            const teacher = student.createdByTeacher;
            const teacherName = teacher
              ? `${teacher.firstName} ${teacher.lastName}`
              : "Professeur";
            return (
              <form key={student.id} action={selectTeacherSpace} style={{ display: "contents" }}>
                <input type="hidden" name="userId" value={student.id} />
                <div className={styles.card}>
                  <div className={styles.cardIcon}>🎓</div>
                  <h2 className={styles.cardTitle}>{teacherName}</h2>
                  <p className={styles.cardDesc}>
                    Consultez vos cours et votre progression avec ce professeur.
                  </p>
                  <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                    Accéder à cet espace
                  </button>
                </div>
              </form>
            );
          })}
        </div>
      </div>
    </div>
  );
}
