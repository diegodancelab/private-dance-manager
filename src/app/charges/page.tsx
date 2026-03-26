import { prisma } from "@/lib/prisma";
import Link from "next/link";
import styles from "./ChargesPage.module.css";

function formatAmount(amount: string | number, currency: string) {
  return `${amount} ${currency}`;
}

export default async function ChargesPage() {
  const charges = await prisma.charge.findMany({
    include: {
      user: true,
      lesson: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <h1 className={styles.title}>Charges</h1>
          <p className={styles.subtitle}>Track what is owed by each student.</p>
        </div>

        <Link href="/charges/new" className={styles.createLink}>
          Add charge
        </Link>
      </div>

      {charges.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No charges yet.</p>
          <p className={styles.emptySubtext}>Create your first charge to start tracking payments.</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeadCell}>Student</th>
                <th className={styles.tableHeadCell}>Title</th>
                <th className={styles.tableHeadCell}>Amount</th>
                <th className={styles.tableHeadCell}>Status</th>
                <th className={styles.tableHeadCell}>Lesson</th>
                <th className={styles.tableHeadCell}>Created</th>
                <th className={styles.tableHeadCell}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {charges.map((charge) => (
                <tr key={charge.id}>
                  <td className={styles.tableCell}>
                    {charge.user.firstName} {charge.user.lastName}
                  </td>

                  <td className={styles.tableCell}>{charge.title}</td>

                  <td className={styles.tableCell}>
                    {formatAmount(charge.amount.toString(), charge.currency)}
                  </td>

                  <td className={styles.tableCell}>{charge.status}</td>

                  <td className={styles.tableCell}>
                    {charge.lesson ? charge.lesson.title : "—"}
                  </td>

                  <td className={styles.tableCell}>
                    {charge.createdAt.toLocaleDateString("fr-CH")}
                  </td>

                  <td className={styles.tableCell}>
                    <div className={styles.actions}>
                      <Link
                        href={`/charges/${charge.id}`}
                        className={styles.actionLink}
                      >
                        View
                      </Link>
                      <Link
                        href={`/charges/${charge.id}/edit`}
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
