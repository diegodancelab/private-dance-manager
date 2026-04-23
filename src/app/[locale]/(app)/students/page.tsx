import { getTranslations, setRequestLocale } from "next-intl/server";
import { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { requireTeacherAuth } from "@/lib/auth/require-auth";
import { Eye, Pencil } from "lucide-react";
import { getCrossEnrolledStudents } from "@/features/cross-enrollment/queries";
import styles from "./StudentsPage.module.css";

type Props = { params: Promise<{ locale: string }> };

export default async function StudentsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { user } = await requireTeacherAuth();
  const t = await getTranslations("students");
  const tCommon = await getTranslations("common");

  const [students, crossEnrolled] = await Promise.all([
    prisma.user.findMany({
      where: { role: UserRole.STUDENT, createdByTeacherId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    getCrossEnrolledStudents(user.id),
  ]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>
        </div>

        <div className={styles.headerActions}>
          <Link href="/students/new" className={styles.btnAdd}>
            {t("addStudent")}
          </Link>
        </div>
      </div>

      {/* ── Regular students ─────────────────────────────────────────────────── */}
      {students.length === 0 && crossEnrolled.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>{t("noStudentsTitle")}</p>
          <p className={styles.emptySubtext}>{t("noStudentsSubtitle")}</p>
        </div>
      ) : (
        <>
          {(students.length > 0 || crossEnrolled.length > 0) && (
            <div className={styles.section}>
              {(students.length > 0 || crossEnrolled.length > 0) && (
                <h2 className={styles.sectionTitle}>
                  Élèves actifs
                  <span className={styles.sectionBadge}>
                    {students.length + crossEnrolled.length}
                  </span>
                </h2>
              )}
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
                        <td className={styles.tableCell} data-label={t("colName")}>
                          {student.firstName} {student.lastName}
                        </td>
                        <td className={styles.tableCell} data-label={t("colEmail")}>
                          {student.email ?? "—"}
                        </td>
                        <td className={styles.tableCell} data-label={t("colPhone")}>
                          {student.phone ?? "—"}
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.actions}>
                            <Link
                              href={`/students/${student.id}`}
                              className={styles.actionIconLink}
                              title={tCommon("view")}
                            >
                              <Eye size={16} />
                            </Link>
                            <Link
                              href={`/students/${student.id}/edit`}
                              className={styles.actionIconLink}
                              title={tCommon("edit")}
                            >
                              <Pencil size={16} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {crossEnrolled.map((enrolled) => (
                      <tr key={enrolled.relationId}>
                        <td className={styles.tableCell} data-label={t("colName")}>
                          <span className={styles.nameWithBadge}>
                            {enrolled.firstName} {enrolled.lastName}
                            <span className={styles.colleagueBadge}>Collègue</span>
                          </span>
                        </td>
                        <td className={styles.tableCell} data-label={t("colEmail")}>
                          {enrolled.email ?? "—"}
                        </td>
                        <td className={styles.tableCell} data-label={t("colPhone")}>
                          {enrolled.phone ?? "—"}
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.actions}>
                            <Link
                              href={`/students/${enrolled.userId}`}
                              className={styles.actionIconLink}
                              title={tCommon("view")}
                            >
                              <Eye size={16} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}
