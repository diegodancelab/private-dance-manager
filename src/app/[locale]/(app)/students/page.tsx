import { getTranslations } from "next-intl/server";
import { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import Button from "@/components/ui/Button";
import styles from "./StudentsPage.module.css";

export default async function StudentsPage() {
  const { user } = await requireAuth();
  const t = await getTranslations("students");
  const tCommon = await getTranslations("common");

  const students = await prisma.user.findMany({
    where: {
      role: UserRole.STUDENT,
      createdByTeacherId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>
        </div>

        <Button href="/students/new" size="sm">{t("addStudent")}</Button>
      </div>

      {students.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>{t("noStudentsTitle")}</p>
          <p className={styles.emptySubtext}>{t("noStudentsSubtitle")}</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeadCell}>{t("colName")}</th>
                <th className={styles.tableHeadCell}>{t("colEmail")}</th>
                <th className={styles.tableHeadCell}>{t("colPhone")}</th>
                <th className={styles.tableHeadCell}></th>
              </tr>
            </thead>

            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td className={styles.tableCell}>
                    {student.firstName} {student.lastName}
                  </td>

                  <td className={styles.tableCell}>{student.email ?? "—"}</td>

                  <td className={styles.tableCell}>{student.phone ?? "—"}</td>

                  <td className={styles.tableCell}>
                    <div className={styles.actions}>
                      <Link
                        href={`/students/${student.id}`}
                        className={styles.actionLink}
                      >
                        {tCommon("view")}
                      </Link>
                      <Link
                        href={`/students/${student.id}/edit`}
                        className={styles.actionLink}
                      >
                        {tCommon("edit")}
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
