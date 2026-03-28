import { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/require-auth";
import styles from "./StudentsPage.module.css";

export default async function StudentsPage() {
  const { user } = await requireAuth();

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
          <h1 className={styles.title}>Students</h1>
          <p className={styles.subtitle}>Manage your students and their contact information.</p>
        </div>

        <Link href="/students/new" className={styles.createLink}>
          Add student
        </Link>
      </div>

      {students.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No students yet.</p>
          <p className={styles.emptySubtext}>Add your first student to get started.</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeadCell}>Name</th>
                <th className={styles.tableHeadCell}>Email</th>
                <th className={styles.tableHeadCell}>Phone</th>
                <th className={styles.tableHeadCell}>Actions</th>
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
                        View
                      </Link>
                      <Link
                        href={`/students/${student.id}/edit`}
                        className={styles.actionLink}
                      >
                        Edit
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
